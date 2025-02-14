import { RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import React from 'react'

const End = (props : {character : string}) => {
    function handle_click(){
        redirect('/');
    }
    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200'>
                <div className='flex justify-center items-center w-1/3 h-5/6 text-slate-600'>
                    <div>Victory is yours!</div>
                    <div><Image src={`/${props.character}.gif`} alt='Your Character' height={100} width={100}/></div>
                    <div><button className='flex' onClick={handle_click}><RotateCcw/> <div>Replay</div></button></div>
                </div>
            </div>
        </div>
    )
}

export default End