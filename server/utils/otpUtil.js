const crypto = require("crypto");
const redis = require("./redisClient");

const DEFAULT_OTP_TTL_SECONDS = 5 * 60; // 5 minutes

// ✅ Random 6-digit OTP
function generateNumericOtp(length = 6) {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

// ✅ OTP set karo Redis me
async function createOtp({ purpose, identifier, ttl = DEFAULT_OTP_TTL_SECONDS }) {
  // purpose: "login", "signup", "forgot_password"
  // identifier: mobile number ya email
  const otp = generateNumericOtp(6);
  const key = `otp:${purpose}:${identifier}`;

  await redis.set(key, otp, "EX", ttl);

  return otp;
}

// ✅ OTP verify
async function verifyOtp({ purpose, identifier, otp }) {
  const key = `otp:${purpose}:${identifier}`;
  const stored = await redis.get(key);

  if (!stored) {
    return { valid: false, reason: "expired_or_not_found" };
  }

  if (stored !== otp) {
    return { valid: false, reason: "mismatch" };
  }

  // Once used, delete it
  await redis.del(key);

  return { valid: true };
}

// Optional: OTP force invalidate
async function deleteOtp({ purpose, identifier }) {
  const key = `otp:${purpose}:${identifier}`;
  await redis.del(key);
}

module.exports = {
  createOtp,
  verifyOtp,
  deleteOtp,
};
