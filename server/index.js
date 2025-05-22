const http = require("http");
const cors = require("cors");
require('dotenv').config();
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  "https://video-calling-8jks.vercel.app"
];

// Apply CORS to Express server
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

// Setup Socket.IO with same CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"]
  }
});

// Optional: respond to browser if visited directly
app.get("/", (req, res) => {
  res.send("Socket.io signaling server is running");
});

// Socket.IO logic
const emailtoSocketIdMap = new Map();
const socketIdtoemailMap = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join:room", (data) => {
    const { email, room } = data;
    emailtoSocketIdMap.set(email, socket.id);
    socketIdtoemailMap.set(socket.id, email);

    socket.join(room);
    io.to(room).emit("user:joined", { email, id: socket.id });
    io.to(socket.id).emit("join:room", data);
  });

  socket.on("call:user", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, answer }) => {
    io.to(to).emit("call:accepted", { from: socket.id, answer });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, answer }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, answer });
  });
});

server.listen(port, () => {
  console.log(`Socket.IO server running on port ${port}`);
});
