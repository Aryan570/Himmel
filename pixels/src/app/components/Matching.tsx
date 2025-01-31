"use client"
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
// after the move => How will I access the websocket connection?
export type Move = {
    charac_p1 : string,
    charac_p2 : string,
    h1 : number,
    h2 : number,
    buffs_player_1 : number, // I will not need buffs and debuffs here =>
    buffs_player_2 : number, // but just for being consistent with server
    debuffs_player_1 : number,
    debuffs_player_2 : number,
    attacker : number,
    move_type : number,
    locked : number
}
const Matching = () => {
    const [players, setplayers] = useState<Move>(
        {
            charac_p1 : "Sonic",
            charac_p2 : "Some_girl",
            h1 : 100,
            h2 : 100,
            buffs_player_1 : 0, // I will not need buffs and debuffs here =>
            buffs_player_2 : 0, // but just for being consistent with server
            debuffs_player_1 : 0,
            debuffs_player_2 : 0,
            attacker : -1,
            move_type : -1,
            locked : 0
        }
    );
    const [found, setfound] = useState(false);
    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000");
        socket.onopen = () => {
            // most probably, I won't do anything other than setting finding state to false
            console.log("Found an opponent");
            setfound(true);
        }
        socket.onmessage = (e: MessageEvent) => {
            const data : Move = JSON.parse(e.data);
            setplayers(data);
        }

        return () => {

        }
    }, [])
    if (found) {
        // _______________
        // |      |      |
        // |  P1  |  P2  |
        // |      |      |
        // ---------------
        return (
            <div className='flex'>
                <div className='flex flex-col h-full w-1/2'>
                    <div className='h-1/6 w-3/4'>
                        <p>{players.charac_p1}</p>
                        <progress value={players.h1}></progress>
                    </div>
                    <div>

                    </div>
                </div>
                <div>

                </div>
            </div>
        )
    }
    return (
        <div className='flex justify-center items-center h-screen'>
            <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200 rounded-2xl'>
                <div className='flex flex-col justify-center items-center'>
                    <Loader2 className='animate-spin text-slate-600' />
                    <p className='text-slate-600'>Finding the Opponent</p>
                </div>
            </div>
        </div>
    )
}

export default Matching
