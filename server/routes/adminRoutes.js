const express = require("express");
const router = express.Router();

// const authController = require("../controllers/authController");
const adminController = require("../controllers/adminController");
const { authenticateAccessToken, authorizeRoles } = require("../utils/jwtUtil");
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

router.post("/admin-login", adminController.adminLogin)

router.get("/users", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllUsers);
router.delete("/users/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.deleteUserById);
router.put("/users/:id/block-unblock", authenticateAccessToken, authorizeRoles("admin"), adminController.userBlockUnblock);
router.put("/users/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.updateUserById);
router.get("/users/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.getUserById);

router.get("/dashboard-data", adminController.getDashboardData);

router.get("/cars",authenticateAccessToken, adminController.getAllCars);
router.put("/cars/:id/status", authenticateAccessToken, authorizeRoles("admin"), adminController.changeStatusCarById);
router.delete("/cars/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.deleteCarById);
router.get("/cars/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.getCarById);
router.put("/update-transaction-id/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.updatePaymentTransactionId);

router.get("/crane-users", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllCraneUsers);
router.put("/assign-crane-man/:carId", authenticateAccessToken, authorizeRoles("admin"), adminController.assignCraneMan);
router.post("/create-crane-man", authenticateAccessToken, authorizeRoles("admin"), adminController.createCraneMan);

router.get("/rc-details", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllRcDetails);
router.delete("/rc-details/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.deleteRcDetailById);
router.get("/rc-details/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.getRcDetailById);

router.get("/contact-messages", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllContactMessages);
router.delete("/contact-messages/:id", authenticateAccessToken, authorizeRoles("admin"), adminController.deleteContactMessageById);

router.get("/quote-requests", authenticateAccessToken, authorizeRoles("admin"), adminController.getAllQuoteRequests);

module.exports = router;