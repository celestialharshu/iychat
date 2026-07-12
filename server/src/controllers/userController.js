const User = require("../models/User");
const FollowRequest = require("../models/FollowRequest");

// Profile photos are stored as base64 data URLs directly on the user document.
// The browser shrinks each one to about 20 KB before sending it, which Mongo
// handles comfortably and saves us from wiring up S3 or Cloudinary for a
// project this size. This cap is the safety net in case someone bypasses the
// browser and posts a huge string straight at the API.
const MAX_AVATAR_CHARS = 400_000; // roughly 300 KB of image

// @route GET /api/users
// returns every user except the one making the request
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select("-password")
      .sort({ username: 1 });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/users/search?username=someName
// finds users whose username contains the given text (case-insensitive)
// does NOT return the full user list — only matches for what was typed
const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: "Username query is required" });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },
      username: { $regex: username.trim(), $options: "i" },
    })
      .select("-password")
      .limit(10);

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PATCH /api/users/me
// Updates your own username, your photo, or both. Anything you leave out of
// the body is simply left alone.
const updateMe = async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = req.user;

    if (username !== undefined) {
      if (typeof username !== "string") {
        return res.status(400).json({ message: "Username must be text" });
      }

      const name = username.trim();

      if (name.length < 3 || name.length > 20) {
        return res
          .status(400)
          .json({ message: "Username must be 3-20 characters" });
      }

      // usernames are unique, so check before saving and give a friendly
      // error instead of letting Mongo throw a duplicate-key exception
      const taken = await User.findOne({
        username: name,
        _id: { $ne: user._id },
      });

      if (taken) {
        return res.status(409).json({ message: "That username is taken" });
      }

      user.username = name;
    }

    if (avatar !== undefined) {
      if (typeof avatar !== "string") {
        return res.status(400).json({ message: "Avatar must be an image" });
      }

      if (avatar && !avatar.startsWith("data:image/")) {
        return res.status(400).json({ message: "Avatar must be an image" });
      }

      if (avatar.length > MAX_AVATAR_CHARS) {
        return res.status(413).json({ message: "That image is too large" });
      }

      user.avatar = avatar; // an empty string clears the photo
    }

    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/users/:id/profile
// Everything the profile screen needs in a single request: who they are, how
// many followers and following they have, and where I stand with them.
const getProfile = async (req, res) => {
  try {
    const targetId = req.params.id;
    const myId = req.user._id;
    const isMe = String(myId) === String(targetId);

    const user = await User.findById(targetId).select("username email avatar");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // A follow request always goes sender -> receiver. Once it's accepted the
    // sender is following the receiver. So counting this person's followers
    // means counting the accepted requests they RECEIVED, and counting who
    // they follow means counting the ones they SENT.
    const [followers, following, outgoing, incoming] = await Promise.all([
      FollowRequest.countDocuments({ receiver: targetId, status: "accepted" }),
      FollowRequest.countDocuments({ sender: targetId, status: "accepted" }),
      FollowRequest.findOne({ sender: myId, receiver: targetId }),
      FollowRequest.findOne({ sender: targetId, receiver: myId }),
    ]);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      followers,
      following,
      isMe,
      // only you get to see your own email address
      email: isMe ? user.email : undefined,
      // "none" | "pending" | "accepted" | "rejected"
      outgoing: outgoing ? outgoing.status : "none",
      incoming: incoming ? incoming.status : "none",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  searchUsers,
  updateMe,
  getProfile,
};
