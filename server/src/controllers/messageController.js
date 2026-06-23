const Message = require("../models/Message");

// @route GET /api/messages/:userId
// fetch full conversation history between the logged-in user and :userId
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/messages/:userId
// saves a message to the database (actual real-time delivery happens over socket.io)
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: userId,
      text: text.trim(),
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMessages, sendMessage };
