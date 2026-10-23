import Redis from 'ioredis';
declare class RedisService {
    private client;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttlSeconds?: number): Promise<void>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    getClient(): Redis;
}
export declare const redisService: RedisService;
export {};
//# sourceMappingURL=redis.service.d.ts.map