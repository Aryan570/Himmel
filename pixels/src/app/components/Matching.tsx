import { Loader2 } from 'lucide-react'
import React from 'react'
const Matching = () => {
    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200 rounded-2xl'>
                <div className='flex flex-col justify-center items-center'>
                    <Loader2 className='animate-spin text-slate-600'/>
                    <p className='text-slate-600'>Finding the Opponent</p>
                </div>
            </div>
        </div>
    )
}

export default Matching
