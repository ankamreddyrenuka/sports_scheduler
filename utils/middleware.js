module.exports.requireAuth = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.flash('error', 'You must be logged in to access that page');
  res.redirect('/auth/login');
};
function adminOnly(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).send('Access Denied');
  }
  next();
}

module.exports = adminOnly;
