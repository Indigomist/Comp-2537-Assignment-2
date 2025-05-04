const express = require('express');
const path = require('path');
const router = express.Router();

// Middleware to protect the members route
function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/'); // Redirect to login if no session
  }
  next(); // Continue if user is logged in
}

// GET /members route - Members-only page
router.get('/members', requireLogin, (req, res) => {
  // Serve the members.html page only if the user is logged in
  res.sendFile(path.join(__dirname, '..', 'public', 'members.html'));
});

module.exports = router;
