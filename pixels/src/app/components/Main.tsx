import Image from 'next/image'
import React from 'react'
const Main = () => {
  return (
    <div className='flex justify-around items-center h-screen'>
      <div className='w-1/3 h-1/3 bg-orange-500 rounded-lg border-2 flex justify-center items-center'>
        <div className='grid grid-rows-3 grid-cols-5 m-1 border-2 rounded-lg items-center h-[97%]'>
          <div className='flex justify-center items-center col-span-2 row-span-3 border-r-2 h-full'>
            <Image src={"/3.gif"} height={100} width={100} alt='character'/>
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-span-1 border-b-2 h-full'>
            Kazuha
          </div>
          <div className='flex justify-center items-center col-start-3 col-span-3 row-start-2 row-span-2 h-full px-2'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque quisquam vero illum quidem iusto, voluptas excepturi nam iure odit rem repudiandae?
          </div>
        </div>
      </div>
      <div>
        Play
      </div>
    </div>
  )
}

export default Main
