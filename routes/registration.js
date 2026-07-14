const express = require('express');
const crypto = require('crypto');
const { verifyToken, checkRole } = require('../middleware/auth');
const Registration = require('../models/Registration');
const Event = require('../models/Event');

const router = express.Router();

// @route   POST /api/registration
// @desc    Register a student for an event and generate QR token
// @access  Private (Student)
router.post('/', verifyToken, checkRole(['student']), async (req, res) => {
  try {
    const { eventId } = req.body;
    const userId = req.user.userId;

    if (!eventId) {
      return res.status(400).json({ message: 'eventId is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const existing = await Registration.findOne({ event: eventId, student: userId });
    if (existing) {
      return res.status(400).json({ message: 'User is already registered for this event' });
    }

    const attendanceToken = crypto.randomBytes(32).toString('hex');

    const newRegistration = new Registration({
      event: eventId,
      student: userId,
      attendanceToken
    });

    await newRegistration.save();
    await Event.findByIdAndUpdate(eventId, { $addToSet: { attendees: userId } });

    res.status(201).json({
      message: 'Registration successful',
      registration: newRegistration,
      passToken: newRegistration.attendanceToken
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/registration/me
// @desc    Get all registrations for the logged in student
// @access  Private (Student)
router.get('/me', verifyToken, checkRole(['student']), async (req, res) => {
  try {
    const registrations = await Registration.find({ student: req.user.userId })
      .populate('event', 'title date location category')
      .sort({ createdAt: -1 });
    
    res.status(200).json(registrations);
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
