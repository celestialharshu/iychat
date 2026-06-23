const express = require("express");
const { getMessages, sendMessage } = require("../controllers/messageController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/:userId", protect, getMessages);
router.post("/:userId", protect, sendMessage);

module.exports = router;
