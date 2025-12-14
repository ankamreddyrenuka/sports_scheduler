const Team = require('../models/Team');

module.exports = {
  listTeams: async (req, res) => {
    try {
      const teams = await Team.find().sort({ name: 1 });
      res.render('teams', { title: 'Teams', teams });
    } catch (err) {
      req.flash('error', 'Could not load teams');
      res.render('teams', { title: 'Teams', teams: [] });
    }
  },

  showNewForm: (req, res) => {
    res.render('team_form', { title: 'New Team', team: null });
  },

  createTeam: async (req, res) => {
    try {
      const { name, players } = req.body;
      const playersArr = players ? players.split(',').map(p => p.trim()).filter(Boolean) : [];
      const team = new Team({ name, players: playersArr, createdBy: req.session.user.id });
      await team.save();
      req.flash('success', 'Team created');
      res.redirect('/teams');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create team');
      res.redirect('/teams');
    }
  },

  showEditForm: async (req, res) => {
    try {
      const team = await Team.findById(req.params.id);
      if (!team) return res.redirect('/teams');
      res.render('team_form', { title: 'Edit Team', team });
    } catch (err) {
      req.flash('error', 'Error');
      res.redirect('/teams');
    }
  },

  updateTeam: async (req, res) => {
    try {
      const { name, players } = req.body;
      const playersArr = players ? players.split(',').map(p => p.trim()).filter(Boolean) : [];
      await Team.findByIdAndUpdate(req.params.id, { name, players: playersArr });
      req.flash('success', 'Team updated');
      res.redirect('/teams');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Update failed');
      res.redirect('/teams');
    }
  },

  deleteTeam: async (req, res) => {
    try {
      await Team.findByIdAndDelete(req.params.id);
      req.flash('success', 'Team deleted');
      res.redirect('/teams');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Delete failed');
      res.redirect('/teams');
    }
  }
};
