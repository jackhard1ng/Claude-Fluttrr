const multer = require('multer');
const logger = require('../utils/logger');

/**
 * Global error handler middleware.
 * Must be registered as the LAST middleware in the Express app.
 *
 * Catches all errors thrown or passed via next(err) and returns a
 * consistently formatted JSON error response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  // Default error properties
  let statusCode = err.statusCode || err.status || 500;
  let errorType = 'Internal server error';
  let message = 'An unexpected error occurred. Please try again later.';
  let errors = null;

  // ---------------------------------------------------------------------------
  // Sequelize validation errors
  // ---------------------------------------------------------------------------
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    errorType = 'Validation error';
    message = 'The request contains invalid data.';
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      type: e.type,
      value: e.value,
    }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    errorType = 'Duplicate entry';
    const fields = err.errors.map((e) => e.path).join(', ');
    message = `A record with the same ${fields} already exists.`;
    errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      type: 'unique violation',
      value: e.value,
    }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    errorType = 'Reference error';
    message = 'The referenced resource does not exist.';
  }

  if (err.name === 'SequelizeDatabaseError') {
    statusCode = 500;
    errorType = 'Database error';
    message = 'A database error occurred. Please try again later.';
    // Log the full error for debugging but don't expose internals
    logger.error('Database error:', {
      sql: err.sql,
      message: err.message,
      original: err.original?.message,
    });
  }

  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    statusCode = 503;
    errorType = 'Service unavailable';
    message = 'The service is temporarily unavailable. Please try again later.';
  }

  // ---------------------------------------------------------------------------
  // JWT errors
  // ---------------------------------------------------------------------------
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorType = 'Invalid token';
    message = 'The provided authentication token is invalid.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorType = 'Token expired';
    message = 'Your authentication token has expired. Please log in again.';
  }

  if (err.name === 'NotBeforeError') {
    statusCode = 401;
    errorType = 'Token not active';
    message = 'The authentication token is not yet active.';
  }

  // ---------------------------------------------------------------------------
  // Multer (file upload) errors
  // ---------------------------------------------------------------------------
  if (err instanceof multer.MulterError) {
    statusCode = 400;
    errorType = 'Upload error';

    const multerMessages = {
      LIMIT_FILE_SIZE: 'The uploaded file exceeds the maximum allowed size.',
      LIMIT_FILE_COUNT: 'Too many files were uploaded at once.',
      LIMIT_UNEXPECTED_FILE: 'An unexpected file field was encountered. Only image files are allowed.',
      LIMIT_PART_COUNT: 'Too many parts in the multipart request.',
      LIMIT_FIELD_KEY: 'A field name in the request is too long.',
      LIMIT_FIELD_VALUE: 'A field value in the request is too long.',
      LIMIT_FIELD_COUNT: 'Too many fields in the request.',
    };

    message = multerMessages[err.code] || 'An error occurred during file upload.';
  }

  // ---------------------------------------------------------------------------
  // Syntax errors (malformed JSON body)
  // ---------------------------------------------------------------------------
  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    errorType = 'Parse error';
    message = 'The request body contains invalid JSON.';
  }

  // ---------------------------------------------------------------------------
  // Payload too large
  // ---------------------------------------------------------------------------
  if (err.type === 'entity.too.large') {
    statusCode = 413;
    errorType = 'Payload too large';
    message = 'The request payload is too large.';
  }

  // ---------------------------------------------------------------------------
  // Custom application errors (errors with statusCode already set)
  // ---------------------------------------------------------------------------
  if (err.isOperational) {
    statusCode = err.statusCode || 400;
    errorType = err.errorType || 'Application error';
    message = err.message;
  }

  // ---------------------------------------------------------------------------
  // Logging
  // ---------------------------------------------------------------------------
  if (statusCode >= 500) {
    logger.error('Unhandled server error:', {
      statusCode,
      errorType,
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id || null,
    });
  } else if (statusCode >= 400) {
    logger.warn('Client error:', {
      statusCode,
      errorType,
      message: err.message,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id || null,
    });
  }

  // ---------------------------------------------------------------------------
  // Response
  // ---------------------------------------------------------------------------
  const response = {
    success: false,
    error: errorType,
    message,
  };

  // Include detailed validation errors when available
  if (errors) {
    response.errors = errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development' && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Handle 404 -- unknown routes.
 * Place this BEFORE the error handler but AFTER all route definitions.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist.`,
  });
};

/**
 * Custom application error class.
 * Use this to throw operational errors with a specific status code.
 *
 * Usage:
 *   throw new AppError('Event not found', 404);
 *   throw new AppError('Insufficient credits', 402, 'Payment required');
 */
class AppError extends Error {
  constructor(message, statusCode = 400, errorType = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  AppError,
};
