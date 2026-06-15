import { describe, it, expect, beforeEach } from 'vitest';

describe('EmbeddingService', () => {
  let embeddingService: any;

  beforeEach(async () => {
    process.env.OPENROUTER_API_KEY = 'test-key-for-unit-tests';
    const mod = await import('../../services/rag/embedding.js');
    embeddingService = new mod.EmbeddingService('test-key-for-unit-tests');
  });

  describe('cosineSimilarity', () => {
    it('returns 1 for identical vectors', () => {
      const v = [0.5, 0.3, 0.8, 0.1];
      expect(embeddingService.computeCosineSimilarity(v, v)).toBeCloseTo(1, 5);
    });

    it('returns 0 for orthogonal vectors', () => {
      const a = [1, 0];
      const b = [0, 1];
      expect(embeddingService.computeCosineSimilarity(a, b)).toBeCloseTo(0, 5);
    });

    it('returns correct value for similar vectors', () => {
      const a = [0.1, 0.2, 0.3];
      const b = [0.15, 0.25, 0.35];
      const sim = embeddingService.computeCosineSimilarity(a, b);
      expect(sim).toBeGreaterThan(0.9);
      expect(sim).toBeLessThan(1);
    });

    it('returns 0 when one vector is all zeros', () => {
      const a = [0, 0, 0];
      const b = [0.1, 0.2, 0.3];
      expect(embeddingService.computeCosineSimilarity(a, b)).toBe(0);
    });

    it('handles vectors of different lengths gracefully', () => {
      const a = [0.1, 0.2];
      const b = [0.3, 0.4, 0.5];
      expect(embeddingService.computeCosineSimilarity(a, b)).toBe(0);
    });
  });

  describe('cosineSimilarities batch', () => {
    it('returns scores for multiple vectors', () => {
      const query = [1, 0];
      const vectors = [[1, 0], [0, 1], [0.707, 0.707]];
      const scores = embeddingService.computeCosineSimilarities(query, vectors);
      expect(scores).toHaveLength(3);
      expect(scores[0]).toBeCloseTo(1, 3);
      expect(scores[1]).toBeCloseTo(0, 3);
      expect(scores[2]).toBeGreaterThan(0.7);
    });
  });

  describe('cache', () => {
    it('tracks cache stats', () => {
      const stats = embeddingService.cacheStats;
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
    });
  });
});
