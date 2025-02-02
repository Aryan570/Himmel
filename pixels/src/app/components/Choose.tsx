import React from 'react'
import { ch_array, character_array } from '../characters'
import Image from 'next/image'

const Choose = () => {
    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='grid grid-cols-4 gap-4 h-1/3 w-1/3'>
                {character_array.map((e: ch_array) => (
                    <button className='p-4' value={e.character_name} key={e.character_name}><Image src={`${e.character_name}.gif`} alt='char_image' height={100} width={100} /></button>
                ))}
            </div>
        </div>
    )
}

export default Choose
