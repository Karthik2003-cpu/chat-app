import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
    chatRequests: [],

    setAuthUser: (user) => {
        set({ authUser: user });
        if (user) {
            get().connectSocket();
        }
    },

    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
            const socket = get().socket;
            if (socket) {
                socket.disconnect();
                socket.off("getOnlineUsers");
                socket.off("newChatRequest");
                socket.off("chatRequestAccepted");
                socket.off("chatRequestRejected");
            }
            set({ 
                authUser: null, 
                onlineUsers: [], 
                chatRequests: [],
                socket: null,
                isCheckingAuth: false 
            });
        } catch (error) {
            console.error("Error logging out:", error);
        }
    },

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check");
            if (res.data) {
                set({ authUser: res.data, isCheckingAuth: false });
                get().connectSocket();
            } else {
                set({ authUser: null, isCheckingAuth: false });
            }
            return res.data;
        } catch (error) {
            console.error("Error checking auth:", error);
            set({ authUser: null, isCheckingAuth: false });
            return null;
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ authUser: res.data });
            get().connectSocket();
            toast.success("Account created successfully");
        } catch (error) {
            toast.error(error.response.data.msg);
        } finally {
            set({ isSigningUp: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ authUser: res.data });
            get().connectSocket();
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error(error.response.data.msg);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ authUser: res.data });
            toast.success("Profile updated successfully");
        } catch (error) {
            console.log("error in update profile:", error);
            toast.error(error.response.data.msg);
        } finally {
            set({ isUpdatingProfile: false });
        }
    },

    connectSocket: () => {
        const { authUser } = get();
        if (!authUser || get().socket?.connected) return;
        
        const socket = io(BASE_URL, {
            query: { userId: authUser._id },
            reconnection: false,
            transports: ['websocket'],
        });

        socket.on("connect", () => {
            console.log("Socket connected");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            set({ socket: null, onlineUsers: [] });
        });

        socket.on("connect_error", (error) => {
            console.error("Socket connection error:", error);
            set({ socket: null, onlineUsers: [] });
        });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers: userIds });
        });

        socket.on("newChatRequest", (request) => {
            set((state) => ({
                chatRequests: [...state.chatRequests, request]
            }));
            toast.success("New chat request received!");
        });

        socket.on("chatRequestAccepted", (request) => {
            set((state) => ({
                chatRequests: state.chatRequests.filter(req => req.requestId !== request.requestId)
            }));
            toast.success("Chat request accepted!");
        });

        socket.on("chatRequestRejected", (request) => {
            set((state) => ({
                chatRequests: state.chatRequests.filter(req => req.requestId !== request.requestId)
            }));
            toast.error("Chat request was rejected");
        });

        window.addEventListener('beforeunload', () => {
            if (socket) {
                socket.disconnect();
            }
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket?.connected) {
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    },

    clearChatRequests: () => {
        set({ chatRequests: [] });
    }
}));