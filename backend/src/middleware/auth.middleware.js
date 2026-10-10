import User from "../models/User.js";

import jwt from "jsonwebtoken"

export const protectRoute=async (req,res,next)=> {
    try {
        const token=req.cookies.jwt
        if(!token){
            return res.status(401).json({message:"Unauthorized: No token provided"})
        }

        const jwtSecret = process.env.jwt_key || process.env.JWT_SECRET
        const decoded=jwt.verify(token,jwtSecret)

        if(!decoded) return res.status(401).json({message:"Unauthorized: Invalid token"})

        const user=await User.findById(decoded.userId).select("-password")

        if(!user) return res.status(401).json({message:"Unauthorized: User not found"})

        req.user=user

        next()
        
    } catch (error) {

        console.log(`Error in auth middleware: ${error}`)
        res.status(401).json({message:'Unauthorized'})

        
        
    }
}