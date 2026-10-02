import express from "express"
import { protectRoute } from "../middleware/auth.middleware";
import { acceptFriendRequest, getMyFriends, getRecommendedUsers } from "../controllers/user.controller.js";

const router=express.Router()

router.use(protectRoute)

router.get("/friends",getMyFriends)
router.get("/",getRecommendedUsers)

router.get("/friend-request/:id",sendFriendRequest)
router.get("/friend-request/:id/accept",acceptFriendRequest)


export default router;