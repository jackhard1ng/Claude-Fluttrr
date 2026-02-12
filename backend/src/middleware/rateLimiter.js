const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Common handler invoked when a client exceeds the rate limit.
 */
const rateLimitHandler = (req, res) => {
  logger.warn('Rate limit exceeded:', {
    ip: req.ip,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id || null,
  });

  res.status(429).json({
    success: false,
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please wait before making more requests.',
    retryAfter: res.getHeader('Retry-After'),
  });
};

/**
 * Auth route rate limiter (strict).
 * Protects login, registration, password reset, and similar endpoints
 * from brute-force and credential-stuffing attacks.
 *
 * Limit: 10 requests per 15-minute window per IP.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use IP + email (if present) to prevent distributed brute-force
    const email = req.body?.email || '';
    return `${req.ip}-${email}`;
  },
});

/**
 * General API rate limiter.
 * Applied broadly to all API routes to prevent abuse.
 *
 * Limit: 100 requests per 15-minute window per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP. Please try again later.',
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

/**
 * Upload route rate limiter.
 * Prevents excessive file uploads which consume storage and bandwidth.
 *
 * Limit: 20 requests per 15-minute window per IP.
 */
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many upload requests. Please wait before uploading more files.',
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

/**
 * Strict rate limiter for sensitive operations (e.g. password change, account deletion).
 *
 * Limit: 5 requests per 60-minute window per IP.
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many attempts for this sensitive operation. Please try again in an hour.',
  },
  handler: rateLimitHandler,
  skipSuccessfulRequests: false,
});

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter,
  strictLimiter,
};
