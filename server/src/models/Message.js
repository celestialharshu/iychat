const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    // if this message is a reply, this holds the original message's data
    // we store a snapshot (not just an id) so the preview survives even
    // if the original message is later deleted
    replyTo: {
      messageId: { type: mongoose.Schema.Types.ObjectId, default: null },
      text: { type: String, default: null },
      senderUsername: { type: String, default: null },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    // exact time the receiver opened and read the message
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, receiver: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
