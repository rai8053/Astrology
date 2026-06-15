import { describe, it, expect, beforeEach } from 'vitest';

describe('RetrievalService', () => {
  let retrievalService: any;
  let embeddingService: any;

  beforeEach(async () => {
    process.env.OPENROUTER_API_KEY = 'test-key-for-unit-tests';
    const retMod = await import('../../services/rag/retrieval.js');
    retrievalService = retMod.retrievalService;
    const embMod = await import('../../services/rag/embedding.js');
    embeddingService = new embMod.EmbeddingService('test-key-for-unit-tests');
  });

  describe('logMetrics', () => {
    it('has logMetrics as a function', () => {
      expect(typeof retrievalService.logMetrics).toBe('function');
    });
  });

  describe('retrieve', () => {
    it('has retrieve as a function', () => {
      expect(typeof retrievalService.retrieve).toBe('function');
    });
  });

  describe('findSimilar', () => {
    it('has findSimilar as a function', () => {
      expect(typeof retrievalService.findSimilar).toBe('function');
    });
  });

  describe('embeddingService computeCosineSimilarity', () => {
    it('returns high score for similar vectors', () => {
      const a = [0.1, 0.2, 0.3, 0.4, 0.5];
      const b = [0.12, 0.22, 0.28, 0.42, 0.48];
      const score = embeddingService.computeCosineSimilarity(a, b);
      expect(score).toBeGreaterThan(0.95);
    });

    it('returns low score for dissimilar vectors', () => {
      const a = [1, 0, 0, 0, 0];
      const b = [0, 1, 0, 0, 0];
      const score = embeddingService.computeCosineSimilarity(a, b);
      expect(score).toBeLessThan(0.1);
    });
  });
});
