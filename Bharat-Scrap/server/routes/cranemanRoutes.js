const express = require("express");
const router = express.Router();

const { authenticateAccessToken } = require("../utils/jwtUtil");
const rateLimiter = require("../middleware/rateLimiter");
const multer = require('multer');
// const { changeStatus } = require("../controllers/cranemanController");
const craneManController = require("../controllers/cranemanController");

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

router.patch('/job/:jobId/status', authenticateAccessToken, craneManController.changeStatus);
router.put("/job/:jobId/inspection-details", authenticateAccessToken, upload.array('images', 5), craneManController.updateInspectionDetails);
router.put("/car-payment-update/:jobId", authenticateAccessToken, craneManController.paymentDetailsUpdate);


module.exports = router;