import React from 'react'

const Test = () => {
  return (
    <div className='flex justify-center items-center h-screen w-screen bg-slate-500'>
        <div className=''>
            <progress className='h-3 rounded-2xl overflow-hidden appearance-none' max={100} value={50}></progress>
        </div>
    </div>
  )
}

export default Test
