const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect('/login');
  }

  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    const user = await User.findByPk(decoded.user.id);

    if (!user) {
      return res.redirect('/login');
    }

    req.session.user = user; // Ensure the user is set in the session
    res.locals.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.redirect('/login');
  }
};
