import { describe, it, expect, beforeEach } from 'vitest';

describe('MemoryService', () => {
  let memoryService: any;

  beforeEach(async () => {
    const mod = await import('../../services/rag/memory.js');
    memoryService = mod.memoryService;
  });

  describe('containsBirthInfo', () => {
    it('detects birth-related content', () => {
      const method = (memoryService as any).containsBirthInfo.bind(memoryService);
      expect(method('i was born on june 15')).toBe(true);
      expect(method('my birth chart is unique')).toBe(true);
      expect(method('what is my ascendant')).toBe(true);
      expect(method('tell me about my rashi')).toBe(true);
      expect(method('the weather is nice')).toBe(false);
    });
  });

  describe('containsZodiacInfo', () => {
    it('detects zodiac sign mentions', () => {
      const method = (memoryService as any).containsZodiacInfo.bind(memoryService);
      expect(method('i am aries')).toBe(true);
      expect(method('my moon is in taurus')).toBe(true);
      expect(method('hello friend')).toBe(false);
    });
  });

  describe('containsPlanetInfo', () => {
    it('detects planet mentions', () => {
      const method = (memoryService as any).containsPlanetInfo.bind(memoryService);
      expect(method('sun is in leo')).toBe(true);
      expect(method('saturn return')).toBe(true);
      expect(method('mangal is strong')).toBe(true);
      expect(method('i like coffee')).toBe(false);
    });
  });

  describe('formatForPrompt', () => {
    it('formats messages for prompt', () => {
      const messages = [
        { role: 'user', content: 'Hello', timestamp: '2026-01-01' },
        { role: 'assistant', content: 'Hi there', timestamp: '2026-01-01' },
      ];
      const result = memoryService.formatForPrompt(messages);
      expect(result).toBe('user: Hello\nassistant: Hi there');
    });

    it('handles empty array', () => {
      expect(memoryService.formatForPrompt([])).toBe('');
    });
  });
});
