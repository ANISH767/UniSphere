const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Club = require('../models/Club');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get logged-in user's profile with populated clubs and events
// @access  Private
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('joinedClubs', 'name description');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const registrations = await Registration.find({ student: req.user.userId })
      .populate('event', 'title date location');

    res.status(200).json({
      ...user.toObject(),
      rsvpEvents: registrations.map((reg) => reg.event).filter(Boolean)
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH /api/users/:id/role
// @desc    Update a user's role
// @access  Private (Admin)
router.patch('/:id/role', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['student', 'faculty', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/users/:id/engagement
// @desc    Get dynamic student engagement score
// @access  Private (Admin, Faculty, or the User themselves)
router.get('/:id/engagement', verifyToken, async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (req.user.role === 'student' && req.user.userId !== targetUserId) {
      return res.status(403).json({ message: 'Access denied: Cannot view other users\' engagement' });
    }

    const user = await User.findById(targetUserId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const attendances = await Registration.countDocuments({
      student: targetUserId,
      checkedIn: true
    });

    const clubAffiliations = await Club.countDocuments({
      members: targetUserId
    });

    const engagementScore = (attendances * 10) + (clubAffiliations * 25);

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      },
      stats: {
        eventsAttended: attendances,
        clubsJoined: clubAffiliations
      },
      engagementScore
    });
  } catch (error) {
    console.error('Error calculating engagement score:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
