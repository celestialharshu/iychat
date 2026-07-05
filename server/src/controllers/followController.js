const FollowRequest = require("../models/FollowRequest");
const User = require("../models/User");

let _io = null;
let _onlineUsers = null;

const setFollowIO = (io, onlineUsers) => {
  _io = io;
  _onlineUsers = onlineUsers;
};

// push a real-time event to a user if they're online right now
function notifyUser(userId, event, data) {
  if (!_io || !_onlineUsers) return;
  const socketId = _onlineUsers.get(userId.toString());
  if (socketId) {
    _io.to(socketId).emit(event, data);
  }
}

// @route POST /api/follow/send/:userId
// send a follow request to another user
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

    // check if a request already exists in either direction
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

    // notify the receiver in real time
    notifyUser(receiverId, "follow_request", {
      requestId: request._id,
      sender: {
        _id: req.user._id,
        username: req.user.username,
      },
    });

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

    // notify the original sender that their request was accepted
    notifyUser(request.sender._id, "request_accepted", {
      requestId: request._id,
      acceptedBy: {
        _id: req.user._id,
        username: req.user.username,
      },
    });

    res.status(200).json({ message: "Request accepted", request });
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
// returns all pending requests sent TO the logged-in user (their inbox)
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
// returns the follow relationship status between the logged-in user and :userId
// used by ProfileCard to know which button state to show
const getStatus = async (req, res) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    // check if I sent a request to them
    const sentRequest = await FollowRequest.findOne({
      sender: myId,
      receiver: otherId,
    });

    // check if they sent a request to me
    const receivedRequest = await FollowRequest.findOne({
      sender: otherId,
      receiver: myId,
    });

    res.status(200).json({
      // "none" | "pending" | "accepted" | "rejected"
      outgoing: sentRequest ? sentRequest.status : "none",
      // whether THEY followed ME and it was accepted
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
