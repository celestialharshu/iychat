const mongoose = require("mongoose");
const Message = require("../models/Message");

// @route GET /api/messages/conversations
// returns every person the logged-in user has ever exchanged messages
// with, along with their last message and how many are unread —
// this is what makes the sidebar list permanent across logins/devices
const getConversations = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
      // only messages this user sent or received
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
        },
      },
      // newest message first, so $first below grabs the latest one
      { $sort: { createdAt: -1 } },
      // figure out who "the other person" is on each message
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"],
          },
        },
      },
      // collapse all messages down to one entry per other person
      {
        $group: {
          _id: "$otherUser",
          lastMessageText: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          unreadCount: {
            $sum: {
              // only messages THEY sent to ME that I haven't read count as unread
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", myId] },
                    { $eq: ["$isRead", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // most recently active conversation first
      { $sort: { lastMessageAt: -1 } },
      // attach that user's public profile info
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: "$userInfo._id",
          username: "$userInfo.username",
          email: "$userInfo.email",
          avatar: "$userInfo.avatar",
          lastMessageText: 1,
          lastMessageAt: 1,
          unreadCount: 1,
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

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

    // mark messages from the other person as read, since we're now
    // opening this conversation and viewing them
    await Message.updateMany(
      { sender: userId, receiver: myId, isRead: false },
      { $set: { isRead: true } }
    );

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

module.exports = { getMessages, sendMessage, getConversations };
