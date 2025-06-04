import express from "express";
import { login, signup, logout, updateProfile, checkauth, resetPassword, deleteAccount } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/reset-password", resetPassword);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkauth);
router.delete("/delete-account", protectRoute, deleteAccount);

export default router;



