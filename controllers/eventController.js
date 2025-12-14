const Event = require('../models/Event');
const Team = require('../models/Team');

module.exports = {
  listEvents: async (req, res) => {
    try {
      const events = await Event.find().populate('teams').sort({ date: 1 });
      res.render('events', { title: 'Events', events });
    } catch (err) {
      req.flash('error', 'Could not load events');
      res.render('events', { title: 'Events', events: [] });
    }
  },

  showNewForm: async (req, res) => {
    const teams = await Team.find().sort({ name: 1 });
    res.render('event_form', { title: 'New Event', event: null, teams });
  },

  createEvent: async (req, res) => {
    try {
      const { title, description, date, location, teamIds } = req.body;
      const selectedTeams = Array.isArray(teamIds) ? teamIds : (teamIds ? [teamIds] : []);
      const event = new Event({
        title,
        description,
        date: new Date(date),
        location,
        teams: selectedTeams,
        createdBy: req.session.user.id
      });
      await event.save();
      req.flash('success', 'Event created');
      res.redirect('/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create event');
      res.redirect('/events');
    }
  },

  showEvent: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id).populate('teams');
      if (!event) {
        req.flash('error', 'Event not found');
        return res.redirect('/events');
      }
      res.render('event_show', { title: event.title, event });
    } catch (err) {
      req.flash('error', 'Error loading event');
      res.redirect('/events');
    }
  },

  showEditForm: async (req, res) => {
    try {
      const event = await Event.findById(req.params.id);
      const teams = await Team.find().sort({ name: 1 });
      if (!event) return res.redirect('/events');
      res.render('event_form', { title: 'Edit Event', event, teams });
    } catch (err) {
      req.flash('error', 'Error');
      res.redirect('/events');
    }
  },

  updateEvent: async (req, res) => {
    try {
      const { title, description, date, location, teamIds } = req.body;
      const selectedTeams = Array.isArray(teamIds) ? teamIds : (teamIds ? [teamIds] : []);
      await Event.findByIdAndUpdate(req.params.id, {
        title, description, date: new Date(date), location, teams: selectedTeams
      });
      req.flash('success', 'Event updated');
      res.redirect('/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Update failed');
      res.redirect('/events');
    }
  },

  deleteEvent: async (req, res) => {
    try {
      await Event.findByIdAndDelete(req.params.id);
      req.flash('success', 'Event deleted');
      res.redirect('/events');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Delete failed');
      res.redirect('/events');
    }
  }
};
