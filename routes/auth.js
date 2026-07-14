const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const VALID_ROLES = ['student', 'faculty', 'admin'];

const normalizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase();
};

const buildAuthUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  academicInterests: user.academicInterests || []
});

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name : (typeof req.body.Name === 'string' ? req.body.Name : '');
    const email = normalizeEmail(req.body.email || req.body.Email);
    const password = typeof req.body.password === 'string' ? req.body.password : (typeof req.body.Password === 'string' ? req.body.Password : '');
    const role = typeof (req.body.role || req.body.Role) === 'string' ? (req.body.role || req.body.Role).toLowerCase() : 'student';
    const academicInterests = Array.isArray(req.body.academicInterests)
      ? req.body.academicInterests
          .map((interest) => String(interest).trim())
          .filter(Boolean)
      : [];

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email,
      password: hashedPassword,
      role,
      academicInterests
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: buildAuthUser(newUser)
    });
  } catch (error) {
    console.error('Error in signup:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email || req.body.Email);
    const password = typeof req.body.password === 'string' ? req.body.password : (typeof req.body.Password === 'string' ? req.body.Password : '');

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.password || typeof user.password !== 'string') {
      console.error('Login blocked: stored password hash missing or invalid for user', user._id);
      return res.status(500).json({ message: 'User account is misconfigured. Please register again.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user._id,
      role: user.role
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: buildAuthUser(user)
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      ...buildAuthUser(user)
    });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, academicInterests } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) {
      user.name = name.trim();
    }
    
    if (Array.isArray(academicInterests)) {
      user.academicInterests = academicInterests.map(i => String(i).trim()).filter(Boolean);
    }

    await user.save();

    res.status(200).json({
      ...buildAuthUser(user)
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
