const Redis = require('ioredis');

const config = {
  development: {
    host: 'localhost',
    port: 6379,
    protocol: 'redis:',
    enableOfflineQueue: false,
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  },
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    protocol: 'redis:',
    enableOfflineQueue: false,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    tls: {
      // Enable SSL/TLS
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Verify certificates in production
    },
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  }
}

const redis = new Redis(config[process.env.NODE_ENV]);

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

module.exports = redis;