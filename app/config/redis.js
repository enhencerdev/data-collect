const Redis = require('ioredis');

const config = {
  development: {
    host: 'localhost',
    port: 6379,
    protocol: 'redis:',
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 200, 1000); // More gradual backoff
    },
    commandTimeout: 5000, // 5 second timeout for commands
  },
  production: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    protocol: 'redis:',
    enableOfflineQueue: true,
    maxRetriesPerRequest: 3,
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    tls: {
      // Enable SSL/TLS
      rejectUnauthorized: process.env.NODE_ENV === 'production' // Verify certificates in production
    },
    retryStrategy: (times) => {
      if (times > 3) return null; // Stop retrying after 3 attempts
      return Math.min(times * 200, 1000); // More gradual backoff
    },
    commandTimeout: 5000, // 5 second timeout for commands
  }
}

const redis = new Redis(config[process.env.NODE_ENV]);

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
  // Add basic error recovery
  if (err.code === 'ECONNREFUSED') {
    console.log('Attempting to reconnect to Redis...');
    setTimeout(() => {
      redis.connect();
    }, 1000);
  }
});

module.exports = redis;