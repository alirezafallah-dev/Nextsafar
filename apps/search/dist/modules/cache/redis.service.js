"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const environment_1 = require("../../config/environment");
const pino_1 = __importDefault(require("pino"));
const logger = (0, pino_1.default)({ name: 'RedisService' });
class RedisService {
    constructor() {
        this.client = new ioredis_1.default({
            host: environment_1.config.redis.host,
            port: environment_1.config.redis.port,
            maxRetriesPerRequest: null,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.client.on('connect', () => {
            logger.info('✅ Connected to Redis');
        });
        this.client.on('error', (err) => {
            logger.error({ err }, '❌ Redis connection error');
        });
    }
    async get(key) {
        const data = await this.client.get(key);
        return data ? JSON.parse(data) : null;
    }
    async set(key, value, ttlSeconds) {
        const serialized = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.setex(key, ttlSeconds, serialized);
        }
        else {
            await this.client.set(key, serialized);
        }
    }
    async del(key) {
        await this.client.del(key);
    }
    async exists(key) {
        const result = await this.client.exists(key);
        return result === 1;
    }
    getClient() {
        return this.client;
    }
}
exports.redisService = new RedisService();
//# sourceMappingURL=redis.service.js.map