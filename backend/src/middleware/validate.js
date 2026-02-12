const { body, validationResult } = require('express-validator');

/**
 * Generic validation middleware.
 * Runs after express-validator chains and returns 422 with structured errors
 * if any validation failures are present.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
      location: err.location,
    }));

    return res.status(422).json({
      success: false,
      error: 'Validation failed',
      message: 'The request contains invalid data. Please check the errors below.',
      errors: formattedErrors,
    });
  }

  next();
};

// ---------------------------------------------------------------------------
// Common validation chains
// ---------------------------------------------------------------------------

/**
 * Validation rules for user registration.
 */
const registerValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9._]+$/)
    .withMessage('Username can only contain letters, numbers, dots, and underscores'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  body('display_name')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters'),

  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, non-binary, other, prefer_not_to_say'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be 100 characters or less'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('interests.*')
    .optional()
    .isString()
    .withMessage('Each interest must be a string')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each interest must be 50 characters or less'),

  validate,
];

/**
 * Validation rules for user login.
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate,
];

/**
 * Validation rules for creating/updating an event.
 */
const eventValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ min: 3, max: 300 })
    .withMessage('Title must be between 3 and 300 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Description must be between 10 and 10,000 characters'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'trivia', 'board_games', 'music', 'dance', 'fitness', 'food_drink',
      'art', 'comedy', 'networking', 'workshop', 'sports', 'outdoor',
      'wellness', 'karaoke', 'open_mic', 'happy_hour', 'themed_night',
      'community', 'education', 'charity', 'holiday', 'special', 'other',
    ])
    .withMessage('Invalid event category'),

  body('start_time')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid ISO 8601 date'),

  body('end_time')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid ISO 8601 date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_time)) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address must be 500 characters or less'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State must be 100 characters or less'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number'),

  body('max_attendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),

  body('age_restriction')
    .optional()
    .isIn(['all_ages', '18+', '21+'])
    .withMessage('Age restriction must be one of: all_ages, 18+, 21+'),

  body('is_virtual')
    .optional()
    .isBoolean()
    .withMessage('is_virtual must be a boolean'),

  body('virtual_link')
    .optional()
    .isURL()
    .withMessage('Virtual link must be a valid URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each tag must be 50 characters or less'),

  body('vibe_tags')
    .optional()
    .isArray()
    .withMessage('Vibe tags must be an array'),

  body('vibe_tags.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each vibe tag must be 50 characters or less'),

  body('difficulty_level')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced', 'all_levels'])
    .withMessage('Difficulty level must be one of: beginner, intermediate, advanced, all_levels'),

  validate,
];

/**
 * Validation rules for creating/updating a business.
 */
const businessValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Business name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Business name must be between 2 and 200 characters'),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Description must be 10,000 characters or less'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'restaurant', 'bar', 'cafe', 'gym', 'bowling', 'arcade', 'bookstore',
      'gallery', 'theater', 'music_venue', 'sports', 'wellness', 'retail',
      'coworking', 'park', 'library', 'community_center', 'other',
    ])
    .withMessage('Invalid business category'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ max: 500 })
    .withMessage('Address must be 500 characters or less'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State must be 100 characters or less'),

  body('zip_code')
    .trim()
    .notEmpty()
    .withMessage('Zip code is required')
    .isLength({ max: 20 })
    .withMessage('Zip code must be 20 characters or less'),

  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone must be 20 characters or less'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Website must be a valid URL'),

  body('price_range')
    .optional()
    .isIn(['free', '$', '$$', '$$$', '$$$$'])
    .withMessage('Price range must be one of: free, $, $$, $$$, $$$$'),

  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),

  body('amenities.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Each amenity must be 100 characters or less'),

  validate,
];

/**
 * Validation rules for sending a chat message.
 */
const messageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message must be between 1 and 5,000 characters'),

  body('type')
    .optional()
    .isIn(['text', 'image', 'video', 'audio', 'file', 'location', 'event_share', 'system'])
    .withMessage('Invalid message type'),

  body('reply_to')
    .optional()
    .isUUID(4)
    .withMessage('reply_to must be a valid UUID'),

  body('mentions')
    .optional()
    .isArray()
    .withMessage('Mentions must be an array'),

  body('mentions.*')
    .optional()
    .isUUID(4)
    .withMessage('Each mention must be a valid UUID'),

  validate,
];

/**
 * Validation rules for updating a user profile.
 */
const profileUpdateValidation = [
  body('display_name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Display name must be between 1 and 100 characters'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be 500 characters or less'),

  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number must be 20 characters or less'),

  body('date_of_birth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date (YYYY-MM-DD)'),

  body('gender')
    .optional()
    .isIn(['male', 'female', 'non-binary', 'other', 'prefer_not_to_say'])
    .withMessage('Gender must be one of: male, female, non-binary, other, prefer_not_to_say'),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('City must be 100 characters or less'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('State must be 100 characters or less'),

  body('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country must be 100 characters or less'),

  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('interests')
    .optional()
    .isArray()
    .withMessage('Interests must be an array'),

  body('interests.*')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Each interest must be 50 characters or less'),

  body('notification_preferences')
    .optional()
    .isObject()
    .withMessage('Notification preferences must be an object'),

  body('privacy_settings')
    .optional()
    .isObject()
    .withMessage('Privacy settings must be an object'),

  validate,
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  eventValidation,
  businessValidation,
  messageValidation,
  profileUpdateValidation,
};
