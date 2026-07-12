const express = require("express");
const {
  getAllUsers,
  getUserById,
  searchUsers,
  updateMe,
  getProfile,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// IMPORTANT: fixed paths like /search and /me must be declared before /:id,
// otherwise Express treats "search" and "me" as the :id value.
router.get("/search", protect, searchUsers);
router.patch("/me", protect, updateMe);

router.get("/", protect, getAllUsers);
router.get("/:id/profile", protect, getProfile);
router.get("/:id", protect, getUserById);

module.exports = router;
