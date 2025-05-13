const express = require("express");
const { ObjectId } = require("mongodb");
const { requireAdmin } = require("./middleware");

const router = express.Router();

// Placeholder for usersCollection to be injected from server.js
let usersCollection;

function setUsersCollection(collection) {
  usersCollection = collection;
}

// List all users (Admin Dashboard)
router.get("/admin", requireAdmin, async (req, res) => {
  try {
    const users = await usersCollection.find({}).toArray();
    res.render("admin", { title: "User Management", users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Promote user to admin
router.post("/admin/promote/:id", requireAdmin, async (req, res) => {
  try {
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: "admin" } }
    );
    res.redirect("/admin");
  } catch (err) {
    console.error("Error promoting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Demote user to regular
router.post("/admin/demote/:id", requireAdmin, async (req, res) => {
  try {
    await usersCollection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: "user" } }
    );
    res.redirect("/admin");
  } catch (err) {
    console.error("Error demoting user:", err);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = {
  router,
  setUsersCollection
};
