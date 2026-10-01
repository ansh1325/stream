import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js"

export async function getMyFriends() {
    try {
        const user=await User.findById(req.user.id)
        .select("friends")
        .populate("friends","fullName profilePic nativeLanguage learningLanguage")   
         
        res.status(200).json(user.friends)
    } catch (error) {
        console.log(`Error in getmyfriends ${error}`)
        res.status(500).json({message:"Internal Server "})
        
    }
}

export async function getRecommendedUsers() {
 try {
    const currentUser=req.user
    const currentUserId=req.user.id

    const recommendedUsers= await User.find({
        $and: [
  {_id: {$ne: currentUserId}}, //exclude current user
  {$id: {$nin: currentUser.friends}}, // exclude current user's friends
  {isOnboarded: true}
]

    })
    res.status(200).json(recommendedUsers)
 } catch (error) {
    console.log(`Error in recommended Users${error}`)

    res.status(500).json({message:"Internal Server"})
    
 }   
}

export async function sendFriendRequest() {
    try {
        const myId=req.user.id
        const {id:recipientId}=req.params;
        if(myId===recipientId) return res.status(400).json({message:"You can't send request to yourself"})

        const recipient=await User.findById(recipientId)
        if(!recipient) return res.status(400).json({message:"User not found"})

        if(recipient.friends.includes(myId)) return res.status(400).json({message:"You are already friends with this User"})
        
        const existingRequest= await FriendRequest.findOne({
            $or:[
                {sender:myId, recipient:recipientId},
                {sender:recipientId,recipient:myId}
            ],
        })

        if(!existingRequest){
            return res.status(400).json({message:"A friend request already exists between you and this User"})
        
        }

        const friendRequest=await FriendRequest.create({
            sender:myId,
            recipient:recipientId
        })

        return res.status(200).json(friendRequest)

    } catch (error) {
        console.log(`The error in friend Request ${error}`)
        return res.status(500).json({message:"Something wrong in the friend Request"})
    }
}