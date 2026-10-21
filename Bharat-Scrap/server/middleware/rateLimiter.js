const redis = require("../utils/redisClient");

function rateLimiter({
  windowSeconds = 60,
  maxRequests = 30,
  keyPrefix = "rl",
  getKey,
} = {}) {
  return async function (req, res, next) {
    try {
      const ip =
        req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        "unknown";

      let key = `${keyPrefix}:${req.path}:${ip}`;

      if (typeof getKey === "function") {
        key = `${keyPrefix}:${getKey(req, ip)}`;
      }

      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfterSeconds: ttl,
        });
      }

      next();
    } catch (err) {
      console.error("RateLimiter error:", err.message);
      // Fail-open (allow request if Redis fails)
      next();
    }
  };
}

module.exports = rateLimiter;
