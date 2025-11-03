import { Cache } from 'cache-manager';
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async get<T>(key: string): Promise<T | undefined> {
        return await this.cacheManager.get<T>(key);
    }

    async set<T>(key: string, value: T, ttl?: number): Promise<void> {
        await this.cacheManager.set(key, value, ttl);
    }

    async del(key: string): Promise<void> {
        await this.cacheManager.del(key);
    }

    async reset(): Promise<void> {
        // Note: reset method may not be available in all cache implementations
        // This is a placeholder for cache clearing functionality
        // Cache reset not implemented for this cache manager
    }

    // Helper methods for common cache patterns
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttl?: number,
    ): Promise<T> {
        let value = await this.get<T>(key);

        if (value === undefined) {
            value = await factory();
            await this.set(key, value, ttl);
        }

        return value;
    }

    // Cache key generators
    generateKey(prefix: string, ...parts: (string | number)[]): string {
        return `${prefix}:${parts.join(':')}`;
    }

    // User-specific cache keys
    userKey(userId: number, suffix: string): string {
        return this.generateKey('user', userId, suffix);
    }

    // Application-specific cache keys
    applicationKey(applicationId: number, suffix: string, username?: string): string {
        return this.generateKey('application', applicationId, suffix, username);
    }
};
