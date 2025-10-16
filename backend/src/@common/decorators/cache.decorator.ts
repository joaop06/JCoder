import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export interface CacheOptions {
    key?: string;
    ttl?: number; // Time to live in seconds
}

export const Cacheable = (options: CacheOptions = {}) => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        SetMetadata(CACHE_KEY_METADATA, options.key || propertyKey)(target, propertyKey, descriptor);
        SetMetadata(CACHE_TTL_METADATA, options.ttl || 300)(target, propertyKey, descriptor); // 5 minutes default
        return descriptor;
    };
};
