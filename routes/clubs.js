const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const Club = require('../models/Club');
const User = require('../models/User');

const router = express.Router();

// @route   GET /api/clubs
// @desc    Get all clubs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const clubs = await Club.find()
      .populate('president', 'name email')
      .populate('members', 'name email');
    res.status(200).json(clubs);
  } catch (error) {
    console.error('Error fetching clubs:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/clubs
// @desc    Create a club
// @access  Private (Admin only)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { name, description, president } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const newClub = new Club({
      name: name.trim(),
      description: description.trim(),
      president: president || undefined
    });

    await newClub.save();
    const populatedClub = await Club.findById(newClub._id)
      .populate('president', 'name email')
      .populate('members', 'name email');

    res.status(201).json({ message: 'Club created successfully', club: populatedClub });
  } catch (error) {
    console.error('Error creating club:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/clubs/:id/join
// @desc    Join a club
// @access  Private (Student, Faculty)
router.post('/:id/join', verifyToken, checkRole(['student', 'faculty']), async (req, res) => {
  try {
    const clubId = req.params.id;
    const userId = req.user.userId;

    const club = await Club.findById(clubId);
    if (!club) {
      return res.status(404).json({ message: 'Club not found' });
    }

    if (club.members.some((memberId) => memberId.toString() === userId)) {
      return res.status(400).json({ message: 'You are already a member of this club' });
    }

    club.members.push(userId);
    await club.save();

    await User.findByIdAndUpdate(userId, { $addToSet: { joinedClubs: clubId } });

    const updatedClub = await Club.findById(clubId)
      .populate('president', 'name email')
      .populate('members', 'name email');

    res.status(200).json({ message: 'Successfully joined the club', club: updatedClub });
  } catch (error) {
    console.error('Error joining club:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
