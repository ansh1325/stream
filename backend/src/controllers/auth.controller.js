import { upsertStramUser } from "../lib/stream.js";
import User from "../models/User.js";

import jwt from "jsonwebtoken"
export async function Signup(req,res){
    const {email,password,fullName}=req.body

    try {
        if(!email|| !password || !fullName) return res.status(400).json({message:"All fields required"})

        if(password.length<6) return res.status(400).json({message:"Short Password"})
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser=User.findOne({email})
        if(existingUser) return res.status(400).json({message:"Email Exists"})

        // const idx=Math.floor(Math.random()*100)+1
        const randomAvatar=`https://api.dicebear.com/10.x/lorelei/svg?seed=${fullName}`

        const newUser= await User.create({
            email,fullName,password,profilePic:randomAvatar,
        })

        try {
            await upsertStramUser({id:newUser._id,name:newUser.fullName,image:newUser.profilePic||""})
            console.log("Stream User Created"+newUser._id+" for name "+newUser.fullName)
        } catch (error) {
            console.log(`some error creating stream user${error}`)
        }

        const token=jwt.sign({userId:newUser._id},process.env.jwt_key,{expiresIn:'7d'})


        res.cookie("jwt",token,{maxAge:7*24*60*60*1000,httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==='production'})
        res.status(201).json({success:true,user:newUser})


        
    } catch (error) {
        console.log(`error in signup`)
        res.status(500).json({message:"no worry"})
    }
}
export async function Login(req,res){
    
    try {
        const {email,password}=req.body

        if(!email || !password){
            return res.status(200).json({message:"All fields required "})
        }

        const user = await User.findOne({email})

        if(!user) return res.status(200).json({message:"Not found the user"})
        
        const isPasswordCorrect=await user.matchPassword(password)

        if(!isPasswordCorrect) return res.status(200).json({message:"Invalid mail or password"})

        const token=jwt.sign({userId:user._id},process.env.jwt_key,{expiresIn:"7d"})

        res.cookie("jwt",token,{maxAge:7*24*60*60*1000,httpOnly:true,sameSite:"strict",secure:process.env.NODE_ENV==='production'})
    

    } catch (error) {
        console.log(`THIS IS EROOR${error.message}`)
        res.status(500).json({message:"INTERNAL SERVER ERROR"})
    }
}
export function Logout(req,res){
    res.clearCookie("jwt")
    res.status(200).json({message:"You are logged out",success:true})
}