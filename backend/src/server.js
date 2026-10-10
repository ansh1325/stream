import express from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import cors from "cors"
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import chatRoutes from "./routes/chat.routes.js"
import { connectDB } from './lib/db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/chat", chatRoutes)

if (process.env.NODE_ENV === 'production') {
    const frontendDist = fs.existsSync(path.join(__dirname, "../../frontend/dist"))
        ? path.join(__dirname, "../../frontend/dist")
        : path.join(process.cwd(), "frontend/dist");

    app.use(express.static(frontendDist))
    app.get("*", (req, res) => {
        res.sendFile(path.join(frontendDist, "index.html"))
    })
}

app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`)
    connectDB()
})