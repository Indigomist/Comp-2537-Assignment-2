const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// This will be injected from server.js after MongoDB connects
let usersCollection;

// Setter function so server.js can pass in the MongoDB collection
function setUsersCollection(collection) {
  usersCollection = collection;
}

// POST /signup route - Register a new user
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).send('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await usersCollection.insertOne({ name, email, password: hashedPassword });

    res.redirect('/');
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /login route - Authenticate user and start session
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await usersCollection.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid email or password');
    }

    req.session.user = { name: user.name, email: user.email };
    res.redirect('/members');
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// GET /logout route - Destroy session
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Export the router and the setter for the collection
module.exports = {
  router,
  setUsersCollection,
};