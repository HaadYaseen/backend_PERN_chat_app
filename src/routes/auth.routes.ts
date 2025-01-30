import express from "express";
import { login, logout, signup, getMe, changeTime, createTime } from "../controllers/auth.controllers";
import { protectRoute, isAdmin, isAllowedTime } from "../middleware/protectRoutes";

const router = express.Router()

router.get("/me", protectRoute, getMe)

router.post("/signup", signup)

router.post("/login", login) // add middleware isALlowedTime (which has been tested and is functional (currently not implemented for testing purposes))

router.post("/logout", logout)

router.post("/changeTime", isAdmin, changeTime)

router.post("/createTime", isAdmin, createTime)

export default router;