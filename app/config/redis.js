const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  tls: {
    // Enable SSL/TLS
    rejectUnauthorized: process.env.NODE_ENV === 'production' // Verify certificates in production
  },
  // Optional configurations
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis Client Connected'));

module.exports = redis;