const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");
const followRoutes = require("./routes/followRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Profile photos arrive as base64 strings inside the JSON body. Express only
// accepts 100kb by default, which a photo will blow past, so raise the limit.
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("iychat API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notifications", notificationRoutes);

// catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong on the server" });
});

module.exports = app;
