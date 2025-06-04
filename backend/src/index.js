import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { connectDB } from "./lib/db.js";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { app, server } from "./lib/socket.js";
import chatRequestRoutes from "./routes/chatRequest.routes.js";


dotenv.config();


app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}))

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
app.use('/api/chat-requests', chatRequestRoutes);

const port = process.env.PORT;

server.listen(port, () => {
    console.log("Server is running on port: "+port);
    connectDB();
});