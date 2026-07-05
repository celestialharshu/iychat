require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const { initSocket, onlineUsers } = require("./socket/socketHandler");
const { setIO } = require("./controllers/messageController");
const { setFollowIO } = require("./controllers/followController");

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
setIO(io);
setFollowIO(io, onlineUsers);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
