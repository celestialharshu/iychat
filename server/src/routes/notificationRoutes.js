const express = require("express");
const { getAll, markAllRead } = require("../controllers/notificationController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getAll);
router.post("/read", protect, markAllRead);

module.exports = router;
