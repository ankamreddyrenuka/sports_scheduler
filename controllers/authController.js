const User = require('../models/User');

module.exports = {
  showLogin: (req, res) => {
    res.render('login', { title: 'Login' });
  },

  showRegister: (req, res) => {
    res.render('register', { title: 'Register' });
  },

  register: async (req, res) => {
    try {
      const { name, email, password, password2 } = req.body;
      if (!name || !email || !password) {
        req.flash('error', 'All fields are required');
        return res.redirect('/auth/register');
      }
      if (password !== password2) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/auth/register');
      }
      const existing = await User.findOne({ email });
      if (existing) {
        req.flash('error', 'Email already registered');
        return res.redirect('/auth/register');
      }
      const user = new User({ name, email, password });
      await user.save();
      req.session.user = { id: user._id, name: user.name, email: user.email };
      req.flash('success', 'Registration successful');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Registration failed');
      res.redirect('/auth/register');
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        req.flash('error', 'Please enter email and password');
        return res.redirect('/auth/login');
      }
      const user = await User.findOne({ email });
      if (!user) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/auth/login');
      }
      const ok = await user.comparePassword(password);
      if (!ok) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/auth/login');
      }
      req.session.user = { id: user._id, name: user.name, email: user.email };
      req.flash('success', 'Logged in successfully');
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Login error');
      res.redirect('/auth/login');
    }
  },

  logout: (req, res) => {
    req.session.destroy(err => {
      res.clearCookie('connect.sid');
      res.redirect('/');
    });
  }
};
