"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { ch_array, get_random } from '../characters'
const Main = () => {
  const [character, setcharacter] = useState<ch_array>(get_random());
  useEffect(() => {
    const switch_int = setInterval(() => {
      setcharacter(get_random());
    }, 7000);
    return () => {
      clearInterval(switch_int);
    }
  }, [])
  // on click function for the button
  // which would call the rust to find a match -- need to write backend code for this
  // and maybe convert these gifs into some supported format images
  return (
    <div className='flex justify-around items-center h-screen'>
      <div className='w-1/3 h-1/3 bg-orange-500 rounded-lg border-2 flex justify-center items-center'>
        <div className='grid grid-rows-3 grid-cols-5 m-1 border-2 rounded-lg items-center h-[97%]'>
          <div className='flex justify-center items-center col-span-2 row-span-3 border-r-2 h-full'>
            <Image src={`/${character.character}.gif`} height={100} width={100} alt='character'/>
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-span-1 border-b-2 h-full'>
            {character.character_name}
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-start-2 row-span-2 h-full px-2 overflow-hidden'>
            {character.description}
          </div>
        </div>
      </div>
      <button className='bg-orange-500 pixel-corners h-8 w-12 flex justify-center items-center hover:scale-125'>
        Play
      </button>
    </div>
  )
}

export default Main
