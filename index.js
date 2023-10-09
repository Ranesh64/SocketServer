const http = require("http");
const express = require("express");
const { Server: SocketIO } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new SocketIO(server, {
  cors: true,
});
const PORT = process.env.PORT || 8000;

const users = new Map();

app.get("/", (req, res) => {
  res.send("Hey this is my API running 🥳");
});

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
  users.set(socket.id, socket.id);
  console.log("Connected users", users);

  socket.broadcast.emit("user-joined", socket.id);
  socket.on("playerStateChange", (playerState) => {
    console.log("Player state changed", playerState);
    socket.broadcast.emit("playerStateChange", playerState);
  });

  socket.on("outgoing:call", ({ to, from }) => {
    console.log("Outgoing call");
    socket.to(to).emit("incoming:call", {
      offer: from,
      from: socket.id,
    });
  });

  socket.on("iceCandidate", ({ candidate, to }) => {
    console.log("IceCandidate event called");
    socket.to(to).emit("iceCandidate", { candidate });
  });

  socket.on("call:accepted", ({ answer, to }) => {
    console.log("Call accepted");
    socket.to(to).emit("incoming:answer", { offer: answer });
  });
});

// server.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));
app.listen(PORT, () => console.log(`Server started at PORT:${PORT}`));

module.exports = app;
