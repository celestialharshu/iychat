const express = require("express");
const {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getPendingRequests,
  getStatus,
} = require("../controllers/followController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ordering matters: specific paths before parameterized ones
router.get("/pending", protect, getPendingRequests);
router.get("/status/:userId", protect, getStatus);
router.post("/send/:userId", protect, sendRequest);
router.post("/accept/:requestId", protect, acceptRequest);
router.post("/reject/:requestId", protect, rejectRequest);

module.exports = router;
