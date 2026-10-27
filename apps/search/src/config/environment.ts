import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
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
