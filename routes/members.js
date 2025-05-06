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

  // GET /members route - Display one of three random images
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

  // Send HTML with the image
  res.send(`
    <h1>Member Image ${id}</h1>
    <img src="/images/${imageFile}" style="width:300px;">
    <br><a href="/logout">Logout</a>
  `);
});

module.exports = router;
