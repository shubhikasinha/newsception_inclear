import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError: (err) => {
        logger.error('Redis reconnect error:', err);
        return true;
      },
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting...');
    });

    return redisClient;
  } catch (error) {
    logger.error('Redis connection failed:', error);
    throw error;
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis first.');
  }
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};

// Cache helper functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    const client = getRedisClient();
    return await client.get(key);
  } catch (error) {
    logger.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string, 
  value: string, 
  ttl?: number
): Promise<void> => {
  try {
    const client = getRedisClient();
    if (ttl) {
      await client.setex(key, ttl, value);
    } else {
      await client.set(key, value);
    }
  } catch (error) {
    logger.error('Cache set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    logger.error('Cache delete error:', error);
  }
};

export const cacheExists = async (key: string): Promise<boolean> => {
  try {
    const client = getRedisClient();
    const exists = await client.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error('Cache exists error:', error);
    return false;
  }
};
