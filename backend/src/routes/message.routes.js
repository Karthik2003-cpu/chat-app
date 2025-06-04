import express from "express";
import protectRoute from "../middleware/auth.middleware.js";
import { getUserForSidebar, getMessage, sendMessage} from "../controllers/message.controller.js";
import { getAcceptedChatUsers } from "../controllers/chatRequest.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUserForSidebar);
router.get("/accepted-users", protectRoute, getAcceptedChatUsers);
router.get("/:id", protectRoute, getMessage);
router.post("/send/:id", protectRoute, sendMessage);

export default router;


