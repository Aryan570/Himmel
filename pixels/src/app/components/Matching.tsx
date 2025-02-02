// => the movement of the character => sprites, would be hard
"use client"
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import React, { BaseSyntheticEvent, useEffect, useState } from 'react'
// after the move => How will I access the websocket connection?
export type Move = {
    charac_p1: string | undefined,
    charac_p2: string | undefined,
    h1: number,
    h2: number,
    buffs_player_1: number, // I will not need buffs and debuffs here =>
    buffs_player_2: number, // but just for being consistent with server
    debuffs_player_1: number,
    debuffs_player_2: number,
    attacker: boolean,
    move_type: number,
    locked: number
}
const Matching = (props : {char : string}) => {
    const [sock, setsock] = useState<WebSocket | undefined>(undefined);
    const [players, setplayers] = useState<Move>(
        {
            charac_p1: undefined,
            charac_p2: undefined,
            h1: 100,
            h2: 100,
            buffs_player_1: 0, // I will not need buffs and debuffs here =>
            buffs_player_2: 0, // but just for being consistent with server
            debuffs_player_1: 0,
            debuffs_player_2: 0,
            attacker: true,
            move_type: -1,
            locked: 0
        }
    );
    const [found, setfound] = useState(false);
    function to_rust(e: BaseSyntheticEvent) {
        let val = e.target.value;
        let tmp = players;
        tmp.move_type = val;
        // set attacker as well
        let to_send = JSON.stringify(tmp);
        sock?.send(to_send);
    }
    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000");
        socket.onopen = () => {
            // most probably, I won't do anything other than setting finding state to false
            console.log("Found an opponent");
            socket.send(props.char);
            setsock(socket);
        }
        socket.onmessage = (e: MessageEvent) => {
            const data: Move = JSON.parse(e.data);
            setfound(true);
            setplayers(data);
            console.log(data);
        }

        return () => {
            socket.close(1000, "Client wants to disconnect");
            setsock(undefined);
        }
    }, [props.char])
    if (found) {
        // _______________
        // |      |      |
        // |  P1  |  P2  |
        // |      |      |
        // |------|------|
        return (
            <div className='flex'>
                <div className='flex flex-col h-full w-1/2'>
                    <div className='h-1/6 w-3/4'>
                        <p>{players.charac_p1}</p>
                        <progress value={players.h1}></progress>
                    </div>
                    <div className='flex h-5/6'>
                        <div className='basis-1/6'>
                            <button value={0} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 0)) && !players.attacker ? true : false}>FA</button>
                            <button value={1} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 1)) && !players.attacker ? true : false}>AB</button>
                            <button value={2} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 2)) && !players.attacker ? true : false}>AD</button>
                            <button value={3} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 3)) && !players.attacker ? true : false}>AR</button>
                            <button value={4} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 4)) && !players.attacker ? true : false}>NN</button>
                        </div>
                        <div className='flex justify-center items-center basis-5/6'>
                            <Image src={`${players.charac_p1}.gif`} className='brightness-75' alt='character_1' height={200} width={200} />
                        </div>
                    </div>
                </div>
                <div className='flex flex-col h-full w-1/2'>
                    <div className='h-1/6 w-3/4'>
                        <p>{players.charac_p2}</p>
                        <progress value={players.h2}></progress>
                    </div>
                    <div className='flex h-5/6'>
                        <div className='flex justify-center items-center basis-5/6'>
                            <Image className='transform -scale-x-100 brightness-75' src={`${players.charac_p2}.gif`} alt='character_1' height={200} width={200} />
                        </div>
                        <div className='basis-1/6'>
                            <button value={0} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 0)) && players.attacker ? true : false}>FA</button>
                            <button value={1} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 1)) && players.attacker ? true : false}>AB</button>
                            <button value={2} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 2)) && players.attacker ? true : false}>AD</button>
                            <button value={3} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 3)) && players.attacker ? true : false}>AR</button>
                            <button value={4} onClick={to_rust} className='text-slate-50 bg-slate-500' disabled={(1 & (players.locked << 4)) && players.attacker ? true : false}>NN</button>
                        </div>
                    </div>
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
