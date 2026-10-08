import React from 'react'
import { useState } from 'react'
const SignupPage = () => {

    const [signupData,setSignupData]=useState({
        fullName:"",
        email:'',
        password:''
    })

    const handleSignup=(e)=>{
        e.preventDefault()
    }
  return (
    <div className='h-screen flex items-center justify-center p-4 sm:p-6 mid:p-8'>SignupPage</div>
  )
}

export default SignupPage