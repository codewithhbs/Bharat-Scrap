const Redis = require("ioredis");

const redisHost = process.env.REDIS_HOST || "redis";      // Docker me 'redis'
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || undefined; // agar password ho

const redis = new Redis({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
});

redis.on("connect", () => {
  console.log("✅ Redis connected:", redisHost + ":" + redisPort);
});

redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

module.exports = redis;
