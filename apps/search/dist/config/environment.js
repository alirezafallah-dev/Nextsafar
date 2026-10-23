"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    port: parseInt(process.env.SEARCH_PORT || '3001', 10),
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6380', 10),
    },
    coreApi: {
        baseUrl: process.env.CORE_API_URL || 'http://localhost:3000',
        secret: process.env.INTERNAL_API_SECRET || 'internal-secret-key',
    },
    cache: {
        tourTTL: parseInt(process.env.TOUR_CACHE_TTL || '1800', 10), // 30 minutes
        hotelTTL: parseInt(process.env.HOTEL_CACHE_TTL || '1800', 10), // 30 minutes
        searchTTL: parseInt(process.env.SEARCH_CACHE_TTL || '300', 10), // 5 minutes
    },
};
//# sourceMappingURL=environment.js.map