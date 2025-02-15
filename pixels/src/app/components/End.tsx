import { RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { MouseEvent } from 'react'

const End = (props : {character : string, message : string}) => {
    const router = useRouter();
    function handle_click(e : MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        router.push('/');
    }
    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200 rounded-2xl'>
                <div className='flex flex-col justify-around items-center w-1/3 h-5/6 text-slate-600'>
                    <div className='mb-1'>{props.message}</div>
                    <div className='mb-1'><Image src={`/${props.character}.gif`} alt='Your Character' height={100} width={100}/></div>
                    <div><button className='flex' onClick={handle_click}><RotateCcw/> <div>Replay</div></button></div>
                </div>
            </div>
        </div>
    )
}

export default End