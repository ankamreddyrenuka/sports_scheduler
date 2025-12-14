const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // <- only this line, do not redefine
const router = express.Router();

function redirectIfLoggedIn(req,res,next){
  if (req.session.user) return res.redirect('/');
  next();
}

router.get('/login', redirectIfLoggedIn, (req,res) => res.render('login',{ error: null }));
router.get('/register', redirectIfLoggedIn, (req,res) => res.render('register',{ error: null }));

router.post('/register', redirectIfLoggedIn, async (req,res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.render('register',{ error: 'All fields required' });
    if (await User.findOne({ email })) return res.render('register',{ error: 'Email already used' });
    const hash = await bcrypt.hash(password, 12);
    const user = new User({ name, email, passwordHash: hash });
    await user.save();
    req.session.user = { id: user._id, name: user.name, role: user.role, email: user.email };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('register',{ error: 'Registration failed' });
  }
});

router.post('/login', redirectIfLoggedIn, async (req,res) => {
  try {
    const { email, password } = req.body;
    const emailNormalized = email.toLowerCase(); // normalize
    const user = await User.findOne({ email: emailNormalized });

    if (!user) return res.render('login',{ error: 'Invalid credentials: email not found' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.render('login',{ error: 'Invalid credentials: wrong password' });

    req.session.user = { id: user._id, name: user.name, role: user.role, email: user.email };
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('login',{ error:'Login failed' });
  }
});


router.post('/logout', (req,res) => {
  req.session.destroy(()=> res.redirect('/'));
});

module.exports = router;
