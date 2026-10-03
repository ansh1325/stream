import {StreamChat} from "stream-chat"

import "dotenv/config"

const apiKey=process.env.STEAM_API_KEY
const apiSecret=process.env.STEAM_API_SECRET


if(!apiKey||!apiSecret) console.log("API  KEY OR SECRET MISSING")

const streamClient=StreamChat.getInstance(apiKey,apiSecret)

export const upsertStramUser= async function (userData) {
    try {
        await streamClient.upsertUsers([userData])
        return userData
    } catch (error) {
        console.log(`Error ${error}`)
    }
}

export const generatestreamToken=async function (userId) {
    try {
        userIdStr=userId.toString()
        return streamClient.createToken(userIdStr)
    } catch (error) {
        console.log(`Error in stream token ${error}`)
        
    }
}