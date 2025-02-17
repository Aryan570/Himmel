"use client"
import Image from 'next/image'
import React, { BaseSyntheticEvent, useEffect, useState } from 'react'
import { ch_array, character_array, get_random } from '../characters'
// import SignOut from './SignOut'
import Matching from './Matching'
const Banner = () => {
  const [character, setcharacter] = useState<ch_array>(get_random());
  const [is_loading, setis_loading] = useState(false);
  const [choose, setchoose] = useState(false);
  const [chosen, setchosen] = useState("");
  useEffect(() => {
    const switch_int = setInterval(() => {
      setcharacter(get_random());
    }, 7000);
    return () => {
      clearInterval(switch_int);
    }
  }, [])
  function handle_click(e: BaseSyntheticEvent) {
    // change state to the loading state
    setchoose(true);
  }
  function handle_choose(e : BaseSyntheticEvent){
    setchosen(e.currentTarget.value);
    setis_loading(true);
    setchoose(false);
  }
  if (is_loading) return <Matching char={chosen} banner={setis_loading} />;
  if(choose){
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='grid grid-cols-4 gap-4 w-1/3'>
                    {character_array.map((e: ch_array) => (
                        <button onClick={handle_choose} className='flex items-center justify-center bg-orange-500 rounded-2xl shadow-inner shadow-red-600' value={e.character_name} key={e.character_name}><Image src={`/${e.character_name}.gif`} alt='char_image' height={100} width={100} /></button>
                    ))}
                </div>
            </div>
        )
  }
  // on click function for the button
  // which would call the rust to find a match -- need to write backend code for this
  // and maybe convert these gifs into some supported format images
  return (
    <div className='flex justify-around items-center h-screen'>
      <div className='w-1/3 h-1/3 bg-orange-500 rounded-lg border-2 flex justify-center items-center'>
        <div className='grid grid-rows-3 grid-cols-5 m-1 border-2 rounded-lg items-center h-[97%]'>
          <div className='flex justify-center items-center col-span-2 row-span-3 border-r-2 h-full'>
            <Image src={`/${character.character_name}.gif`} height={100} width={100} alt='character' />
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-span-1 border-b-2 h-full'>
            {character.character_name}
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-start-2 row-span-2 h-full px-2 overflow-hidden'>
            {character.description}
          </div>
        </div>
      </div>
      <button onClick={handle_click} className='bg-orange-500 pixel-corners h-8 w-12 flex justify-center items-center hover:scale-125'>
        Play
      </button>
      {/* <SignOut/> */}
    </div>
  )
}
export default Banner