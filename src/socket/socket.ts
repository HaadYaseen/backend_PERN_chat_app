import { Server } from "socket.io";
import http from "http";
import express from "express";
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [`${FRONTEND_URL}`],
        methods: ["GET", "POST"]
    }
})

export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId];
}

const userSocketMap: { [key: string]: string } = {} //{userId: socketId}

io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string
    console.log("user connected", socket.id)
    if (userId) userSocketMap[userId] = socket.id;
    // io.emit() to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))
    //socket.on to listen to events on client and server side
    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
});

export { app, io, server }