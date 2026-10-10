import React from 'react'
import { useState } from 'react'
import {useParams} from 'react-router'

import {useAuthUser} from "../hooks/useAuthUser"
import { useQuery } from '@tanstack/react-query'
import { getStreamToken } from '../lib/api'
import { useEffect } from 'react'
import PageLoader from "../components/PageLoader"
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
  name,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const StreamApiKey=import.meta.env.VITE_STEAM_API_KEY

const CallPage = () => {

    const {id:callId}=useParams()

    const [client, setclient] = useState(null)

    const [call, setcall] = useState(null)
    const [isconnecting, setIsconnecting] = useState(true)

    const {authUser,isLoading}=useAuthUser()

    const {data:tokenData}=useQuery({
      queryKey:['streamToken'],
      queryFn:getStreamToken,
      enabled:!!authUser
    })

    useEffect(()=>{
      const initCall=async()=>{
        if(!tokenData.token||!authUser||!callId) return

        try {
          console.log('initializing stream cliennt')

          const user={
            id:authUser._id,
            name:authUser.fullName,
            image:authUser.profilePic
          }

          const videoClient=new StreamVideoClient({
            apiKey:StreamApiKey,
            user,
            token:tokenData.token
          })

          const callInstance=videoClient.call("default",callId)

          await callInstance.join({create:true})

          console.log('joined call ')

          setclient(videoClient)
          setcall(callInstance)
        } catch (error) {
          console.log(error)
        
        }finally{
          setIsconnecting(false)
        }
      }
      initCall()
    },[tokenData,authUser,callId])

    if(isLoading||isconnecting) return <PageLoader/>



  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
}


const CallContent=()=>{
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const navigate = useNavigate();

  if (callingState === CallingState.LEFT) return navigate("/");

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
}
export default CallPage