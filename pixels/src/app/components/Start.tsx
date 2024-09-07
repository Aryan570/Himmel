import React from 'react'
import Player from './Player'
const Start = () => {
  return (
      <div className="flex justify-evenly w-full items-center translate-y-32">
        <div><Player dir={0} detail={{health : 100, character_type : 1, spells : ["fire","ice"]}}/></div>
        <div><Player dir={1} detail={{health : 100, character_type : 2, spells : ["ice","fire"]}}/></div>
      </div>
  )
}

export default Start
