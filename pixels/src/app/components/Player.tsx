import React from 'react'
import Image from 'next/image'
type player_detail =  {
    health : number,
    spells : string[],  // may use number later , like , 0100000101..
    character_type : number,
}
const Player = (props : {dir : number , detail : player_detail}) => {
  return (
    <div className='scale-50'>
        <Image src={"/character1.gif"} className={props.dir === 1 ? "transform -scale-x-100 brightness-75" : "brightness-75"} height={200} width={200} alt='character_display'/>
    </div>
  )
}

export default Player
