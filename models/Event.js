const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  sport: { type: String },
  description: String,
  date: { type: Date, required: true },
  time: String,
  venue: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', EventSchema);
