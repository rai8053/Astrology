import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { logger } from './logger.js';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'groq' | 'openrouter';

interface AIProviderClient {
  generateContent(params: { model: string; contents: string; config?: Record<string, unknown> }): Promise<{ text: string }>;
}

class GeminiProvider implements AIProviderClient {
  private client: GoogleGenAI;
  constructor(apiKey: string) { this.client = new GoogleGenAI({ apiKey }); }
  async generateContent(params: { model: string; contents: string; config?: Record<string, unknown> }) {
    const response = await this.client.models.generateContent({
      model: params.model,
      contents: params.contents,
      config: params.config as Record<string, unknown> | undefined,
    });
    return { text: response.text || '' };
  }
}

class OpenAIProvider implements AIProviderClient {
  private client: OpenAI;
  constructor(apiKey: string) { this.client = new OpenAI({ apiKey }); }
  async generateContent(params: { model: string; contents: string }) {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: [{ role: 'user', content: params.contents }],
    });
    return { text: response.choices[0]?.message?.content || '' };
  }
}

const providerConfigs: Record<AIProvider, { envKey: string; defaultModel: string; class: new (key: string) => AIProviderClient }> = {
  gemini: { envKey: 'GEMINI_API_KEY', defaultModel: 'gemini-2.0-flash', class: GeminiProvider },
  openai: { envKey: 'OPENAI_API_KEY', defaultModel: 'gpt-4o-mini', class: OpenAIProvider },
  claude: { envKey: 'CLAUDE_API_KEY', defaultModel: 'claude-3-haiku-20240307', class: OpenAIProvider },
  deepseek: { envKey: 'DEEPSEEK_API_KEY', defaultModel: 'deepseek-chat', class: OpenAIProvider },
  groq: { envKey: 'GROQ_API_KEY', defaultModel: 'mixtral-8x7b-32768', class: OpenAIProvider },
  openrouter: { envKey: 'OPENROUTER_API_KEY', defaultModel: 'google/gemini-2.0-flash-lite', class: OpenAIProvider },
};

function getActiveProvider(): { provider: AIProviderClient; model: string; name: string } {
  const preferred = (process.env.AI_PROVIDER || 'gemini') as AIProvider;
  const config = providerConfigs[preferred];
  if (!config) {
    logger.warn(`Unknown AI provider "${preferred}", falling back to gemini`);
    return getActiveProviderForName('gemini');
  }
  const apiKey = process.env[config.envKey];
  if (apiKey) {
    return { provider: new config.class(apiKey), model: process.env[`${preferred.toUpperCase()}_MODEL`] || config.defaultModel, name: preferred };
  }
  const fallback = 'gemini';
  logger.warn(`No API key for ${preferred}, falling back to ${fallback}`);
  return getActiveProviderForName(fallback);
}

function getActiveProviderForName(name: AIProvider): { provider: AIProviderClient; model: string; name: string } {
  const config = providerConfigs[name];
  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    throw new Error(`No API key configured for primary or fallback provider "${name}"`);
  }
  return { provider: new config.class(apiKey), model: config.defaultModel, name };
}

export async function generateAIResponse(prompt: string, systemInstruction?: string): Promise<{ text: string; provider: string; model: string }> {
  const { provider, model, name } = getActiveProvider();
  const config: Record<string, unknown> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  try {
    const response = await provider.generateContent({ model, contents: prompt, config });
    return { text: response.text, provider: name, model };
  } catch (error) {
    logger.error({ error, provider: name, model }, 'AI provider failed');
    throw error;
  }
}

export async function generateStructuredJSON<T>(prompt: string, systemInstruction: string): Promise<T> {
  const { provider, model, name } = getActiveProvider();
  const config: Record<string, unknown> = {
    systemInstruction,
    responseMimeType: 'application/json',
  };
  try {
    const response = await provider.generateContent({ model, contents: prompt, config });
    return JSON.parse(response.text || '{}') as T;
  } catch (error) {
    logger.error({ error, provider: name, model }, 'Structured AI generation failed');
    throw error;
  }
}
