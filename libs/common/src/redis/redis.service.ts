import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { ConfigKeys, DEFAULT_CONFIG } from '../config/config.keys';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>(
      ConfigKeys.REDIS_HOST,
      DEFAULT_CONFIG[ConfigKeys.REDIS_HOST],
    );
    const port = Number(
      this.configService.get<number>(
        ConfigKeys.REDIS_PORT,
        DEFAULT_CONFIG[ConfigKeys.REDIS_PORT],
      ),
    );

    this.logger.log(`Initializing Redis client connecting to ${host}:${port}`);
    this.client = new Redis({
      host,
      port,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
    });
  }

  /**
   * Acquires a Redis distributed lock using SET key value NX EX ttl
   */
  async acquireLock(key: string, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const result = await this.client.set(key, 'LOCKED', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (err) {
      this.logger.error(`Error acquiring Redis lock for key ${key}: ${err.message}`);
      return false;
    }
  }

  /**
   * Releases a Redis distributed lock
   */
  async releaseLock(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Error releasing Redis lock for key ${key}: ${err.message}`);
    }
  }

  /**
   * Gets raw value for a key
   */
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  /**
   * Sets raw key-value with TTL
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection');
    await this.client.quit();
  }
}
