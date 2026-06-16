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

const MAX_FREE_MODELS = 10;

const DEFAULT_FALLBACK_MODELS = [
  'deepseek/deepseek-chat',
  'qwen/qwen3-235b-a22b',
  'anthropic/claude-sonnet-4-20250514',
];

const FREE_MODELS = [
  'qwen/qwen3-coder:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-4-31b-it:free',
  'openai/gpt-oss-120b:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'openai/gpt-oss-20b:free',
  'z-ai/glm-4.5-air:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'google/gemma-4-26b-a4b-it:free',
  'moonshotai/kimi-k2.6:free',
  'nousresearch/hermes-3-llama-3.1-405b:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'poolside/laguna-xs.2:free',
  'poolside/laguna-m.1:free',
  'google/gemini-2.0-flash-exp:free',
  'cognitivecomputations/dolphin-mistral-24b-venice-edition:free',
  'minimax/minimax-m2.5:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-4k-instruct:free',
  'openrouter/free',
];

function calculateMaxTokens(contentLength: number): number {
  const base = 128;
  const perChar = Math.ceil(contentLength / 3);
  return Math.min(512, base + perChar);
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
    this.maxRetries = Math.max(1, parseInt(process.env.OPENROUTER_MAX_RETRIES || '1', 10));
    logger.info({
      preferredModel: this.preferredModel,
      fallbackModels: this.fallbackModels,
      maxRetries: this.maxRetries,
      hasApiKey: true,
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
    const perModelTimeout = (params.config?.requestTimeout as number) || 25000;
    let lastError: Error | null = null;
    let hadCreditError = false;

    logger.info({ modelsToTry, hasSystemInstruction: !!systemInstruction, contentLength: params.contents.length, maxTokens, perModelTimeout }, 'generateContent starting');

    const callWithTimeout = async (model: string): Promise<{ text: string; model: string; usage?: AIUsage }> => {
      const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: params.contents });
      const result = await Promise.race([
        this.client.chat.completions.create(
          { model, messages, temperature: 0.7, max_tokens: maxTokens },
          { signal: params.signal, timeout: perModelTimeout },
        ),
        new Promise<never>((_, reject) => {
          const timer = setTimeout(() => reject(new Error(`Model "${model}" timed out after ${perModelTimeout}ms`)), perModelTimeout);
          if (params.signal) {
            params.signal.addEventListener('abort', () => { clearTimeout(timer); reject(new Error('Request aborted')); }, { once: true });
          }
        }),
      ]);
      const text = result.choices[0]?.message?.content || '';
      const usage = result.usage
        ? { promptTokens: result.usage.prompt_tokens, completionTokens: result.usage.completion_tokens, totalTokens: result.usage.total_tokens }
        : undefined;
      logger.info({ model, provider: 'openrouter', usage }, 'OpenRouter AI response');
      return { text, model, usage };
    }

    for (const model of modelsToTry) {
      if (hadCreditError && !model.includes(':free')) continue;
      if (params.signal?.aborted) {
        lastError = new Error('Request aborted');
        break;
      }
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          return await callWithTimeout(model);
        } catch (error: unknown) {
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
          if (params.signal?.aborted) break;
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
    const modelsToTry = this.buildModelList(params.model, 5);
    const systemInstruction = params.systemInstruction;
    const maxTokens = calculateMaxTokens(params.contents.length);
    let lastError: Error | null = null;
    let hadCreditError = false;

    logger.info({
      modelsToTry,
      contentLength: params.contents.length,
      maxTokens,
      systemInstructionLength: systemInstruction?.length,
    }, 'streamContent starting');

    for (const model of modelsToTry) {
      if (hadCreditError && !model.includes(':free')) continue;
      if (params.signal?.aborted) {
        lastError = new Error('Request aborted');
        break;
      }
      try {
        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: systemInstruction });
        }
        messages.push({ role: 'user', content: params.contents });

        logger.info({ model }, 'streamContent attempting model');
        const stream = await this.client.chat.completions.create(
          { model, messages, stream: true, temperature: 0.7, max_tokens: maxTokens },
          { signal: params.signal, timeout: 10000 },
        );

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) yield content;
        }
        logger.info({ model }, 'streamContent succeeded');
        return;
      } catch (error: unknown) {
        lastError = error as Error;
        const errMsg = error instanceof Error ? error.message : String(error);
        const errStack = error instanceof Error ? error.stack : '';
        const status = (error as any)?.status;
        const errCode = (error as any)?.code;
        const errType = (error as any)?.type;
        logger.warn({
          errMsg,
          errStack,
          status,
          code: errCode,
          type: errType,
          model,
        }, `streamContent model "${model}" failed, trying next`);

        if (status === 402) {
          hadCreditError = true;
        }
      }
    }

    const lastErrMsg = lastError instanceof Error ? lastError.message : String(lastError);
    const lastErrStack = lastError instanceof Error ? lastError.stack : '';
    logger.error({ modelsTried: modelsToTry, lastErrMsg, lastErrStack, hadCreditError }, 'All streamContent models exhausted');
    if (hadCreditError) {
      throw new Error('The AI service has run out of credits. Please add credits to your OpenRouter account or try again later.');
    }
    throw lastError || new Error('All streaming models exhausted');
  }

  private buildModelList(override?: string, maxFree?: number): string[] {
    if (override) return [override];
    const models = [this.preferredModel];
    for (const m of this.fallbackModels) {
      if (m !== this.preferredModel && !models.includes(m)) models.push(m);
    }
    const freeLimit = maxFree ?? MAX_FREE_MODELS;
    let freeAdded = 0;
    for (const m of FREE_MODELS) {
      if (!models.includes(m)) {
        models.push(m);
        freeAdded++;
        if (freeAdded >= freeLimit) break;
      }
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
  const modelName = process.env.OPENROUTER_MODEL || DEFAULT_FALLBACK_MODELS[0];
  const appUrl = process.env.APP_URL || 'http://localhost:5173';

  logger.info({
    hasApiKey: !!apiKey,
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
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errStack = error instanceof Error ? error.stack : '';
    const errStatus = (error as any)?.status;
    logger.error({ errMsg, errStack, errStatus, hasApiKey: !!apiKey, modelName, maxTokens }, 'generateAIResponse failed');
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

export async function generateStructuredJSON<T>(prompt: string, systemInstruction: string, timeoutMs = 30000): Promise<T> {
  const provider = resolveProvider();
  const config: Record<string, unknown> = { systemInstruction, requestTimeout: timeoutMs };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await provider.generateContent({ model: undefined, contents: prompt, config, signal: controller.signal });
    const extracted = extractJSON(response.text || '{}');
    return JSON.parse(extracted) as T;
  } catch (error: unknown) {
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
