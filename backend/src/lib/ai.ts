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

const FREE_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'mistralai/mistral-7b-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'microsoft/phi-3-mini-4k-instruct:free',
];

function calculateMaxTokens(contentLength: number): number {
  const base = 256;
  const perChar = Math.ceil(contentLength / 3);
  return Math.min(800, base + perChar);
}

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
    logger.info({
      preferredModel: this.preferredModel,
      fallbackModels: this.fallbackModels,
      maxRetries: this.maxRetries,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      appUrl: process.env.APP_URL || 'http://localhost:5173',
      baseURL: 'https://openrouter.ai/api/v1',
    }, 'OpenRouterService initialized');
  }

  async generateContent(params: {
    model?: string;
    contents: string;
    config?: Record<string, unknown>;
    signal?: AbortSignal;
  }): Promise<{ text: string; model: string; usage?: AIUsage }> {
    const modelsToTry = this.buildModelList(params.model);
    const systemInstruction = params.config?.systemInstruction as string | undefined;
    const maxTokens = params.config?.max_tokens
      ? (params.config.max_tokens as number)
      : calculateMaxTokens(params.contents.length);
    let lastError: Error | null = null;
    let hadCreditError = false;

    logger.info({ modelsToTry, hasSystemInstruction: !!systemInstruction, contentLength: params.contents.length, maxTokens }, 'generateContent starting');

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
              max_tokens: maxTokens,
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
          const errMsg = error instanceof Error ? error.message : String(error);
          const errStack = error instanceof Error ? error.stack : '';
          const status = (error as any)?.status;
          logger.warn({ errMsg, errStack, status, model, maxTokens, attempt: attempt + 1, maxRetries: this.maxRetries }, `OpenRouter model "${model}" attempt ${attempt + 1}/${this.maxRetries} failed`);

          if (status === 400 || status === 401 || status === 403 || status === 404) break;
          if (status === 402) {
            hadCreditError = true;
            break;
          }
          if (attempt < this.maxRetries - 1) {
            await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }

    const lastErrMsg = lastError instanceof Error ? lastError.message : String(lastError);
    const lastErrStack = lastError instanceof Error ? lastError.stack : '';
    logger.error({ modelsTried: modelsToTry, lastErrMsg, lastErrStack, hadCreditError }, 'All OpenRouter models exhausted');
    if (hadCreditError) {
      throw new Error('The AI service has run out of credits. Please try a different model or add credits to your OpenRouter account.');
    }
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

    const maxTokens = calculateMaxTokens(params.contents.length);
    logger.info({ model, contentLength: params.contents.length, maxTokens }, 'streamContent starting');

    const stream = await this.client.chat.completions.create(
      { model, messages, stream: true, temperature: 0.7, max_tokens: maxTokens },
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
      if (m !== this.preferredModel && !models.includes(m)) models.push(m);
    }
    for (const m of FREE_MODELS) {
      if (!models.includes(m)) models.push(m);
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
  const apiKey = process.env.OPENROUTER_API_KEY;
  const apiKeyPrefix = apiKey ? apiKey.substring(0, 8) + '...' : 'NOT SET';
  const modelName = process.env.OPENROUTER_MODEL || DEFAULT_FALLBACK_MODELS[0];
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  logger.info({
    apiKeyPrefix,
    modelName,
    appUrl,
    hasSystemInstruction: !!systemInstruction,
    promptLength: prompt.length,
  }, 'generateAIResponse starting');

  const provider = resolveProvider();
  const maxTokens = calculateMaxTokens(prompt.length);
  const config: Record<string, unknown> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  config.max_tokens = maxTokens;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await provider.generateContent({ model: undefined, contents: prompt, config, signal: controller.signal });
    logger.info({ model: response.model, textLength: response.text.length, maxTokens }, 'generateAIResponse succeeded');
    return { text: response.text, provider: 'openrouter', model: response.model };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : '';
    const errStatus = (error as any)?.status;
    logger.error({ errMsg, errStack, errStatus, apiKeyPrefix, modelName, maxTokens }, 'generateAIResponse failed');
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
    logger.error({ error }, 'Structured AI generation failed');
    throw error;
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
