const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const UPLOAD_PATHS = {
  avatars: path.join(UPLOADS_DIR, 'avatars'),
  events: path.join(UPLOADS_DIR, 'events'),
  businesses: path.join(UPLOADS_DIR, 'businesses'),
  messages: path.join(UPLOADS_DIR, 'messages'),
};

// Ensure upload directories exist
Object.values(UPLOAD_PATHS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// File size limits (in bytes)
const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024,      // 5 MB
  eventImage: 10 * 1024 * 1024,  // 10 MB
  businessPhoto: 10 * 1024 * 1024, // 10 MB
  messageMedia: 15 * 1024 * 1024, // 15 MB
};

// Allowed MIME types (images only)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Image resize dimensions
const IMAGE_SIZES = {
  avatar: { width: 400, height: 400, fit: 'cover' },
  avatarThumb: { width: 100, height: 100, fit: 'cover' },
  eventImage: { width: 1200, height: 800, fit: 'inside' },
  eventThumb: { width: 400, height: 267, fit: 'cover' },
  businessPhoto: { width: 1200, height: 800, fit: 'inside' },
  businessThumb: { width: 400, height: 267, fit: 'cover' },
};

// ---------------------------------------------------------------------------
// File filter -- only allow images
// ---------------------------------------------------------------------------

const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname),
      false
    );
    // Attach a friendlier message for the error handler
    cb.message = `Invalid file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, GIF.`;
  }
};

// ---------------------------------------------------------------------------
// Storage configuration -- store in memory for sharp processing
// ---------------------------------------------------------------------------

const memoryStorage = multer.memoryStorage();

// ---------------------------------------------------------------------------
// Multer upload instances
// ---------------------------------------------------------------------------

/**
 * Avatar upload -- single file, 5 MB limit.
 */
const avatarUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.avatar,
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single('avatar');

/**
 * Event image upload -- up to 10 images, 10 MB each.
 */
const eventImageUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.eventImage,
    files: 10,
  },
  fileFilter: imageFileFilter,
}).array('images', 10);

/**
 * Business photo upload -- up to 20 images, 10 MB each.
 */
const businessPhotoUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.businessPhoto,
    files: 20,
  },
  fileFilter: imageFileFilter,
}).array('photos', 20);

/**
 * Message media upload -- single image, 15 MB limit.
 */
const messageMediaUpload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: FILE_SIZE_LIMITS.messageMedia,
    files: 1,
  },
  fileFilter: imageFileFilter,
}).single('media');

// ---------------------------------------------------------------------------
// Image processing helpers (sharp)
// ---------------------------------------------------------------------------

/**
 * Process and save a single image buffer using sharp.
 *
 * @param {Buffer} buffer - Raw file buffer
 * @param {string} destDir - Destination directory
 * @param {Object} sizeConfig - { width, height, fit }
 * @param {Object} [options] - Additional options
 * @param {number} [options.quality=85] - JPEG quality
 * @param {string} [options.format='jpeg'] - Output format
 * @returns {Promise<string>} Relative path to the saved file
 */
const processImage = async (buffer, destDir, sizeConfig, options = {}) => {
  const { quality = 85, format = 'jpeg' } = options;
  const filename = `${uuidv4()}.${format === 'jpeg' ? 'jpg' : format}`;
  const filepath = path.join(destDir, filename);

  let pipeline = sharp(buffer)
    .resize(sizeConfig.width, sizeConfig.height, {
      fit: sizeConfig.fit || 'inside',
      withoutEnlargement: true,
    });

  if (format === 'jpeg') {
    pipeline = pipeline.jpeg({ quality, progressive: true });
  } else if (format === 'png') {
    pipeline = pipeline.png({ quality });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality });
  }

  await pipeline.toFile(filepath);

  // Return path relative to uploads directory for URL construction
  const relativePath = path.relative(UPLOADS_DIR, filepath);
  return `/uploads/${relativePath}`;
};

// ---------------------------------------------------------------------------
// Middleware wrappers with image processing
// ---------------------------------------------------------------------------

/**
 * Handle avatar upload with processing.
 * Produces a main avatar (400x400) and a thumbnail (100x100).
 * Attaches { avatarUrl, avatarThumbUrl } to req.processedFiles.
 */
const handleAvatarUpload = (req, res, next) => {
  avatarUpload(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    if (!req.file) {
      return next();
    }

    try {
      const mainUrl = await processImage(
        req.file.buffer,
        UPLOAD_PATHS.avatars,
        IMAGE_SIZES.avatar
      );

      const thumbUrl = await processImage(
        req.file.buffer,
        UPLOAD_PATHS.avatars,
        IMAGE_SIZES.avatarThumb,
        { quality: 80 }
      );

      req.processedFiles = {
        avatarUrl: mainUrl,
        avatarThumbUrl: thumbUrl,
      };

      next();
    } catch (processError) {
      logger.error('Avatar processing error:', processError);
      return res.status(500).json({
        success: false,
        error: 'Image processing failed',
        message: 'Failed to process the uploaded avatar image.',
      });
    }
  });
};

