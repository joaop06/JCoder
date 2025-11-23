import { Cache } from 'cache-manager';
export declare class CacheService {
    private cacheManager;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | undefined>;
    set<T>(key: string, value: T, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    reset(): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>;
    generateKey(prefix: string, ...parts: (string | number)[]): string;
    userKey(userId: number, suffix: string): string;
    applicationKey(applicationId: number, suffix: string, username?: string): string;
    technologyKey(technologyId: number, suffix: string, username?: string): string;
}
