const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Team = require('../models/Team');

router.get('/', async (req, res) => {
  const events = await Event.find().sort({ date: 1 }).limit(6).lean();
  const teams = await Team.find().limit(6).lean();
  res.render('index', { events, teams });
});

module.exports = router;
