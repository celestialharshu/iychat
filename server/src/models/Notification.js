const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // the user who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // the user whose action triggered this notification
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      // follow_request  → "X wants to follow you"
      // request_accepted → "X accepted your follow request"
      enum: ["follow_request", "request_accepted"],
      required: true,
    },
    // links back to the FollowRequest so we can accept/reject from the panel
    followRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FollowRequest",
      default: null,
    },
    // whether the recipient has seen/read this notification
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
