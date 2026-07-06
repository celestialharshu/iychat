const Notification = require("../models/Notification");
const FollowRequest = require("../models/FollowRequest");

// @route GET /api/notifications
const getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    })
      .populate("actor", "username avatar")
      .sort({ createdAt: -1 });

    // for follow_request notifications, attach the current request status
    // so the client knows whether to show accept/reject buttons or the
    // final "started following you" / "declined" text on first load
    const withStatus = await Promise.all(
      notifications.map(async (n) => {
        const obj = n.toObject();
        if (n.type === "follow_request" && n.followRequestId) {
          const req2 = await FollowRequest.findById(n.followRequestId).select("status");
          obj._requestStatus = req2 ? req2.status : "pending";
        }
        return obj;
      })
    );

    res.status(200).json(withStatus);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/notifications/read
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );
    res.status(200).json({ message: "Marked all as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { getAll, markAllRead };
