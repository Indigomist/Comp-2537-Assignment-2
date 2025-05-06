require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const membersRoute = require('./routes/members');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

const client = new MongoClient(process.env.MONGO_URI);

// Import auth routes
const { router: authRoutes, setUsersCollection } = require('./routes/auth');

async function startServer() {
  try {
    await client.connect();
    const db = client.db();
    const usersCollection = db.collection('users');
    setUsersCollection(usersCollection);

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

    app.use('/', authRoutes);
    app.use('/', membersRoute);

    app.get("*", (req,res) => {
      res.status(404);
      res.send("Page not found - 404");
    })

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
      });
  } catch (err) {
    console.error('Error starting server:', err);
  }
}

startServer();