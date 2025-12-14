const express = require('express');
const router = express.Router();
const { ensureAuth, ensureAdmin } = require('../middleware/auth');
const Team = require('../models/Team');
const Event = require('../models/Event');

router.get('/', ensureAdmin, async (req,res) => {
  const teams = await Team.find().lean();
  const events = await Event.find().sort({ date: 1 }).lean();
  res.render('admin', { teams, events });
});

module.exports = router;