/**
 * Handle event image upload with processing.
 * Produces main images (1200x800) and thumbnails (400x267).
 * Attaches { images: [{ url, thumbUrl }] } to req.processedFiles.
 */
const handleEventImageUpload = (req, res, next) => {
  eventImageUpload(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      const processed = await Promise.all(
        req.files.map(async (file) => {
          const url = await processImage(
            file.buffer,
            UPLOAD_PATHS.events,
            IMAGE_SIZES.eventImage
          );
          const thumbUrl = await processImage(
            file.buffer,
            UPLOAD_PATHS.events,
            IMAGE_SIZES.eventThumb,
            { quality: 80 }
          );
          return { url, thumbUrl };
        })
      );

      req.processedFiles = { images: processed };
      next();
    } catch (processError) {
      logger.error('Event image processing error:', processError);
      return res.status(500).json({
        success: false,
        error: 'Image processing failed',
        message: 'Failed to process uploaded event images.',
      });
    }
  });
};

/**
 * Handle business photo upload with processing.
 * Produces main photos (1200x800) and thumbnails (400x267).
 * Attaches { photos: [{ url, thumbUrl }] } to req.processedFiles.
 */
const handleBusinessPhotoUpload = (req, res, next) => {
  businessPhotoUpload(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    if (!req.files || req.files.length === 0) {
      return next();
    }

    try {
      const processed = await Promise.all(
        req.files.map(async (file) => {
          const url = await processImage(
            file.buffer,
            UPLOAD_PATHS.businesses,
            IMAGE_SIZES.businessPhoto
          );
          const thumbUrl = await processImage(
            file.buffer,
            UPLOAD_PATHS.businesses,
            IMAGE_SIZES.businessThumb,
            { quality: 80 }
          );
          return { url, thumbUrl };
        })
      );

      req.processedFiles = { photos: processed };
      next();
    } catch (processError) {
      logger.error('Business photo processing error:', processError);
      return res.status(500).json({
        success: false,
        error: 'Image processing failed',
        message: 'Failed to process uploaded business photos.',
      });
    }
  });
};

/**
 * Handle message media upload with processing.
 * Attaches { mediaUrl } to req.processedFiles.
 */
const handleMessageMediaUpload = (req, res, next) => {
  messageMediaUpload(req, res, async (err) => {
    if (err) {
      return handleMulterError(err, res);
    }

    if (!req.file) {
      return next();
    }

    try {
      const mediaUrl = await processImage(
        req.file.buffer,
        UPLOAD_PATHS.messages,
        { width: 1200, height: 1200, fit: 'inside' }
      );

      req.processedFiles = { mediaUrl };
      next();
    } catch (processError) {
      logger.error('Message media processing error:', processError);
      return res.status(500).json({
        success: false,
        error: 'Image processing failed',
        message: 'Failed to process the uploaded media.',
      });
    }
  });
};

// ---------------------------------------------------------------------------
// Multer error handler helper
// ---------------------------------------------------------------------------

const handleMulterError = (err, res) => {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File is too large. Please upload a smaller file.',
      LIMIT_FILE_COUNT: 'Too many files uploaded. Please reduce the number of files.',
      LIMIT_UNEXPECTED_FILE: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
      LIMIT_PART_COUNT: 'Too many parts in the upload request.',
      LIMIT_FIELD_KEY: 'Field name is too long.',
      LIMIT_FIELD_VALUE: 'Field value is too long.',
      LIMIT_FIELD_COUNT: 'Too many fields in the upload request.',
    };

    return res.status(400).json({
      success: false,
      error: 'Upload error',
      message: messages[err.code] || 'An error occurred during file upload.',
      code: err.code,
    });
  }

  // Generic upload error
  logger.error('Upload error:', err);
  return res.status(500).json({
    success: false,
    error: 'Upload error',
    message: 'An unexpected error occurred during file upload.',
  });
};

/**
 * Utility: delete a file from the uploads directory.
 *
 * @param {string} fileUrl - The URL path (e.g. /uploads/avatars/abc.jpg)
 */
const deleteUploadedFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    // Convert URL path to absolute filesystem path
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const absolutePath = path.join(UPLOADS_DIR, relativePath);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      logger.debug(`Deleted uploaded file: ${absolutePath}`);
    }
  } catch (err) {
    logger.warn(`Failed to delete file ${fileUrl}:`, err.message);
  }
};

module.exports = {
  handleAvatarUpload,
  handleEventImageUpload,
  handleBusinessPhotoUpload,
  handleMessageMediaUpload,
  deleteUploadedFile,
  processImage,
  UPLOAD_PATHS,
  UPLOADS_DIR,
  FILE_SIZE_LIMITS,
  ALLOWED_MIME_TYPES,
  IMAGE_SIZES,
};
