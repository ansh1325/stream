import express from 'express'

import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import { connectDB } from './lib/db.js'
dotenv.config()

const app=express()

const PORT=process.env.PORT
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth",authRoutes)




// app.get("/api/auth/login",(req,res)=>{
//     res.send("Login Route")
// })

// app.get("/api/auth/logout",(req,res)=>{
//     res.send("Logout Route")
// })


app.listen(PORT,()=>{
    console.log(`Server is listening on ${PORT}`)
    connectDB()
})