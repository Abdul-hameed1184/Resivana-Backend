import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://resivana.onrender.com",
      "https://resivana-abdul-hameeds-projects-3a791a40.vercel.app",
      "https://resivana.vercel.app",
    ],
  },
});

const userSocketMap = {};

export const getRecieverSocketId = (userId) => {
    console.log(userId, userSocketMap[userId])
    return userSocketMap[userId];
}
io.on("connection", (socket) => {
  console.log("A user coonnected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId]

  });
});

export { io, app, server };
