"use client"
import React, { useEffect } from 'react'
import Player from './Player'
const Start = () => {
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000");
    socket.onopen = () => {
      socket.send("Hey Rust. Hello from NextJS");
      console.log("connected to Rust Server");
    }
    return () => {
      socket.close(1000,"Client wanted to close the socket");
    }
  }, [])
  return (
      <div className="flex justify-evenly w-full items-center translate-y-32">
        <div><Player dir={0} detail={{health : 100, character_type : 1, spells : ["fire","ice"]}}/></div>
        <div><Player dir={1} detail={{health : 100, character_type : 2, spells : ["ice","fire"]}}/></div>
      </div>
  )
}

export default Start
