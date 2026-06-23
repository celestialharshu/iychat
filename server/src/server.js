require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const initSocket = require("./socket/socketHandler");

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
