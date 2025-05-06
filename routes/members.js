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
  // Randomly choose an image (1, 2, or 3)
  const randomImage = Math.floor(Math.random() * 3) + 1;
  let imageFile = '';

  // Set image filename based on random selection
  if (randomImage === 1) {
    imageFile = 'shiny_knight.png';
  } else if (randomImage === 2) {
    imageFile = 'blood_knight.png';
  } else if (randomImage === 3) {
    imageFile = 'dark_knight.png';
  }

  // Serve the members.html page and inject the image filename into the HTML
  res.sendFile(path.join(__dirname, '..', 'public', 'members.html'), (err) => {
    if (err) {
      return res.status(500).send('Error serving members page');
    }
  });
});

module.exports = router;