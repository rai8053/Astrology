import { describe, it, expect, beforeAll } from 'vitest';
import { generateAIResponse, generateStructuredJSON } from '../lib/ai.js';

const origEnv = process.env;

describe('AI module', () => {
  beforeAll(() => {
    process.env = { ...origEnv, MOCK_AI: 'true' };
  });

  it('generateAIResponse returns mock text', async () => {
    const result = await generateAIResponse('Tell me about my birth chart');
    expect(result).toHaveProperty('text');
    expect(result).toHaveProperty('provider', 'mock');
    expect(result).toHaveProperty('model', 'mock');
    expect(typeof result.text).toBe('string');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('generateStructuredJSON returns parsed object', async () => {
    const result = await generateStructuredJSON<{ test: string }>(
      'Return { "test": "hello" }',
      'Return JSON only',
    );
    expect(result).toBeDefined();
  });
});
