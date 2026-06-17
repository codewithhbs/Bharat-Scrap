const express = require("express");
const router = express.Router();

const carController = require("../controllers/carController");
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
    files: 10 // Maximum 10 files at once (optional)
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

router.post(
  "/car-register",
  authenticateAccessToken,
  upload.fields([
    { name: "rcFrontImage", maxCount: 1 },
    { name: "rcBackImage", maxCount: 1 },
  ]),
  carController.carRegister
);
router.put(
  "/car-detail-update/:rcNumber",
  authenticateAccessToken,
  upload.fields([
    { name: "frontImage", maxCount: 1 },
    { name: "backImage", maxCount: 1 },
    { name: "chassisImage", maxCount: 1 },
    { name: "engineImage", maxCount: 1 },
    { name: "tyreImage", maxCount: 1 },
    { name: "odometerImage", maxCount: 1 },
  ]),
  carController.carDetailUpdate
);
router.put("/approve-car-for-sale/:rcNumber", authenticateAccessToken, carController.approveForCarSale);
router.get("/car-details-for-me", authenticateAccessToken, carController.fetchCarDetailForMe);
router.get("/get-car-detail-by-id/:carId", authenticateAccessToken, carController.fetchCarDetailById);
router.get("/test-rc-detail/:rcNumber", carController.testRcDetail);
router.put("/update-assigned-to-crane-man-status/:carId", authenticateAccessToken, carController.UpdateAssignedToCraneManStatus);
router.put("/price-accepted-by-user/:carId", authenticateAccessToken, carController.priceAcceptedByUser);

module.exports = router;