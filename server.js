require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB client
const client = new MongoClient(process.env.MONGO_URI);

// Import routes
const { router: authRoutes, setUsersCollection } = require('./routes/auth');
const membersRoute = require('./routes/members');
const adminRoute = require('./routes/admin');

async function startServer() {
  try {
    await client.connect();
    const db = client.db('Assignment1DB');
    const usersCollection = db.collection('users');

    // Make the usersCollection available to auth and admin routers
    setUsersCollection(usersCollection);
    // If your admin router needs the collection, you can also inject it similarly:
    // const { setUsersCollection: setAdminCollection } = require('./routes/admin');
    // setAdminCollection(usersCollection);

    // Session middleware
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          client,
          dbName: db.databaseName,
          collectionName: 'sessions',
          ttl: 60 * 60, // 1 hour
        }),
        cookie: {
          maxAge: 60 * 60 * 1000, // 1 hour
        },
      })
    );

    // Home page
    app.get('/', (req, res) => {
      res.render('index', { title: 'Home' });
    });

    // Authentication routes (signup, login, logout)
    app.use('/', authRoutes);

    // Members area (protected)
    app.use('/', membersRoute);

    // Admin dashboard (protected by admin middleware inside adminRoute)
    app.use('/', adminRoute);

    // 404 handler
    app.use((req, res) => {
      res.status(404).render('404', { title: '404 - Page Not Found' });
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer();
