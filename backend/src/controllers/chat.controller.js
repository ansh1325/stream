import { generatestreamToken } from "../lib/stream.js"

export async function getStreamToken(req,res) {
    try {
        const token = await generatestreamToken(req.user.id || req.user._id)
        res.status(200).json({token})
    } catch (error) {
        console.log(`Error in stream token: ${error}`)
        res.status(500).json({message:"Internal Server Error"})
    }
}