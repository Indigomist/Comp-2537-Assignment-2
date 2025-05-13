const express = require("express");
const router = express.Router();
const { requireAdmin } = require("./middleware");

// List all users
router.get("/admin", requireAdmin, async (req, res) => {
  const users = await usersCollection.find({}).toArray();
  res.render("admin", { title: "User Management", users });
});

// Promote user
router.post("/admin/promote/:id", requireAdmin, async (req, res) => {
  await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "admin" } }
  );
  res.redirect("/admin");
});

// Demote user
router.post("/admin/demote/:id", requireAdmin, async (req, res) => {
  await usersCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: { role: "user" } }
  );
  res.redirect("/admin");
});

module.exports = router;
