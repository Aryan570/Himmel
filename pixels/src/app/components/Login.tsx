"use client"
import React from 'react'
import { signIn } from 'next-auth/react'
import Image from 'next/image'
const Login = () => {
  return (
    <div className='grid grid-cols-2 h-screen'>
        <div className='flex justify-center items-center'><button className='bg-orange-500 pixel-corners h-8 w-12 hover:scale-125' onClick={()=> signIn()}>LogIn</button></div>
        <div className=''><Image className='min-h-screen min-w-full overflow-hidden' src={"/wow.jpg"} width={400} height={400} alt='a_banner_prolly'/></div>
    </div>
  )
}

export default Login
