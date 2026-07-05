const onlineUsers = new Map(); // userId -> socketId

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("user_online", (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
      // echo back to sender so their own bubble appears immediately
      socket.emit("message_sent", message);
    });

    // fired by the receiver's client when they open a conversation —
    // tells the sender their messages were just seen in real time
    socket.on("mark_read", ({ senderId, readAt }) => {
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messages_read", {
          readBy: socket.userId,
          readAt,
        });
      }
    });

    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stop_typing", ({ senderId, receiverId }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stop_typing", { senderId });
      }
    });

    socket.on("disconnect", () => {
      if (socket.userId && onlineUsers.get(socket.userId) === socket.id) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}

// exported so messageController can look up socket ids when marking
// messages as read via the REST endpoint
module.exports = { initSocket, onlineUsers };
