// => the movement of the character => sprites, would be hard
"use client"
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import React, { BaseSyntheticEvent, useEffect, useState } from 'react'
import End from './End'
// after the move => How will I access the websocket connection?
// there should also be another flag where I disable all the buttons => also if user try to check through dev tools, return from handle_click
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
    locked: number,
    disable_all: boolean,
}
const Matching = (props: { char: string }) => {
    const [sock, setsock] = useState<WebSocket | undefined>(undefined);
    const [over, setover] = useState<string>("");
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
            locked: 0,
            disable_all: false
        }
    );
    const [found, setfound] = useState(false);
    function to_rust(e: BaseSyntheticEvent) {
        let val = e.currentTarget.value;
        let tmp = players;
        tmp.move_type = parseInt(val, 10);
        // set attacker as well
        let to_send = JSON.stringify(tmp);
        sock?.send(to_send);
    }
    // didnot think that through
    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000");
        socket.onopen = () => {
            // most probably, I won't do anything other than setting finding state to false
            console.log("Found an opponent");
            console.log(props.char);
            socket.send(props.char); // what would this do actually? => I will store (player => character)
            setsock(socket);
        }
        socket.onmessage = (e: MessageEvent) => {
            const data: Move = JSON.parse(e.data);
            if(data.h1 === 0) setover(data.charac_p1!);
            else if(data.h2 === 0) setover(data.charac_p2!);
            console.log("Here is the data ? : ", data);
            setfound(true);
            setplayers(data);
            // console.log(data);
        }

        return () => {
            socket.close(1000, "Client wants to disconnect");
            setsock(undefined);
        }
    }, [props.char])
    if (over.length !== 0) return (<End character={over} />)
    if (found) {
        // _______________
        // |      |      |
        // |  P1  |  P2  |
        // |      |      |
        // |------|------|
        return (
            <div className='flex justify-center items-center h-screen'>
                {/*bg-[url(/background_final_2.gif)] bg-no-repeat bg-cover*/}
                <div className='flex justify-center items-center h-2/3 w-2/3 bg-gray-200 rounded-2xl '>
                    <div className='flex flex-col h-full w-1/2'>
                        <div className='h-1/6 w-3/4 ml-3'>
                            <p className='text-orange-600'>{players.charac_p1}</p>
                            <progress className='overflow-hidden rounded-2xl h-3' max={100} value={players.h1}></progress>
                        </div>
                        <div className='flex h-5/6'>
                            <div className='flex flex-col basis-1/6'>
                                <button value={0} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 0)) || !players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-r-2xl`} disabled={((players.locked & (1 << 0)) || !players.attacker) || players.disable_all ? true : false}>Mend</button>
                                <button value={1} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 1)) || !players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-r-2xl`} disabled={((players.locked & (1 << 1)) || !players.attacker) || players.disable_all ? true : false}>Hex</button>
                                <button value={2} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 2)) || !players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-r-2xl`} disabled={((players.locked & (1 << 2)) || !players.attacker) || players.disable_all ? true : false}>Wall</button>
                                <button value={3} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 3)) || !players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-r-2xl`} disabled={((players.locked & (1 << 3)) || !players.attacker) || players.disable_all ? true : false}>TODO</button>
                                <button value={4} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 4)) || !players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-r-2xl`} disabled={((players.locked & (1 << 4)) || !players.attacker) || players.disable_all ? true : false}>TODO</button>
                            </div>
                            <div className='flex justify-center items-center basis-5/6'>
                                <Image src={`/${players.charac_p1}.gif`} className='brightness-75' alt='character_1' height={100} width={100} />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col h-full w-1/2'>
                        <div className='h-1/6 text-right mr-3'>
                            <p className='text-orange-600'>{players.charac_p2}</p>
                            <progress className='overflow-hidden h-3 rounded-2xl' max={100} value={players.h2}></progress>
                        </div>
                        <div className='flex h-5/6'>
                            <div className='flex justify-center items-center basis-5/6'>
                                <Image className='transform -scale-x-100 brightness-75' src={`/${players.charac_p2}.gif`} alt='character_1' height={100} width={100} />
                            </div>
                            <div className='flex flex-col basis-1/6'>
                                <button value={0} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 0)) || players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-l-2xl`} disabled={((players.locked & (1 << 0)) || players.attacker) || players.disable_all ? true : false}>Mend</button>
                                <button value={1} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 1)) || players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-l-2xl`} disabled={((players.locked & (1 << 1)) || players.attacker) || players.disable_all ? true : false}>Hex</button>
                                <button value={2} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 2)) || players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-l-2xl`} disabled={((players.locked & (1 << 2)) || players.attacker) || players.disable_all ? true : false}>Wall</button>
                                <button value={3} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 3)) || players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-l-2xl`} disabled={((players.locked & (1 << 3)) || players.attacker) || players.disable_all ? true : false}>TODO</button>
                                <button value={4} onClick={to_rust} className={`text-slate-50 my-1 ${((players.locked & (1 << 4)) || players.attacker) || players.disable_all ? 'bg-slate-500' : 'bg-orange-400'} rounded-l-2xl`} disabled={((players.locked & (1 << 4)) || players.attacker) || players.disable_all ? true : false}>TODO</button>
                            </div>
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
