import { signOut } from 'next-auth/react'
import React from 'react'
const SignOut = () => {
  return (
    <div className=''>
      <button className='bg-red-700 pixel-corners h-8 w-20 flex justify-center items-center hover:scale-125' onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
export default SignOut
