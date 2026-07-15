/**
 * Redis Client Utility
 * Manages Redis connection and caching operations safely
 * Includes automatic fallback to database if Redis unavailable
 */

const redis = require('redis');

// Create Redis client
let redisClient = null;
let isConnected = false;

const initializeRedis = async () => {
    try {
        if (process.env.REDIS_ENABLED === 'false') {
            console.log('⚠️ Redis disabled via REDIS_ENABLED=false');
            return false;
        }

        const redisHost = process.env.REDIS_HOST || 'localhost';
        const redisPort = Number(process.env.REDIS_PORT || 6379);
        const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;

        const clientOptions = process.env.REDIS_URL ? {
            url: redisUrl,
            socket: {
                connectTimeout: 5000,
                reconnectStrategy: false
            }
        } : {
            socket: {
                host: redisHost,
                port: redisPort,
                connectTimeout: 5000,
                reconnectStrategy: false
            },
            password: process.env.REDIS_PASSWORD || undefined
        };

        redisClient = redis.createClient(clientOptions);

        // Event handlers
        redisClient.on('connect', () => {
            console.log('✅ Redis socket connected');
        });

        redisClient.on('ready', () => {
            console.log('✅ Redis is ready');
            isConnected = true;
        });

        redisClient.on('error', (err) => {
            console.warn('⚠️ Redis error (but app will continue with database):', err.message);
            isConnected = false;
        });

        redisClient.on('end', () => {
            console.warn('⚠️ Redis connection closed');
            isConnected = false;
        });

        redisClient.on('reconnecting', () => {
            console.log('🔄 Redis Reconnecting...');
        });

        // Connect
        await redisClient.connect();
        return true;
    } catch (err) {
        // Only log the raw error once on initialization failure.
        if (err.message && err.message.includes('getaddrinfo ENOTFOUND')) {
            console.warn('⚠️ Redis host could not be resolved:', err.message);
        } else {
            console.warn('⚠️ Redis initialization skipped (database will be used):', err.message);
        }
        isConnected = false;
        return false;
    }
};

/**
 * Get value from Redis cache
 * Safe: Returns null if Redis unavailable
 */
const getCache = async (key) => {
    try {
        if (!redisClient || !redisClient.isOpen) return null;
        
        const value = await redisClient.get(key);
        return value ? JSON.parse(value) : null;
    } catch (err) {
        console.error(`Cache GET error for key ${key}:`, err.message);
        return null;
    }
};

/**
 * Set value in Redis cache
 * Safe: Silently fails if Redis unavailable
 */
const setCache = async (key, value, ttlSeconds = 300) => {
    try {
        if (!redisClient || !redisClient.isOpen) return false;
        
        await redisClient.setEx(key, ttlSeconds, JSON.stringify(value));
        return true;
    } catch (err) {
        console.error(`Cache SET error for key ${key}:`, err.message);
        return false;
    }
};

/**
 * Delete cache key
 * Safe: Silently fails if Redis unavailable
 */
const deleteCache = async (key) => {
    try {
        if (!redisClient || !redisClient.isOpen) return false;
        
        await redisClient.del(key);
        return true;
    } catch (err) {
        console.error(`Cache DELETE error for key ${key}:`, err.message);
        return false;
    }
};

/**
 * Delete multiple cache keys (pattern matching)
 * Safe: Silently fails if Redis unavailable
 */
const deleteCachePattern = async (pattern) => {
    try {
        if (!redisClient || !redisClient.isOpen) return 0;
        
        const keys = await redisClient.keys(pattern);
        if (keys.length === 0) return 0;
        
        await redisClient.del(keys);
        return keys.length;
    } catch (err) {
        console.error(`Cache pattern DELETE error for pattern ${pattern}:`, err.message);
        return 0;
    }
};

/**
 * Clear entire cache
 * Safe: Silently fails if Redis unavailable
 */
const clearAllCache = async () => {
    try {
        if (!redisClient || !redisClient.isOpen) return false;
        
        await redisClient.flushDb();
        console.log('✅ All cache cleared');
        return true;
    } catch (err) {
        console.error('Cache FLUSH error:', err.message);
        return false;
    }
};

/**
 * Check if Redis is connected
 */
const isRedisConnected = () => Boolean(redisClient && redisClient.isOpen);

/**
 * Get Redis client instance
 */
const getRedisClient = () => redisClient;

module.exports = {
    initializeRedis,
    getCache,
    setCache,
    deleteCache,
    deleteCachePattern,
    clearAllCache,
    isRedisConnected,
    getRedisClient
};
