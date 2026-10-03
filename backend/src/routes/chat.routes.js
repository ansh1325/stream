import express from "express"
import { getStreamToken } from "../controllers/chat.controller.js"
import { protectRoute } from "../middleware/auth.middleware.js"

const router =express.Router()

router.post("/token",protectRoute,getStreamToken)

export default router