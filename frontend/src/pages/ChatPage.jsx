import React, { useEffect } from 'react'
import { useState } from 'react';
import { useParams } from 'react-router';
import useAuthUser from '../hooks/useAuthUser';
import { useQuery } from '@tanstack/react-query';
import { getStreamToken } from '../lib/api';
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from 'stream-chat';
import toast from 'react-hot-toast';
import ChatLoader from '../components/ChatLoader';
import CallButton from '../components/CallButton';
const StreamApiKey = import.meta.env.VITE_STREAM_API_KEY || import.meta.env.VITE_STEAM_API_KEY; 
const ChatPage = () => {
    const {id:targetUserId}=useParams();

    const [chatClient, setchatClient] = useState(null)
    const [channel, setchannel] = useState(null)
    const [loading, setLoading] = useState(true)

    const {authUser}=useAuthUser()
    const {data:tokenData}=useQuery({
        queryKey:['streamToken'],
        queryFn:getStreamToken,
        enabled:!!authUser
    })

    useEffect(()=>{ 
        const initChat=async () => {
             if(!tokenData?.token || !authUser) return
             try {
                console.log('inittialize stream client')
                const client =StreamChat.getInstance(StreamApiKey)
                await client.connectUser({
                  id:authUser._id,
                  name:authUser.fullName,
                  image:authUser.profilePic
                },tokenData.token)


                const channelId = [authUser._id, targetUserId].sort().join("_");

                const currChannel=client.channel("messaging",channelId,{
                  members:[authUser._id,targetUserId]
                })

                await currChannel.watch()
                setchatClient(client)
                setchannel(currChannel)
             } catch (error) {
                console.log(`Error ${error}`)
                toast.error('Some Error CHatting')
             }finally{
              setLoading(false)
             }
        }
        initChat()
    },[tokenData,authUser,targetUserId])

    const handleVideoCall=async ()=>{

      if (channel) {
  const callUrl = `${window.location.origin}/call/${channel.id}`;

  channel.sendMessage({
    text: `I've started a video call. Join me here: ${callUrl}`,
  });

  toast.success("Video call link sent successfully!");
}
    }


    if(loading||!chatClient||!channel) return <ChatLoader/>
  return (
    <div className='h-[93vh]'>

      <Chat client={chatClient}>
        <Channel channel={channel}>

          <div className='w-full relative'>
            <CallButton handleVideoCall={handleVideoCall}/>
            <Window>
              <ChannelHeader/>
              <MessageList/>
              <MessageComposer />
            </Window>
          </div>
        </Channel>
      </Chat>
    </div>
  )
}

export default ChatPage