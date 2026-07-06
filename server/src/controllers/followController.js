const FollowRequest = require("../models/FollowRequest");
const Notification = require("../models/Notification");
const User = require("../models/User");

let _io = null;
let _onlineUsers = null;

const setFollowIO = (io, onlineUsers) => {
  _io = io;
  _onlineUsers = onlineUsers;
};

// push a real-time event to a user if they're currently online
function notifyUser(userId, event, data) {
  if (!_io || !_onlineUsers) return;
  const socketId = _onlineUsers.get(userId.toString());
  if (socketId) _io.to(socketId).emit(event, data);
}

// @route POST /api/follow/send/:userId
const sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.userId;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }

    const receiver = await User.findById(receiverId).select("-password");
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = await FollowRequest.findOne({
      sender: senderId,
      receiver: receiverId,
    });

    if (existing) {
      return res.status(409).json({
        message: "Request already sent",
        status: existing.status,
      });
    }

    const request = await FollowRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    // create a permanent notification for the receiver
    const notification = await Notification.create({
      recipient: receiverId,
      actor: senderId,
      type: "follow_request",
      followRequestId: request._id,
    });

    // populate actor so the client can render it immediately without refetching
    await notification.populate("actor", "username avatar");

    // push to receiver in real time if they're online
    notifyUser(receiverId, "new_notification", notification.toObject());

    res.status(201).json({ message: "Follow request sent", request });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/follow/accept/:requestId
const acceptRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId).populate(
      "sender",
      "username"
    );

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "accepted";
    await request.save();

    // create a permanent notification for the original sender
    const notification = await Notification.create({
      recipient: request.sender._id,
      actor: req.user._id,
      type: "request_accepted",
      followRequestId: request._id,
    });

    await notification.populate("actor", "username avatar");

    // push to the original sender in real time
    notifyUser(
      request.sender._id,
      "new_notification",
      notification.toObject()
    );

    res.status(200).json({
      message: "Request accepted",
      requestId: request._id.toString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route POST /api/follow/reject/:requestId
const rejectRequest = async (req, res) => {
  try {
    const request = await FollowRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Request rejected" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/follow/pending
// still needed for backward compat — returns pending count for bell badge on load
const getPendingRequests = async (req, res) => {
  try {
    const requests = await FollowRequest.find({
      receiver: req.user._id,
      status: "pending",
    })
      .populate("sender", "username email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// @route GET /api/follow/status/:userId
const getStatus = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    const sentRequest = await FollowRequest.findOne({
      sender: myId,
      receiver: otherId,
    });

    const receivedRequest = await FollowRequest.findOne({
      sender: otherId,
      receiver: myId,
    });

    res.status(200).json({
      outgoing: sentRequest ? sentRequest.status : "none",
      incoming: receivedRequest ? receivedRequest.status : "none",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getPendingRequests,
  getStatus,
  setFollowIO,
};
