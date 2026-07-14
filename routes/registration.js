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

module.exports = router;
