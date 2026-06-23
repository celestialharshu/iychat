const express = require("express");
const {
  getAllUsers,
  getUserById,
  searchUsers,
} = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// IMPORTANT: /search must be declared before /:id
// otherwise Express treats "search" as the :id value
router.get("/search", protect, searchUsers);
router.get("/", protect, getAllUsers);
router.get("/:id", protect, getUserById);

module.exports = router;
