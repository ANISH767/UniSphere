const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['Feedback', 'Dispute'],
    default: 'Feedback'
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Open', 'Resolved', 'Dismissed'],
    default: 'Open'
  },
  resolutionNotes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
