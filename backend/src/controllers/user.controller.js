import User from "../models/User.js"
import FriendRequest from "../models/FriendRequest.js"

export async function getMyFriends(req,res) {
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

export async function getRecommendedUsers(req,res) {
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

export async function sendFriendRequest(req,res) {
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

export async function acceptFriendRequest(req,res) {
    try {
        const {id:requestId} = req.params

        const friendRequest=await FriendRequest.findById(requestId)

        if(!friendRequest) return res.status(400).json({message:"Friend Request Does not exist"})
        
        if(friendRequest.recipient.toString()!==req.user.id) return res.status(400).json({message:"You are not authorised to view this request"})
        
        friendRequest.status="accepted"

        await friendRequest.save()

        await User.findByIdAndUpdate(friendRequest.sender,{
            $addToSet: { friends: friendRequest.recipient }
        })

        await User.findByIdAndUpdate(friendRequest.recipient,{
            $addToSet:{
                friends:friendRequest.sender
            }
        })


        res.status(200).json({message:"Friend Request Accepted"})
    } catch (error) {

        console.log(`Error accepting Friend Request ${error}`)

        res.status(500).json({message:'Friend REquest acceptance error'})
        
    }
}


export async function getFriendRequests(req,res) {
    try {
        const incomingReqs=await FriendRequest.find({
            recipient:req.user.id,
            status:"pending"
        }).populate("sender","fullName profilePic nativeLanguage learningLanguage")

        const acceptedRequest=await FriendRequest.find({
            sender:req.user.id,
            status:"accepted"
        }).populate("recipient","fullName profilePic")

        res.status(200).json({incomingReqs,acceptedRequest})
    } catch (error) {
        console.log(`Error in fetching Friend Request${error}`)
        res.status(500).json({message:"Internal Server Error"})
    }
}

export async function getOutgoingFriendRequests(req,res) {
    try {
        const outgoingFriendrequests=await FriendRequest.find({
            sender:req.user.id,
            status:"pending"
        }).populate("recipient","fullName profilePic nativeLanguage learningLanguage")

        res.status(200).json(outgoingFriendrequests)
    } catch (error) {
        console.log(`Error outgoing requests ${error}`)
        res.status(500).json({message:"Internal Server"})
    }
}