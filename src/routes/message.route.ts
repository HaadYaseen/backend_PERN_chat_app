import express from "express";
import { getMessages, getUsersForSidebar, sendMessage, allUsers } from "../controllers/message.controllers";
import { protectRoute, isAdmin } from "../middleware/protectRoutes";

const router = express.Router()

router.get("/allUsers", isAdmin, allUsers);
router.get("/conversations", protectRoute, getUsersForSidebar);
router.get("/user", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;