// Keeps track of which socket id belongs to which user id.
// This lets us send a message straight to a specific person instead of
// broadcasting it to everyone connected to the server.
const onlineUsers = new Map(); // userId -> socketId

function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // client tells the server which user just logged in / opened the app
    socket.on("user_online", (userId) => {
      if (!userId) return;
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      // let everyone know the updated online list
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // sending a chat message in real time
    socket.on("send_message", (message) => {
      const receiverSocketId = onlineUsers.get(message.receiver);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_message", message);
      }
      // echo back to sender so their own UI updates too (covers multi-tab use)
      socket.emit("message_sent", message);
    });

    // typing indicator
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
      // only remove the map entry if it still points at THIS socket —
      // if the user already reconnected with a new socket id before this
      // disconnect event fired, we must not delete their new entry
      if (socket.userId && onlineUsers.get(socket.userId) === socket.id) {
        onlineUsers.delete(socket.userId);
        io.emit("online_users", Array.from(onlineUsers.keys()));
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}

module.exports = initSocket;
