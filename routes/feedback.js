const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const Feedback = require('../models/Feedback');

const router = express.Router();

// @route   POST /api/feedback
// @desc    Submit event feedback or platform dispute
// @access  Private (Student, Faculty)
router.post('/', verifyToken, checkRole(['student', 'faculty']), async (req, res) => {
  try {
    const { type, content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newFeedback = new Feedback({
      user: userId,
      type: type || 'Feedback',
      content
    });

    await newFeedback.save();

    res.status(201).json({ message: 'Submission received successfully', feedback: newFeedback });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback and disputes
// @access  Private (Admin)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.status(200).json(feedbacks);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PATCH /api/feedback/:id/resolve
// @desc    Update status and add resolution notes to a dispute/feedback
// @access  Private (Admin)
router.patch('/:id/resolve', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { status, resolutionNotes } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    if (status) feedback.status = status;
    if (resolutionNotes) feedback.resolutionNotes = resolutionNotes;

    await feedback.save();

    res.status(200).json({ message: 'Feedback resolved successfully', feedback });
  } catch (error) {
    console.error('Error resolving feedback:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
