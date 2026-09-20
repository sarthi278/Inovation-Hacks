const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'innovation-hacks-secret-key-2026';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: No Authorization token provided'
      });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: Invalid Bearer token format'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed: User no longer exists'
      });
    }

    req.user = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed: Invalid or expired token',
      details: error.message
    });
  }
};

// Optional auth for development convenience & demo mode
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '').trim();
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        };
      }
    }
  } catch (_) {
    // Ignore optional auth failures
  }
  next();
};

module.exports = { auth, optionalAuth, JWT_SECRET };
