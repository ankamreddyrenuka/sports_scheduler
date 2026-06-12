const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../models/Event');
const Team = require('../models/Team');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

// LIST EVENTS
router.get('/', ensureAuth, async (req, res) => {
  try {
    const events = await Event.find()
      .sort({ date: 1 })
      .populate({
        path: 'teams',
        populate: { path: 'players' }
      })
      .lean();

    const currentUser = req.session.user || null;
    res.render('events', { events, currentUser });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// USER: JOIN EVENT (AJAX)
router.post('/:id/join', ensureAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.session.user._id;
    const userName = req.session.user.name;

    const event = await Event.findById(eventId).populate({
      path: 'teams',
      populate: { path: 'players' }
    });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    // Check if user is already in any team in this event
    const alreadyJoined = event.teams.some(team => {
      // Check if team has players and if user is among them
      if (!team || !team.players || team.players.length === 0) return false;
      return team.players.some(p => {
        if (!p) return false;
        // Handle both ObjectId references and embedded objects
        const playerId = p._id ? p._id.toString() : (typeof p === 'object' ? p.toString() : p);
        return playerId === userId.toString();
      });
    });
    if (alreadyJoined) {
      return res.json({ success: false, message: 'You already joined' });
    }

    // Create a new team for the user with proper player object
    const newTeam = await Team.create({
      name: `${userName}'s Team`,
      players: [{ name: userName, position: 'Player' }],
      createdBy: userId
    });

    event.teams.push(newTeam._id);
    await event.save();

    // Populate players for front-end
    await newTeam.populate('players');

    res.json({
      success: true,
      message: 'Joined',
      teamName: newTeam.name,
      players: newTeam.players.map(p => p.name)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'JOINED!g' });
  }
});

module.exports = router;
