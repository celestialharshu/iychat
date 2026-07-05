require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { initSocket } = require("./socket/socketHandler");
const { setIO } = require("./controllers/messageController");

const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
  },
});

initSocket(io);

// give the message controller access to the io instance so it can
// push real-time "messages seen" events when someone opens a chat
setIO(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
