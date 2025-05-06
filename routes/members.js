const express = require('express');
const path = require('path');
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

router.get('/members', requireLogin, (req, res) => {
  const images = ['shiny_knight.png', 'blood_knight.png', 'dark_knight.png'];
  const randomImage = images[Math.floor(Math.random() * images.length)];

  // Save user data and image filename in session
  req.session.randomImage = randomImage;

  res.sendFile(path.join(__dirname, '..', 'public', 'members.html'));
});

router.get('/members-data', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.json({
    name: req.session.user.name,
    image: req.session.randomImage || null
  });
});

module.exports = router;