const redis = require("./redisClient");

// ✅ Simple set
async function setCache(key, data, ttlSeconds = 60) {
  const value = JSON.stringify(data);
  await redis.set(key, value, "EX", ttlSeconds);
}

// ✅ Simple get
async function getCache(key) {
  const value = await redis.get(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

// ✅ Express middleware generator (GET routes ke liye)
function cacheMiddleware({ keyPrefix = "cache", ttlSeconds = 60, buildKey }) {
  return async function (req, res, next) {
    try {
      const key = buildKey
        ? `${keyPrefix}:${buildKey(req)}`
        : `${keyPrefix}:${req.originalUrl}`;

      const cached = await getCache(key);
      if (cached) {
        return res.json({ fromCache: true, data: cached });
      }

      // Response send hook
      const originalJson = res.json.bind(res);
      res.json = async (body) => {
        // body.data ya body khud, depends on API style
        const dataToCache = body.data || body;
        await setCache(key, dataToCache, ttlSeconds);
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache middleware error:", err.message);
      next();
    }
  };
}

module.exports = {
  setCache,
  getCache,
  cacheMiddleware,
};
