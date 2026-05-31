import { describe, it, expect, beforeAll } from 'vitest';

describe('AI module (requires OPENROUTER_API_KEY)', () => {
  beforeAll(() => {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY must be set to run AI tests');
    }
  });

  it('generateAIResponse returns text', async () => {
    const { generateAIResponse } = await import('../lib/ai.js');
    const result = await generateAIResponse('Say hello in 3 words', 'Be concise.');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('provider', 'openrouter');
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('generateStructuredJSON returns parsed object', async () => {
    const { generateStructuredJSON } = await import('../lib/ai.js');
    const result = await generateStructuredJSON<{ test: string }>(
      'Return { "test": "hello" }',
      'Return JSON only',
    );
    expect(result).toBeDefined();
  });
});
