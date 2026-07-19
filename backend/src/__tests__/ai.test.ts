import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();

class OpenAIMock {
  chat = { completions: { create } };

  constructor(_options: unknown) {}
}

vi.mock('openai', () => ({
  default: OpenAIMock,
}));

describe('AI module', () => {
  beforeEach(() => {
    process.env.AI_API_KEY = 'test-api-key';
    delete process.env.OPENROUTER_API_KEY;
    create.mockReset();
    create.mockResolvedValue({
      choices: [{ message: { content: '{"test":"hello"}' } }],
      usage: { prompt_tokens: 3, completion_tokens: 2, total_tokens: 5 },
    });
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
    expect(result).toEqual({ test: 'hello' });
  });
});
