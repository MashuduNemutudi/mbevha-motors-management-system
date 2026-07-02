/**
 * middleware/upload.js
 * ─────────────────────────────────────────────────────────────
 * Multer configuration for file uploads.
 *
 * Upload destinations:
 *   /uploads/gallery/  — workshop images (gallery page)
 *   /uploads/parts/    — part images (used parts page)
 *
 * Security measures:
 *   - File type whitelist: JPEG, JPG, PNG, WebP only
 *   - File size limit: 5 MB per file
 *   - Filenames are sanitised and made unique using Date.now()
 *     + a random suffix to prevent collisions and path traversal
 *
 * Usage in routes:
 *   const { uploadGallery, uploadPart } = require('../middleware/upload');
 *   router.post('/gallery', protect, uploadGallery.single('image'), controller);
 * ─────────────────────────────────────────────────────────────
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist at runtime
const UPLOAD_DIRS = {
  gallery: path.join(__dirname, '..', 'uploads', 'gallery'),
  parts:   path.join(__dirname, '..', 'uploads', 'parts'),
};

Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Allowed MIME types ──────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// ── Storage factory ─────────────────────────────────────────
// Returns a DiskStorage instance pointed at the specified folder
const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, destination),
    filename: (req, file, cb) => {
      // Strip whitespace and special chars from original name
      const safeName = file.originalname
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9.\-]/g, '');
      // Prefix with timestamp + random suffix for uniqueness
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}-${safeName}`;
      cb(null, uniqueName);
    },
  });

// ── Configured Multer instances ─────────────────────────────
const uploadGallery = multer({
  storage: createStorage(UPLOAD_DIRS.gallery),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

const uploadPart = multer({
  storage: createStorage(UPLOAD_DIRS.parts),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { uploadGallery, uploadPart };
