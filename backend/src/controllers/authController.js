const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { User } = require('../models');
const logger = require('../utils/logger');

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, account_type: user.account_type },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password, display_name, account_type } = req.body;

    if (!username || !email || !password || !display_name) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        message: 'Username, email, password, and display_name are required.',
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      return res.status(400).json({
        success: false,
        error: `A user with this ${field} already exists`,
        message: `The ${field} "${field === 'email' ? email : username}" is already taken.`,
      });
    }

    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password_hash: password,
      display_name,
      account_type: account_type || 'user',
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({ refresh_token: refreshToken });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      data: {
        user: user.toSafeJSON(),
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    logger.error('Register error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        message: error.errors.map((e) => e.message).join(', '),
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Duplicate entry',
        message: 'A user with this email or username already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during registration.',
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing credentials',
        message: 'Email and password are required.',
      });
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'No account found with this email address.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: `Your account has been ${user.status}. Please contact support.`,
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        message: 'Incorrect password.',
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    await user.update({
      last_login: new Date(),
      login_count: user.login_count + 1,
      refresh_token: refreshToken,
      is_online: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: user.toSafeJSON(),
        access_token: accessToken,
        refresh_token: refreshToken,
      },
    });
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during login.',
    });
  }
};

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh-token
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'Missing token',
        message: 'Refresh token is required.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token is invalid or has expired.',
      });
    }

    const user = await User.findByPk(decoded.id);

    if (!user || user.refresh_token !== refresh_token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Refresh token does not match. Please login again.',
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account inactive',
        message: `Your account has been ${user.status}.`,
      });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        access_token: newAccessToken,
      },
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while refreshing the token.',
    });
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    await user.update({
      refresh_token: null,
      is_online: false,
      last_seen: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
      data: null,
    });
  } catch (error) {
    logger.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during logout.',
    });
  }
};

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Current user retrieved successfully.',
      data: { user: user.toSafeJSON() },
    });
  } catch (error) {
    logger.error('GetMe error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while fetching user data.',
    });
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/password
 */
const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        error: 'Missing fields',
        message: 'Current password and new password are required.',
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Weak password',
        message: 'New password must be at least 8 characters long.',
      });
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.',
      });
    }

    const isPasswordValid = await user.comparePassword(current_password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password',
        message: 'Current password is incorrect.',
      });
    }

    await user.update({ password_hash: new_password });

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await user.update({ refresh_token: newRefreshToken });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('Update password error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred while updating the password.',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updatePassword,
};
