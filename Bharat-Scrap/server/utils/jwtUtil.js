const jwt = require("jsonwebtoken");
const redis = require("./redisClient");

const ACCESS_TOKEN_TTL = "15m";
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

/* =========================
   ACCESS TOKEN
========================= */
function signAccessToken(user) {
  const payload = {
    sub: user._id?.toString() || user.id,
    email: user.email,
    role: user.role || "user",
  };

  return jwt.sign(payload, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/* =========================
   REFRESH TOKEN + REDIS
========================= */
async function signRefreshToken(userId) {
  const jti = `sess:${userId}:${Date.now()}`;
  const payload = { sub: userId, jti };

  const token = jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_TTL_SECONDS,
  });

  await redis.set(
    `refresh:${jti}`,
    userId.toString(),
    "EX",
    REFRESH_TOKEN_TTL_SECONDS
  );

  return { token, jti };
}

/* =========================
   INVALIDATE REFRESH TOKEN
========================= */
async function invalidateRefreshToken(jti) {
  await redis.del(`refresh:${jti}`);
}

/* =========================
   CHECK REFRESH TOKEN
========================= */
async function isRefreshTokenValid(jti) {
  const userId = await redis.get(`refresh:${jti}`);
  return !!userId;
}

/* =========================
   AUTH MIDDLEWARE (HEADER)
========================= */
function authenticateAccessToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

/* =========================
   ROLE AUTHORIZATION
========================= */
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {

    // console.log("🔥 AUTHORIZE MIDDLEWARE HIT 🔥");
    // console.log("Allowed roles:", allowedRoles);
    // console.log("User role raw:", req.user?.role);

    if (!req.user?.role) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No role found.",
      });
    }

    const userRole = req.user.role.toLowerCase().trim();
    const roles = allowedRoles.map(r => r.toLowerCase().trim());

    // console.log("Normalized role:", userRole);
    // console.log("Normalized allowed:", roles);

    if (!roles.includes(userRole)) {
      console.log("❌ ROLE CHECK FAILED");
      return res.status(403).json({
        success: false,
        message: "Access denied. You do not have permission.",
      });
    }

    // console.log("✅ ROLE CHECK PASSED");
    next();
  };
}


module.exports = {
  signAccessToken,
  signRefreshToken,
  invalidateRefreshToken,
  isRefreshTokenValid,
  authenticateAccessToken,
  authorizeRoles,
};
