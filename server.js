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

// Import routes and their setUsersCollection functions
const { router: authRoutes, setUsersCollection: setAuthUsersCollection } = require('./routes/auth');
const { router: adminRoutes, setUsersCollection: setAdminUsersCollection } = require('./routes/admin');
const membersRoute = require('./routes/members');

async function startServer() {
  try {
    await client.connect();
    const db = client.db('Assignment1DB');
    const usersCollection = db.collection('users');

    // Inject usersCollection into both routers
    setAuthUsersCollection(usersCollection);
    setAdminUsersCollection(usersCollection);

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

    // Routes
    app.get('/', (req, res) => {
      res.render('index', { title: 'Home' });
    });

    app.use('/', authRoutes);     // Signup, Login
    app.use('/', membersRoute);   // /members
    app.use('/', adminRoutes);    // /admin

    // 404 page
    app.use((req, res) => {
      res.status(404).render('404', { title: '404 - Page Not Found' });
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer();
