import User from "../models/User.js";

import jwt from "jsonwebtoken"

export const protectRoute=async (req,res,next)=> {
    try {
        const token=req.cookies.jwt
        if(!token){
            return res.status(400).json({message:"unauthorised"})
        }

        const decoded=jwt.verify(token,process.env.jwt_key)

        if(!decoded) return res.status(400).json({message:"Unauthorised invalid token"})

        const user=await User.findById(decoded.userId).select("-password")

        if(!user) return res.status(400).json({message:"Unauthorised User Not Found"})

        req.user=user

        next()
        
    } catch (error) {

        console.log(`Error ${error}`)
        res.status(400).json({message:'Internal Server Error'})

        
        
    }
}