const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const Joi = require('joi');

// This will be injected from server.js after MongoDB connects
let usersCollection;

// Setter function so server.js can pass in the MongoDB collection
function setUsersCollection(collection) {
    usersCollection = collection;
}

// GET /signup - Render signup page
router.get('/signup', (req, res) => {
    const error = req.query.error || null;
    res.render('signup', { title: 'Sign Up', error }); // Pass the error to the view
});

// POST /signup - Register a new user
router.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate the username with Joi
    const schema = Joi.string().max(20).required();
    const validationResult = schema.validate(name);
    if (validationResult.error) {
        // Redirect with error message
        return res.redirect('/signup?error=invalid_username');
    }

    try {
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            // Redirect with error message
            return res.redirect('/signup?error=user_exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // ← Insert the new user with a default role of "user"
        const insertResult = await usersCollection.insertOne({
            name,
            email,
            password: hashedPassword,
            role: 'user'
        });

        // Store the role in the session as well
        req.session.user = {
            name,
            email,
            role: 'user'
        };

        res.redirect('/members');
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).send('Internal Server Error');
    }
});


// GET /login - Render login page
router.get('/login', (req, res) => {
    const error = req.query.error || null;
    res.render('login', { title: 'Log In', error }); // Pass the error to the view
});

// POST /login - Authenticate user and start session
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await usersCollection.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            // Redirect with error message
            return res.redirect('/login?error=invalid');
        }

        req.session.user = {
            name: user.name,
            email: user.email,
            role: user.role       
        };

        req.session.user = { name: user.name, email: user.email };
        res.redirect('/members');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal Server Error');
    }
});

// GET /logout - Destroy session
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
