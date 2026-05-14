const redis = require("../utils/redisClient");

// windowSeconds: kitne time ka window
// maxRequests: us window me kitni requests allowed
function rateLimiter({ windowSeconds = 60, maxRequests = 30, keyPrefix = "rl" } = {}) {
  return async function (req, res, next) {
    try {
      const ip = req.ip || req.connection.remoteAddress || "unknown";
      const route = req.path;
      const key = `${keyPrefix}:${route}:${ip}`;

      const current = await redis.incr(key);

      if (current === 1) {
        // first request in this window
        await redis.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redis.ttl(key); // remaining time
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfterSeconds: ttl,
        });
      }

      next();
    } catch (err) {
      console.error("RateLimiter error:", err.message);
      // Agar redis down ho to request allow kar do (fail-open)
      next();
    }
  };
}

module.exports = rateLimiter;
