const mongoose = require("mongoose");
const Message = require("../models/Message");

// this is imported lazily to avoid a circular dependency between app.js
// and socket setup — we attach the io instance after the server starts
let _io = null;
const setIO = (io) => { _io = io; };

// @route GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const myId = new mongoose.Types.ObjectId(req.user._id);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: myId }, { receiver: myId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$sender", myId] }, "$receiver", "$sender"],
          },
        },
      },
      {
        $group: {
          _id: "$otherUser",
          lastMessageText: { $first: "$text" },
          lastMessageAt: { $first: "$createdAt" },
          // who sent it — lets the client show "You: ..." on the preview line
          lastMessageSender: { $first: "$sender" },
          unreadCount: {
            $sum: {
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
      { $sort: { lastMessageAt: -1 } },
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
          lastMessageSender: 1,
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

    // mark unread messages from the other person as read and record when
    const now = new Date();
    await Message.updateMany(
      { sender: userId, receiver: myId, isRead: false },
      { $set: { isRead: true, readAt: now } }
    );

    // tell the sender in real time that their messages were just seen,
    // so their "Seen X ago" label updates without them needing to reload
    if (_io) {
      const { onlineUsers } = require("../socket/socketHandler");
      const senderSocketId = onlineUsers.get(userId.toString());
      if (senderSocketId) {
        _io.to(senderSocketId).emit("messages_read", {
          readBy: myId.toString(),
          readAt: now.toISOString(),
        });
      }
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route POST /api/messages/:userId
const sendMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { text, replyTo } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const messageData = {
      sender: req.user._id,
      receiver: userId,
      text: text.trim(),
    };

    // only attach reply snapshot if the caller provided one
    if (replyTo && replyTo.messageId) {
      messageData.replyTo = {
        messageId: replyTo.messageId,
        text: replyTo.text,
        senderUsername: replyTo.senderUsername,
      };
    }

    const message = await Message.create(messageData);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getMessages, sendMessage, getConversations, setIO };
