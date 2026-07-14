const express = require('express');
const { verifyToken, checkRole } = require('../middleware/auth');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

const router = express.Router();

// @route   GET /api/analytics/faculty
// @desc    Get historical attendance rates and predictive forecasts for faculty
// @access  Private (Faculty)
router.get('/faculty', verifyToken, checkRole(['faculty']), async (req, res) => {
  try {
    const facultyId = req.user.userId;
    const now = new Date();

    const pastEvents = await Event.find({
      organizer: facultyId,
      date: { $lt: now }
    });

    const pastEventIds = pastEvents.map(e => e._id);

    const historicalStats = await Registration.aggregate([
      { $match: { event: { $in: pastEventIds } } },
      {
        $group: {
          _id: null,
          totalRegistrations: { $sum: 1 },
          totalAttendees: { $sum: { $cond: ['$checkedIn', 1, 0] } }
        }
      }
    ]);

    let attendanceRate = 0.5;
    if (historicalStats.length > 0 && historicalStats[0].totalRegistrations > 0) {
      attendanceRate = historicalStats[0].totalAttendees / historicalStats[0].totalRegistrations;
    }

    const upcomingEvents = await Event.find({
      organizer: facultyId,
      date: { $gte: now }
    }).lean();

    const upcomingEventIds = upcomingEvents.map(e => e._id);

    const upcomingRegistrations = await Registration.aggregate([
      { $match: { event: { $in: upcomingEventIds } } },
      {
        $group: {
          _id: '$event',
          currentRegistrations: { $sum: 1 }
        }
      }
    ]);

    const regMap = {};
    upcomingRegistrations.forEach(r => {
      regMap[r._id.toString()] = r.currentRegistrations;
    });

    const forecasts = upcomingEvents.map(event => {
      const currentRegs = regMap[event._id.toString()] || 0;
      const forecastedAttendees = Math.round(currentRegs * attendanceRate);

      return {
        ...event,
        currentRegistrations: currentRegs,
        forecastedAttendees,
        confidenceBasedOnHistoricalRate: attendanceRate
      };
    });

    res.status(200).json({
      historicalAttendanceRate: attendanceRate,
      forecasts
    });
  } catch (error) {
    console.error('Error in faculty analytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/faculty/ideal-dates
// @desc    Predict ideal event dates and times based on historical attendance
// @access  Private (Faculty)
router.get('/faculty/ideal-dates', verifyToken, checkRole(['faculty']), async (req, res) => {
  try {
    const pastEvents = await Event.find({ date: { $lt: new Date() } }).lean();
    
    if (pastEvents.length === 0) {
      return res.status(200).json({ 
        message: 'Insufficient data for prediction. Defaulting to general suggestions.',
        idealDays: ['Wednesday', 'Thursday'],
        idealTimes: ['14:00', '16:00']
      });
    }

    const dayCounts = {};
    const timeCounts = {};

    pastEvents.forEach(e => {
      const day = new Date(e.date).toLocaleDateString('en-US', { weekday: 'long' });
      const time = e.time;
      const attendees = e.attendees ? e.attendees.length : 0;
      
      if (!dayCounts[day]) dayCounts[day] = { count: 0, attendance: 0 };
      if (!timeCounts[time]) timeCounts[time] = { count: 0, attendance: 0 };
      
      dayCounts[day].count += 1;
      dayCounts[day].attendance += attendees;
      
      timeCounts[time].count += 1;
      timeCounts[time].attendance += attendees;
    });

    const calculateAverage = (stats) => {
      return Object.entries(stats).map(([key, data]) => ({
        key,
        average: data.count > 0 ? data.attendance / data.count : 0
      })).sort((a, b) => b.average - a.average);
    };

    const bestDays = calculateAverage(dayCounts).slice(0, 3).map(d => d.key);
    const bestTimes = calculateAverage(timeCounts).slice(0, 3).map(t => t.key);

    res.status(200).json({
      idealDays: bestDays.length > 0 ? bestDays : ['Wednesday', 'Thursday'],
      idealTimes: bestTimes.length > 0 ? bestTimes : ['14:00', '16:00']
    });

  } catch (error) {
    console.error('Error predicting ideal dates:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/analytics/admin
// @desc    Get platform-wide participation trends (Heatmap data)
// @access  Private (Admin)
router.get('/admin', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const heatmapData = await Registration.aggregate([
      {
        $lookup: {
          from: 'events',
          localField: 'event',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      { $unwind: '$eventDetails' },
      {
        $lookup: {
          from: 'clubs',
          localField: 'eventDetails.club',
          foreignField: '_id',
          as: 'clubDetails'
        }
      },
      {
        $unwind: {
          path: '$clubDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      { $unwind: { path: '$eventDetails.tags', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: {
            clubName: { $ifNull: ['$clubDetails.name', 'Independent'] },
            tag: { $ifNull: ['$eventDetails.tags', 'Uncategorized'] }
          },
          engagement: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          clubName: '$_id.clubName',
          tag: '$_id.tag',
          engagement: 1
        }
      },
      { $sort: { engagement: -1 } }
    ]);

    res.status(200).json({ heatmapData });
  } catch (error) {
    console.error('Error in admin analytics:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
