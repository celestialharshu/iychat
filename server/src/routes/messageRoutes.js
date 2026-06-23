const express = require("express");
const {
  getMessages,
  sendMessage,
  getConversations,
} = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// IMPORTANT: /conversations must be declared before /:userId
// otherwise Express treats "conversations" as the :userId value
router.get("/conversations", protect, getConversations);
router.get("/:userId", protect, getMessages);
router.post("/:userId", protect, sendMessage);

module.exports = router;
