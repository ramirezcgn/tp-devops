let redisHost = 'localhost';
if (process.env.REDIS_HOST) {
  redisHost = process.env.REDIS_HOST;
}

const config = {
  migrate: false,
  port: process.env.PORT || '3001',
  redisServer: `redis://${redisHost}:6379`,
};

export default config;
