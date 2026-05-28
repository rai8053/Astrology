import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { logger } from './logger.js';

export type AIProvider = 'gemini' | 'openai' | 'claude' | 'deepseek' | 'groq' | 'openrouter' | 'mock';

interface AIProviderClient {
  generateContent(params: { model: string; contents: string; config?: Record<string, unknown> }): Promise<{ text: string }>;
}

class MockProvider implements AIProviderClient {
  async generateContent(params: { model: string; contents: string }) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const prompt = params.contents.toLowerCase();
    if (prompt.includes('birth') || prompt.includes('kundli')) {
      return {
        text: JSON.stringify({
          moonSign: 'Taurus', nakshatra: 'Kritika', lagna: 'Gemini', dosha: 'Vata-Pitta',
          interpretation: 'Your Moon in Taurus indicates a practical and stable nature. The Kritika Nakshatra brings leadership qualities.',
          timestamp: new Date().toISOString(),
        }),
      };
    }
    if (prompt.includes('horoscope') || prompt.includes('prediction')) {
      return {
        text: JSON.stringify({
          career: 'This is a favorable period for new ventures and professional growth.',
          finance: 'Financial opportunities are approaching. Consider diversifying your investments.',
          love: 'Relationships are harmonious. Single natives may meet someone special.',
          health: 'Take care of your sleep schedule. Regular exercise recommended.',
          energy: 7, luckyNumber: 5, luckyColor: 'Blue', luckyTime: '6-8 AM',
        }),
      };
    }
    if (prompt.includes('compatibility') || prompt.includes('match')) {
      return {
        text: JSON.stringify({
          totalScore: 28, maxScore: 36, percentage: 77,
          varna: 1, vasya: 2, tara: 0, yoni: 4, grahaMaitri: 5, gana: 0, bhakoot: 7, nadi: 9,
          analysis: 'Good overall compatibility. The couple shares common values and emotional understanding.',
        }),
      };
    }
    return { text: JSON.stringify({ message: 'Mock response — configure real AI API keys for production' }) };
  }
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
  constructor(apiKey: string, baseURL?: string) {
    this.client = new OpenAI({ apiKey, baseURL });
  }
  async generateContent(params: { model: string; contents: string }) {
    const response = await this.client.chat.completions.create({
      model: params.model,
      messages: [{ role: 'user', content: params.contents }],
    });
    return { text: response.choices[0]?.message?.content || '' };
  }
}

type ProviderClass = { new (...args: any[]): AIProviderClient };

const providerConfigs: Record<string, { envKey: string; defaultModel: string; class: ProviderClass }> = {
  mock: { envKey: '', defaultModel: 'mock', class: MockProvider },
  gemini: { envKey: 'GEMINI_API_KEY', defaultModel: 'gemini-2.0-flash', class: GeminiProvider },
  openai: { envKey: 'OPENAI_API_KEY', defaultModel: 'gpt-4o-mini', class: OpenAIProvider },
  claude: { envKey: 'CLAUDE_API_KEY', defaultModel: 'claude-3-haiku-20240307', class: OpenAIProvider },
  deepseek: { envKey: 'DEEPSEEK_API_KEY', defaultModel: 'deepseek-chat', class: OpenAIProvider },
  groq: { envKey: 'GROQ_API_KEY', defaultModel: 'mixtral-8x7b-32768', class: OpenAIProvider },
  openrouter: { envKey: 'OPENROUTER_API_KEY', defaultModel: 'google/gemini-2.0-flash-lite', class: OpenAIProvider },
};

function resolveProvider(): { provider: AIProviderClient; model: string; name: string } {
  if (process.env.MOCK_AI === 'true') {
    logger.info('Using MOCK AI provider (portfolio/demo mode)');
    return { provider: new MockProvider(), model: 'mock', name: 'mock' };
  }

  const preferred = (process.env.AI_PROVIDER || 'gemini') as string;
  const config = providerConfigs[preferred];
  if (!config) return resolveProviderByName('gemini');

  const apiKey = process.env[config.envKey];
  if (apiKey) {
    const model = process.env[`${preferred.toUpperCase()}_MODEL`] || config.defaultModel;
    if (preferred === 'groq') {
      return { provider: new OpenAIProvider(apiKey, 'https://api.groq.com/openai/v1'), model, name: preferred };
    }
    if (preferred === 'openrouter') {
      return { provider: new OpenAIProvider(apiKey, 'https://openrouter.ai/api/v1'), model, name: preferred };
    }
    return { provider: new config.class(apiKey), model, name: preferred };
  }

  logger.warn(`No API key for "${preferred}", falling back to gemini`);
  return resolveProviderByName('gemini');
}

function resolveProviderByName(name: string): { provider: AIProviderClient; model: string; name: string } {
  const config = providerConfigs[name];
  if (!config) {
    logger.warn(`No provider config for "${name}", using mock provider`);
    return { provider: new MockProvider(), model: 'mock', name: 'mock' };
  }
  const apiKey = process.env[config.envKey];
  if (!apiKey) {
    logger.warn(`No API key configured for "${name}" — falling back to mock provider`);
    return { provider: new MockProvider(), model: 'mock', name: 'mock' };
  }
  return { provider: new config.class(apiKey), model: config.defaultModel, name };
}

export async function generateAIResponse(prompt: string, systemInstruction?: string): Promise<{ text: string; provider: string; model: string }> {
  const { provider, model, name } = resolveProvider();
  const config: Record<string, unknown> = {};
  if (systemInstruction) config.systemInstruction = systemInstruction;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await provider.generateContent({ model, contents: prompt, config });
    return { text: response.text, provider: name, model };
  } catch (error) {
    logger.error({ error, provider: name, model }, 'AI provider failed');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function generateStructuredJSON<T>(prompt: string, systemInstruction: string): Promise<T> {
  const { provider, model, name } = resolveProvider();
  const config: Record<string, unknown> = { systemInstruction, responseMimeType: 'application/json' };
  try {
    const response = await provider.generateContent({ model, contents: prompt, config });
    return JSON.parse(response.text || '{}') as T;
  } catch (error) {
    logger.error({ error, provider: name, model }, 'Structured AI generation failed — returning empty result');
    return {} as T;
  }
}
