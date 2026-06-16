import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashText, buildTranslationPrompt, MAX_TEXT_LENGTH } from '../services/translation/translationService.js';

vi.mock('../lib/logger.ts', () => ({ logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() } }));
vi.mock('../lib/prisma.ts', () => ({
  prisma: {
    translationCache: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'test-id' }),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));
vi.mock('../lib/cache.ts', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  cacheDel: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../lib/ai.ts', () => ({
  generateAIResponse: vi.fn().mockResolvedValue({
    text: 'Hola, ¿cómo estás?',
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash',
  }),
}));

describe('translation service', () => {
  describe('hashText', () => {
    it('returns a SHA-256 hex string', () => {
      const hash = hashText('hello');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it('returns the same hash for the same input', () => {
      expect(hashText('test')).toBe(hashText('test'));
    });

    it('returns different hashes for different inputs', () => {
      expect(hashText('hello')).not.toBe(hashText('world'));
    });
  });

  describe('MAX_TEXT_LENGTH', () => {
    it('is set to 10000', () => {
      expect(MAX_TEXT_LENGTH).toBe(10000);
    });
  });

  describe('buildTranslationPrompt', () => {
    it('includes the text and target language', () => {
      const prompt = buildTranslationPrompt('Hello', 'Spanish');
      expect(prompt).toContain('Hello');
      expect(prompt).toContain('Spanish');
    });

    it('includes never-translate terms', () => {
      const prompt = buildTranslationPrompt('Hello', 'French');
      expect(prompt).toContain('Rahu');
      expect(prompt).toContain('Ketu');
      expect(prompt).toContain('Nakshatra');
      expect(prompt).toContain('Dasha');
      expect(prompt).toContain('Mahadasha');
      expect(prompt).toContain('Antardasha');
    });

    it('includes format preservation requirements', () => {
      const prompt = buildTranslationPrompt('Hello', 'German');
      expect(prompt).toContain('Preserve Markdown');
      expect(prompt).toContain('Preserve HTML');
      expect(prompt).toContain('Preserve URLs');
    });
  });

  describe('getTranslationMetrics', () => {
    it('returns metrics structure', async () => {
      const { getTranslationMetrics } = await import('../services/translation/translationService.js');
      const { prisma } = await import('../lib/prisma.js');

      (prisma.translationCache.count as any).mockResolvedValue(42);
      (prisma.translationCache.groupBy as any).mockResolvedValue([
        { targetLanguage: 'es', _count: { targetLanguage: 15 } },
        { targetLanguage: 'fr', _count: { targetLanguage: 10 } },
      ]);

      const metrics = await getTranslationMetrics();
      expect(metrics).toHaveProperty('totalTranslations', 42);
      expect(metrics).toHaveProperty('uniqueLanguages');
      expect(metrics).toHaveProperty('topLanguages');
      expect(metrics).toHaveProperty('totalCost');
    });
  });
});

describe('translateText function', () => {
  it('returns empty for empty text', async () => {
    const { translateText } = await import('../services/translation/translationService.js');
    const result = await translateText('', 'es');
    expect(result.translatedText).toBe('');
    expect(result.cached).toBe(false);
  });

  it('returns original text for same language', async () => {
    const { translateText } = await import('../services/translation/translationService.js');
    const result = await translateText('Hello', 'en', 'en');
    expect(result.translatedText).toBe('Hello');
    expect(result.cached).toBe(false);
  });

  it('translates text via AI when not cached', async () => {
    const { translateText } = await import('../services/translation/translationService.js');
    const result = await translateText('Hello, how are you?', 'es');
    expect(result.translatedText).toBe('Hola, ¿cómo estás?');
    expect(result.cached).toBe(false);
    expect(result.model).toBe('google/gemini-2.5-flash');
  });

  it('throws for text exceeding max length', async () => {
    const { translateText } = await import('../services/translation/translationService.js');
    await expect(translateText('x'.repeat(MAX_TEXT_LENGTH + 1), 'es')).rejects.toThrow('maximum length');
  });
});
