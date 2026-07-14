const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const sendEmail = require('../utils/email');

const router = express.Router();

// @route   POST /api/notifications/remind
// @desc    Send automated email reminders for events in the next 24 hours
// @access  Private (Admin)
router.post('/remind', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const now = new Date();
    const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = await Event.find({
      date: { $gte: now, $lte: next24Hours },
      status: 'Approved'
    });

    if (upcomingEvents.length === 0) {
      return res.status(200).json({ message: 'No events occurring in the next 24 hours' });
    }

    let emailsSent = 0;

    for (const event of upcomingEvents) {
      const registrations = await Registration.find({
        event: event._id
      }).populate('student', 'name email');

      for (const reg of registrations) {
        if (reg.student && reg.student.email) {
          const ticketLink = `http://localhost:3000/ticket?token=${reg.attendanceToken}`;
          const message = `Hi ${reg.student.name},\n\nThis is a reminder for the upcoming event "${event.title}" happening on ${event.date.toLocaleString()}.\n\nYour QR Ticket Link: ${ticketLink}\n\nSee you there!`;

          await sendEmail({
            email: reg.student.email,
            subject: `Reminder: Upcoming Event - ${event.title}`,
            message
          });

          emailsSent++;
        }
      }
    }

    res.status(200).json({ message: `Successfully sent ${emailsSent} reminder emails` });
  } catch (error) {
    console.error('Error sending reminders:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
