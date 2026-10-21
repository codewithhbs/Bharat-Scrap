const multer = require("multer");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// MIME types for voice notes
const voiceMimeTypes = ['audio/wav', 'audio/x-wav', 'audio/m4a', 'audio/x-m4a', 'audio/mp4', 'audio/aac'];
const videoMimeTypes = ['video/mp4', 'video/mpeg']; // Define video MIME types

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;

    // Check the file type to determine the upload directory
    if (voiceMimeTypes.includes(file.mimetype)) {
      uploadDir = path.join(__dirname, './public/voice-notes');
    } else {
      uploadDir = path.join(__dirname, './public/artits'); // Default directory
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdir(uploadDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
          return cb(err);
        }
        cb(null, uploadDir);
      });
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex'); // Generates a 32-character unique string
    const extension = file.originalname.split('.').pop(); // Get the file extension

    cb(null, `${uniqueSuffix}.${extension}`); // Save as uniqueSuffix.extension
  }
});

const fileFilter = (req, file, cb) => {
  const imageMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'image/bmp', 'image/tiff', 'image/avif'
  ];

  const allowedMimeTypes = [
    ...imageMimeTypes,
    'application/pdf',
    ...videoMimeTypes,
    ...voiceMimeTypes
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Unsupported file format'), false);
  }

  // multer puts file size on file object
  const size = file.size;

  // 🖼️ Image → 5MB
  if (imageMimeTypes.includes(file.mimetype) && size > 5 * 1024 * 1024) {
    return cb(new Error('Image size must be less than 5MB'), false);
  }

  // 📄 PDF → 10MB
  if (file.mimetype === 'application/pdf' && size > 10 * 1024 * 1024) {
    return cb(new Error('PDF size must be less than 10MB'), false);
  }

  // 🎥 Video → 50MB
  if (videoMimeTypes.includes(file.mimetype) && size > 50 * 1024 * 1024) {
    return cb(new Error('Video file size exceeds 50MB limit'), false);
  }

  cb(null, true);
};

// Set up multer with storage, file filter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB size limit applied globally
  }
});

module.exports = upload;























/*

const multer = require("multer");
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// MIME types for voice notes
const voiceMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadDir;

    // Check the file type to determine the upload directory
    if (voiceMimeTypes.includes(file.mimetype)) {
      // Directory for voice notes
      uploadDir = path.join(__dirname, './public/voice-notes');
    } else {
      // Directory for images/videos (default behavior)
      uploadDir = path.join(__dirname, './public/artits');
    }

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdir(uploadDir, { recursive: true }, (err) => {
        if (err) {
          console.error('Error creating directory:', err);
          return cb(err);
        }
        cb(null, uploadDir);
      });
    } else {
      cb(null, uploadDir);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex'); // Generates a 32-character unique string
    const extension = file.originalname.split('.').pop(); // Get the file extension

    cb(null, `${uniqueSuffix}.${extension}`); // Save as uniqueSuffix.extension
  }
});

// File filter to restrict uploads to images, videos, and voice notes
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/avif', 'video/mp4', 'video/mpeg',
    ...voiceMimeTypes // Add voice MIME types
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format'), false);
  }
};

// Set up multer with storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
*/