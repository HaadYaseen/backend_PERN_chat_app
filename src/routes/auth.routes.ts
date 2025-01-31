import express from "express";
import { login, logout, signup, changeTime } from "../controllers/auth.controllers";
import { protectRoute, isAdmin, isAllowedTime } from "../middleware/protectRoutes";

const router = express.Router()

router.post("/signup", signup)

router.post("/login", isAllowedTime, login)

router.post("/logout", logout)

router.post("/changeTime", isAdmin, changeTime)

export default router;