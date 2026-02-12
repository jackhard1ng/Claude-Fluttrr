const jwt = require('jsonwebtoken');
const { User, Business } = require('../models');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fluttrr-dev-jwt-secret-2024';

/**
 * Extract JWT token from Authorization header.
 * Supports "Bearer <token>" format.
 */
const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;

  return parts[1];
};

/**
 * Verify a JWT token and return the decoded payload.
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Required authentication middleware.
 * Rejects request with 401 if no valid token is present.
 * Attaches the authenticated user to req.user.
 */
const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided. Please include a Bearer token in the Authorization header.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Your authentication token has expired. Please log in again.',
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'The provided authentication token is invalid.',
        });
      }
      throw err;
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'The user associated with this token no longer exists.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: 'Account suspended',
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    if (user.status === 'deactivated') {
      return res.status(403).json({
        success: false,
        error: 'Account deactivated',
        message: 'Your account has been deactivated. Please reactivate your account to continue.',
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    logger.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
      message: 'An internal error occurred during authentication.',
    });
  }
};

/**
 * Optional authentication middleware.
 * Attaches user to req.user if a valid token is present, but does not reject
 * the request if no token or an invalid token is provided. Useful for routes
 * that behave differently for authenticated vs. anonymous users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      req.user = null;
      return next();
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      // Invalid or expired token -- treat as unauthenticated
      req.user = null;
      return next();
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
    });

    if (user && user.status === 'active') {
      req.user = user;
      req.token = token;
    } else {
      req.user = null;
    }

    next();
  } catch (err) {
    // On error, proceed as unauthenticated rather than blocking the request
    logger.warn('Optional auth middleware error:', err.message);
    req.user = null;
    next();
  }
};

/**
 * Role-based authorization middleware.
 * Must be used after requireAuth. Checks that the authenticated user has
 * one of the specified roles (account_type).
 *
 * @param  {...string} roles - Allowed roles (e.g. 'admin', 'business')
 * @returns {Function} Express middleware
 *
 * Usage:
 *   router.get('/admin/dashboard', requireAuth, requireRole('admin'), handler);
 *   router.get('/manage', requireAuth, requireRole('admin', 'business'), handler);
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.',
      });
    }

    if (!roles.includes(req.user.account_type)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${roles.join(', ')}. Your current role is '${req.user.account_type}'.`,
      });
    }

    next();
  };
};

/**
 * Business owner authorization middleware.
 * Must be used after requireAuth. Verifies that the authenticated user
 * owns the business identified by req.params.businessId (or req.params.id
 * on business routes). Admins bypass this check.
 *
 * Usage:
 *   router.put('/businesses/:businessId', requireAuth, requireBusinessOwner, handler);
 */
const requireBusinessOwner = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource.',
      });
    }

    // Admins can manage any business
    if (req.user.account_type === 'admin') {
      return next();
    }

    const businessId = req.params.businessId || req.params.id;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: 'Bad request',
        message: 'Business ID is required.',
      });
    }

    const business = await Business.findByPk(businessId);

    if (!business) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Business not found.',
      });
    }

    if (business.owner_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to manage this business.',
      });
    }

    // Attach business to request for downstream use
    req.business = business;
    next();
  } catch (err) {
    logger.error('Business owner check error:', err);
    return res.status(500).json({
      success: false,
      error: 'Authorization error',
      message: 'An internal error occurred during authorization.',
    });
  }
};

module.exports = {
  requireAuth,
  optionalAuth,
  requireRole,
  requireBusinessOwner,
  extractToken,
  verifyToken,
  JWT_SECRET,
};
