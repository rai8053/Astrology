import { describe, it, expect } from 'vitest';

const itWithKey = process.env.OPENROUTER_API_KEY ? it : it.skip;

describe('AI module', () => {
  itWithKey('generateAIResponse returns text', async () => {
    const { generateAIResponse } = await import('../lib/ai.js');
    const result = await generateAIResponse('Say hello in 3 words', 'Be concise.');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('provider', 'openrouter');
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThan(0);
  });

  itWithKey('generateStructuredJSON returns parsed object', async () => {
    const { generateStructuredJSON } = await import('../lib/ai.js');
    const result = await generateStructuredJSON<{ test: string }>(
      'Return { "test": "hello" }',
      'Return JSON only',
    );
    expect(result).toBeDefined();
  });
});
