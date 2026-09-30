import User from "../models/User.js"

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