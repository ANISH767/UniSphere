const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const Registration = require('../models/Registration');

const router = express.Router();

// @route   POST /api/attendance/check-in
// @desc    Verify QR token and mark attendance
// @access  Private (Faculty, Admin)
router.post('/check-in', verifyToken, checkRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { qrToken, attendanceToken } = req.body;
    const token = attendanceToken || qrToken;

    if (!token) {
      return res.status(400).json({ message: 'Attendance token is required' });
    }

    const registration = await Registration.findOne({ attendanceToken: token })
      .populate('student', 'name email')
      .populate('event', 'title date');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid attendance token' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({ message: 'Student is already checked in' });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.status(200).json({
      message: 'Check-in successful',
      registration
    });
  } catch (error) {
    console.error('Error during check-in:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
