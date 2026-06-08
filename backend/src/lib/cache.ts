import { Redis } from 'ioredis';
import { logger } from './logger.js';

const REDIS_URL = process.env.REDIS_URL || '';

let redis: Redis | null = null;

function getClient(): Redis {
  if (!redis) {
    redis = new Redis(REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      },
    });
    redis.on('error', (err) => logger.error({ err }, 'Redis connection error'));
    redis.on('connect', () => logger.info('Redis connected'));
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!REDIS_URL) return null;
  try {
    const client = getClient();
    const raw = await client.get(key);
    if (raw) return JSON.parse(raw) as T;
  } catch (err) {
    logger.warn({ err, key }, 'Cache get failed');
  }
  return null;
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!REDIS_URL) return;
  try {
    const client = getClient();
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (err) {
    logger.warn({ err, key }, 'Cache set failed');
  }
}

export async function cacheDel(key: string): Promise<void> {
  if (!REDIS_URL) return;
  try {
    const client = getClient();
    await client.del(key);
  } catch (err) {
    logger.warn({ err, key }, 'Cache del failed');
  }
}
