const http = require("http");
const express = require("express");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 3000 || process.env.PORT;

io.on("connection", socket => {
    console.log("New client")
})

server.listen(PORT, () => console.log("Server is running on port", PORT));