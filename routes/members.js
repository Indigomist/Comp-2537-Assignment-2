const express = require('express');
const router = express.Router();

function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/');
  }
  next();
}

router.get('/members', requireLogin, (req, res) => {
  res.render('members', {
    name: req.session.user.name, 
  });
});

module.exports = router;

