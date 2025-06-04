import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
    },
    pingTimeout: 60000, // Increase ping timeout
    pingInterval: 25000, // Increase ping interval
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) {
        userSocketMap[userId] = socket.id;
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Handle chat request events
    socket.on("chatRequestSent", (data) => {
        const receiverSocketId = getReceiverSocketId(data.receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newChatRequest", data);
        }
    });

    socket.on("chatRequestAccepted", (data) => {
        const senderSocketId = getReceiverSocketId(data.senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("chatRequestAccepted", data);
        }
    });

    socket.on("chatRequestRejected", (data) => {
        const senderSocketId = getReceiverSocketId(data.senderId);
        if (senderSocketId) {
            io.to(senderSocketId).emit("chatRequestRejected", data);
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
        // Remove user from online list
        const userId = Object.entries(userSocketMap).find(([_, socketId]) => socketId === socket.id)?.[0];
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    // Handle errors
    socket.on("error", (error) => {
        console.error("Socket error:", error);
        const userId = Object.entries(userSocketMap).find(([_, socketId]) => socketId === socket.id)?.[0];
        if (userId) {
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });
});

export { io, app, server };