import OpenAI from 'openai';
import { logger } from './logger.js';

interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

interface ProviderClient {
  generateContent(params: {
    model?: string;
    contents: string;
    config?: Record<string, unknown>;
    signal?: AbortSignal;
  }): Promise<{ text: string; model: string; usage?: AIUsage }>;
}

const DEFAULT_FALLBACK_MODELS = [
  'deepseek/deepseek-chat-v3-0324',
  'qwen/qwen3-235b-a22b',
  'anthropic/claude-sonnet-4',
];

class OpenRouterService implements ProviderClient {
  private client: OpenAI;
  private preferredModel: string;
  private fallbackModels: string[];
  private maxRetries: number;

  constructor(apiKey: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://openrouter.ai/api/v1',
      defaultHeaders: {
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
        'X-Title': 'Soma & Surya - AI Vedic Astrology',
      },
    });
    this.preferredModel = process.env.OPENROUTER_MODEL || DEFAULT_FALLBACK_MODELS[0];
    const envFallback = process.env.OPENROUTER_FALLBACK_MODELS;
    this.fallbackModels = envFallback
      ? envFallback.split(',').map(s => s.trim()).filter(Boolean)
      : DEFAULT_FALLBACK_MODELS;
    this.maxRetries = Math.max(1, parseInt(process.env.OPENROUTER_MAX_RETRIES || '3', 10));
  }

  async generateContent(params: {
    model?: string;
    contents: string;
    config?: Record<string, unknown>;
    signal?: AbortSignal;
  }): Promise<{ text: string; model: string; usage?: AIUsage }> {
    const modelsToTry = this.buildModelList(params.model);
    const systemInstruction = params.config?.systemInstruction as string | undefined;
    let lastError: Error | null = null;

    for (const model of modelsToTry) {
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
          if (systemInstruction) {
            messages.push({ role: 'system', content: systemInstruction });
          }
          messages.push({ role: 'user', content: params.contents });

          const response = await this.client.chat.completions.create(
            {
              model,
              messages,
              temperature: 0.7,
              max_tokens: 4096,
            },
            { signal: params.signal, timeout: 30000 },
          );

          const text = response.choices[0]?.message?.content || '';
          const usage = response.usage
            ? {
                promptTokens: response.usage.prompt_tokens,
                completionTokens: response.usage.completion_tokens,
                totalTokens: response.usage.total_tokens,
              }
            : undefined;

          logger.info({ model, provider: 'openrouter', usage }, 'OpenRouter AI response');

          return { text, model, usage };
        } catch (error) {
          lastError = error as Error;
          const status = (error as any)?.status;
          logger.warn({ error, model, attempt: attempt + 1, status }, `OpenRouter model "${model}" failed`);

          if (status === 400 || status === 401 || status === 403 || status === 404) break;

          if (attempt < this.maxRetries - 1) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }

    logger.error({ modelsTried: modelsToTry, error: lastError }, 'All OpenRouter models exhausted');
    throw lastError || new Error('All OpenRouter models exhausted');
  }

  async *streamContent(params: {
    model?: string;
    contents: string;
    systemInstruction?: string;
    signal?: AbortSignal;
  }): AsyncIterable<string> {
    const model = params.model || this.preferredModel;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    if (params.systemInstruction) {
      messages.push({ role: 'system', content: params.systemInstruction });
    }
    messages.push({ role: 'user', content: params.contents });

    const stream = await this.client.chat.completions.create(
      { model, messages, stream: true, temperature: 0.7, max_tokens: 4096 },
      { signal: params.signal, timeout: 60000 },
    );

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) yield content;
    }
  }

  private buildModelList(override?: string): string[] {
    if (override) return [override];
    const models = [this.preferredModel];
    for (const m of this.fallbackModels) {
      if (m !== this.preferredModel) models.push(m);
    }
    return models;
  }
}

function resolveProvider(): OpenRouterService {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }
  return new OpenRouterService(apiKey);
}

export async function generateAIResponse(prompt: string, systemInstruction?: string): Promise<{ text: string; provider: string; model: string }> {
  const provider = resolveProvider();
  const config: Record<string, unknown> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await provider.generateContent({ model: undefined, contents: prompt, config, signal: controller.signal });
    return { text: response.text, provider: 'openrouter', model: response.model };
  } catch (error) {
    logger.error({ error }, 'AI provider failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractJSON(text: string): string {
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) return braceMatch[0];
  return text.trim();
}

export async function generateStructuredJSON<T>(prompt: string, systemInstruction: string): Promise<T> {
  const provider = resolveProvider();
  const config: Record<string, unknown> = { systemInstruction };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await provider.generateContent({ model: undefined, contents: prompt, config, signal: controller.signal });
    const extracted = extractJSON(response.text || '{}');
    return JSON.parse(extracted) as T;
  } catch (error) {
    logger.error({ error }, 'Structured AI generation failed — returning empty result');
    return {} as T;
  } finally {
    clearTimeout(timeout);
  }
}

export async function* streamAIResponse(prompt: string, systemInstruction?: string, signal?: AbortSignal): AsyncIterable<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    yield 'OPENROUTER_API_KEY is not configured';
    return;
  }
  const service = new OpenRouterService(apiKey);
  yield* service.streamContent({ contents: prompt, systemInstruction, signal });
}
