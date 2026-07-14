const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Middleware
const { verifyToken: authMiddleware, checkRole: authorizeRoles } = require('../middleware/auth');

// Models
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const User = require('../models/User');
const Club = require('../models/Club');

const buildInterestRegex = (interest) => new RegExp(interest.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

/**
 * @route   GET /api/events
 * @desc    Get all events
 * @access  Protected (All roles)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email role')
      .sort({ date: 1 })
      .lean();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching events.', error: err.message });
  }
});

/**
 * @route   GET /api/events/recommendations
 * @desc    Get personalized event recommendations based on user interests, clubs, and history (AI)
 * @access  Protected (Any logged in user)
 */
router.get('/recommendations', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedInterests = Array.isArray(user.academicInterests)
      ? user.academicInterests.map((interest) => String(interest).trim()).filter(Boolean)
      : [];

    const userClubs = await Club.find({ members: user._id });
    const clubNames = userClubs.map(c => c.name);

    const pastRegistrations = await Registration.find({ student: user._id, checkedIn: true }).populate('event');
    const pastCategories = pastRegistrations.map(r => r.event?.category).filter(Boolean);

    const allKeywords = [...new Set([...normalizedInterests, ...clubNames, ...pastCategories])];

    const query = allKeywords.length > 0
      ? {
          $or: [
            { category: { $in: allKeywords.map(buildInterestRegex) } },
            { tags: { $in: allKeywords.map(buildInterestRegex) } },
            { title: { $in: allKeywords.map(buildInterestRegex) } },
            { description: { $in: allKeywords.map(buildInterestRegex) } }
          ],
          date: { $gte: new Date() }
        }
      : { date: { $gte: new Date() } };

    const recommended = await Event.find(query)
      .populate('organizer', 'name email role')
      .sort({ date: 1 })
      .limit(6)
      .lean();
    res.json(recommended);
  } catch (err) {
    res.status(500).json({ message: 'AI Engine compilation failure.', error: err.message });
  }
});

/**
 * @route   POST /api/events/verify-pass
 * @desc    Scan/Verify a digital attendance pass token
 * @access  Protected (Faculty & Admin Only)
 */
router.post('/verify-pass', authMiddleware, authorizeRoles('faculty', 'admin'), async (req, res) => {
  try {
    const { attendanceToken } = req.body;

    if (!attendanceToken) {
      return res.status(400).json({ message: 'Attendance token is required.' });
    }

    const registration = await Registration.findOne({ attendanceToken })
      .populate('student', 'name email')
      .populate('event', 'title date');

    if (!registration) {
      return res.status(404).json({ message: 'Invalid pass. Ticket not found in system.' });
    }

    if (registration.checkedIn) {
      return res.status(400).json({
        message: `Already checked in! Verified on ${new Date(registration.checkedInAt).toLocaleString()}`
      });
    }

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({
      message: 'Attendance verified successfully! Welcome to the event.',
      studentName: registration.student.name,
      eventTitle: registration.event.title
    });
  } catch (err) {
    res.status(500).json({ message: 'Verification routine failure.', error: err.message });
  }
});

/**
 * @route   POST /api/events/manual-checkin
 * @desc    Manual check-in for faculty without a QR token
 * @access  Protected (Faculty & Admin Only)
 */
router.post('/manual-checkin', authMiddleware, authorizeRoles('faculty', 'admin'), async (req, res) => {
  try {
    const { studentEmail, eventId } = req.body;
    const student = await User.findOne({ email: studentEmail });
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const registration = await Registration.findOne({ student: student._id, event: eventId })
      .populate('student', 'name email')
      .populate('event', 'title date');
      
    if (!registration) return res.status(404).json({ message: 'Registration not found for this event.' });
    if (registration.checkedIn) return res.status(400).json({ message: 'Already checked in.' });

    registration.checkedIn = true;
    registration.checkedInAt = new Date();
    await registration.save();

    res.json({ message: 'Manual check-in successful!', studentName: registration.student.name });
  } catch (err) {
    res.status(500).json({ message: 'Manual check-in failed.', error: err.message });
  }
});

/**
 * @route   POST /api/events
 * @desc    Create a new event
 * @access  Protected (Faculty & Admin Only)
 */
router.post('/', authMiddleware, authorizeRoles('faculty', 'admin'), async (req, res) => {
  try {
    const { title, description, date, time, location, category, tags } = req.body;

    if (!title || !description || !date || !time || !location) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    const newEvent = new Event({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      location: location.trim(),
      category: category || 'General',
      tags: Array.isArray(tags) ? tags.filter(Boolean) : [],
      organizer: req.user.userId
    });

    const savedEvent = await newEvent.save();
    const populatedEvent = await Event.findById(savedEvent._id)
      .populate('organizer', 'name email role');

    res.status(201).json(populatedEvent);
  } catch (err) {
    res.status(500).json({ message: 'Server error creating event.', error: err.message });
  }
});

/**
 * @route   GET /api/events/:id
 * @desc    Get detailed event info
 * @access  Protected (All roles)
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email role');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching event details.', error: err.message });
  }
});

/**
 * @route   PATCH /api/events/:id/status
 * @desc    Approve or Reject an event
 * @access  Protected (Admin Only)
 */
router.patch('/:id/status', authMiddleware, authorizeRoles('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const event = await Event.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update event status.', error: err.message });
  }
});

/**
 * @route   GET /api/events/:id/clustering
 * @desc    Students Also Attended (AI Collaborative Filtering)
 * @access  Protected (All roles)
 */
router.get('/:id/clustering', authMiddleware, async (req, res) => {
  try {
    const eventId = req.params.id;
    const registrations = await Registration.find({ event: eventId });
    const userIds = registrations.map(r => r.student);

    if (userIds.length === 0) return res.json([]);

    const otherRegistrations = await Registration.find({
      student: { $in: userIds },
      event: { $ne: eventId }
    }).populate('event');

    const eventCounts = {};
    otherRegistrations.forEach(r => {
      if (r.event) {
        const id = r.event._id.toString();
        if (!eventCounts[id]) {
          eventCounts[id] = { event: r.event, count: 0 };
        }
        eventCounts[id].count += 1;
      }
    });

    const clusteredEvents = Object.values(eventCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.event);

    res.json(clusteredEvents);
  } catch (err) {
    res.status(500).json({ message: 'Clustering engine failure.', error: err.message });
  }
});

/**
 * @route   POST /api/events/:id/register
 * @desc    Register a student for an event and generate a digital QR pass
 * @access  Protected (Logged in users)
 */
router.post('/:id/register', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can RSVP to events.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    let existingReg = await Registration.findOne({ event: req.params.id, student: req.user.userId });

    if (existingReg) {
      return res.status(400).json({ message: 'You have already registered for this event.' });
    }

    const uniqueToken = crypto.randomBytes(16).toString('hex');
    const newRegistration = new Registration({
      event: req.params.id,
      student: req.user.userId,
      attendanceToken: `UNISPHERE-${req.params.id}-${req.user.userId}-${uniqueToken}`
    });

    await newRegistration.save();
    await Event.findByIdAndUpdate(req.params.id, { $addToSet: { attendees: req.user.userId } });

    res.status(201).json({
      message: 'Registration successful! Pass generated.',
      passToken: newRegistration.attendanceToken,
      registrationId: newRegistration._id
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to process event registration.', error: err.message });
  }
});

module.exports = router;
