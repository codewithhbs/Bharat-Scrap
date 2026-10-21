const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticateAccessToken } = require("../utils/jwtUtil");
const rateLimiter = require("../middleware/rateLimiter");
const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  documents: ['application/pdf']
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files at once (optional)
  },
  fileFilter: (req, file, cb) => {
    const allAllowedTypes = [
      ...ALLOWED_FILE_TYPES.images,
      ...ALLOWED_FILE_TYPES.documents
    ];

    if (allAllowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error('Only images (JPEG, PNG, GIF, WEBP) and PDF files are allowed!'),
        false
      );
    }
  }
});

router.post("/register", authController.register);
router.post("/verify-user", authController.verifyUser);
router.post("/resend-otp", authController.resendOTP);

router.post(
  "/login",
  rateLimiter({
    windowSeconds: 60,         // 1 minute
    maxRequests: 5,            // 1 minute me max 5 attempts
    keyPrefix: "rl:login",
    getKey: (req, ip) => {
      // IP + email dono milayenge, taaki thoda strict ho
      const email = req.body?.email || "no-email";
      return `login:${ip}:${email}`;
    },
  }),
  authController.login
);

router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);


// Protected route
router.get("/me", authenticateAccessToken, authController.me);
router.put("/update_user_profile", authenticateAccessToken, upload.single('userIdImage'), authController.profileUpdate)

// Forgot password – OTP send
router.post(
  "/forgot-password",
  rateLimiter({
    windowSeconds: 60, // 1 min
    maxRequests: 3,
    keyPrefix: "rl:forgot-password",
    getKey: (req, ip) => {
      const email = req.body?.email || "no-email";
      return `forgot:${ip}:${email}`;
    },
  }),
  authController.resetPassword
);

// Verify OTP
router.post(
  "/verify-reset-otp",
  rateLimiter({
    windowSeconds: 300, // 5 min
    maxRequests: 5,
    keyPrefix: "rl:verify-otp",
    getKey: (req, ip) => {
      const email = req.body?.email || "no-email";
      return `verify:${ip}:${email}`;
    },
  }),
  authController.verifyResetOtp
);

router.post("/update_location", authenticateAccessToken, authController.updateLocation);


module.exports = router;
