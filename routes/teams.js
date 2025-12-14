const express = require('express');
const router = express.Router();
const Team = require('../models/Team');
const { ensureAuth, ensureAdmin } = require('../middleware/auth');

router.get('/', async (req,res) => {
  const teams = await Team.find().lean();
  res.render('teams', { teams });
});

/* Admin-only create */
router.post('/', ensureAdmin, async (req,res) => {
  const { name } = req.body;
  await Team.create({ name, createdBy: req.session.user.id });
  res.redirect('/admin');
});

/* Edit form & update */
router.put('/:id', ensureAdmin, async (req,res) => {
  const { name } = req.body;
  await Team.findByIdAndUpdate(req.params.id, { name });
  res.redirect('/admin');
});

/* Delete */
router.delete('/:id', ensureAdmin, async (req,res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
});

module.exports = router;
