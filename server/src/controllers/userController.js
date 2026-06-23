const User = require("../models/User");

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

module.exports = { getAllUsers, getUserById, searchUsers };
