import { describe, it, expect } from 'vitest';

const hasAIKey = !!(process.env.AI_API_KEY || process.env.OPENROUTER_API_KEY);
const itWithKey = hasAIKey ? it : it.skip;

describe('AI module', () => {
  itWithKey('generateAIResponse returns text', { timeout: 35000 }, async () => {
    const { generateAIResponse } = await import('../lib/ai.js');
    const result = await generateAIResponse('Say hello in 3 words', 'Be concise.');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('provider', 'openrouter');
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThan(0);
  });

  itWithKey('generateStructuredJSON returns parsed object', { timeout: 35000 }, async () => {
    const { generateStructuredJSON } = await import('../lib/ai.js');
    const result = await generateStructuredJSON<{ test: string }>(
      'Return { "test": "hello" }',
      'Return JSON only',
    );
    expect(result).toBeDefined();
  });
});
