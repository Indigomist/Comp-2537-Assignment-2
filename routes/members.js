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

  if (randomImage === 1) {
    imageFile = 'shiny_knight.png';
  } else if (randomImage === 2) {
    imageFile = 'blood_knight.png';
  } else if (randomImage === 3) {
    imageFile = 'dark_knight.png';
  }

  // Serve the members.html page and include the image
  res.send(`
    <h1>Welcome, ${req.session.user.name}</h1> <!-- Assuming user data is in the session -->
    <h2>Here is your member image:</h2>
    <img src="/images/${imageFile}" style="width:300px;">
    <br><a href="/logout">Logout</a>
  `);
});

module.exports = router;