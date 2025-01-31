import express from "express";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controllers";
import { protectRoute } from "../middleware/protectRoutes";

const router = express.Router()

// router.get("/allUsers", isAdmin, allUsers); // api not needed as we can use getUsersForSidebar api for the same purpose
router.get("/conversations", protectRoute, getUsersForSidebar);
router.get("/user", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

export default router;