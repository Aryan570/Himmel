// => the movement of the character => sprites, would be hard
"use client"
import { Loader2, Pause, Play, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState, MouseEvent, SetStateAction, Dispatch } from 'react'
import Pvp from './Pvp'
import { usePathname, useRouter } from 'next/navigation'
import { Howl } from 'howler'
export type Move = {
    charac_p1: string | undefined,
    charac_p2: string | undefined,
    h1: number,
    h2: number,
    buffs_player_1: number,
    buffs_player_2: number,
    debuffs_player_1: number,
    debuffs_player_2: number,
    attacker: boolean,
    move_type: number,
    locked: number,
    disable_all: boolean,
}
export type MoveKey = "0" | "1" | "2" | "3" | "4" | "5";
const Matching = (props: { char: string, banner: Dispatch<SetStateAction<boolean>> }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [sock, setsock] = useState<WebSocket | undefined>(undefined);
    const [over, setover] = useState<string>("");
    const [move_p1, setmove_p1] = useState<MoveKey>("0");
    const [move_p2, setmove_p2] = useState<MoveKey>("0");
    const [players, setplayers] = useState<Move>(
        {
            charac_p1: undefined,
            charac_p2: undefined,
            h1: 100,
            h2: 100,
            buffs_player_1: 0,
            buffs_player_2: 0,
            debuffs_player_1: 0,
            debuffs_player_2: 0,
            attacker: true,
            move_type: -1,
            locked: 0,
            disable_all: false
        }
    );
    const [found, setfound] = useState(false);
    const [howl, setHowl] = useState<Howl | undefined>(undefined);
    const [music, setMusic] = useState<boolean>(true);
    const [disconnect, setDisconnect] = useState<boolean>(false);
    function to_rust(e: MouseEvent<HTMLButtonElement>) {
        let val = e.currentTarget.value;
        if (!(val === "0" || val === "1" || val === "2" || val === "3" || val === "4" || val === "5")) console.log("Wrong val");
        if (e.currentTarget.dataset.tag !== "1" && e.currentTarget.dataset.tag !== "2") console.log("tag is wrong");
        let tmp = players;
        tmp.move_type = parseInt(val, 10);
        // set attacker as well
        let to_send = JSON.stringify(tmp);
        sock?.send(to_send);
    }
    function handle_disconnect(e: MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        props.banner(false);
        sock?.close(1000, "Client wants to disconnect");
        router.replace(pathname);
    }
    function handle_click(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        sock?.close(1000, "Client wants to disconnect");
        props.banner(false);
    }
    function handle_music() {
        if (howl?.playing()) howl.pause();
        else howl?.play();
        setMusic(!music);
    }
    useEffect(() => {
        const sound = new Howl({
            src: ['/Poolside_h.mp3'],
            volume: 0.5,
            html5: true,
            loop: true,
            onplayerror: function () {
                sound.once('unlock', function () {
                    sound.play();
                });
            }
        });
        sound.play();
        setHowl(sound);
        return () => {
            sound.unload();
        }
    }, [])

    useEffect(() => {
        const socket = new WebSocket("ws://127.0.0.1:8000");
        socket.onopen = () => {
            console.log("Found an opponent");
            console.log(props.char);
            socket.send(props.char);
            setsock(socket);
        }
        socket.onmessage = (e: MessageEvent) => {
            const data: Move = JSON.parse(e.data);
            if (data.h1 === 0) setover(data.charac_p2!);
            else if (data.h2 === 0) setover(data.charac_p1!);
            if(data.move_type === 100){
                setDisconnect(true);
                return;
            }
            console.log("Here is the data ? : ", data);
            if (data.attacker && data.move_type != 10 && data.move_type != 20) setmove_p2(data.move_type.toString() as MoveKey);
            if (!data.attacker && data.move_type != 10 && data.move_type != 20) setmove_p1(data.move_type.toString() as MoveKey);
            setfound(true);
            setplayers(data);
        }

        return () => {
            socket.close(1000, "Client wants to disconnect");
            socket.onclose = () => {
                console.log("bye bye rust");
                // router.push("/");
            }
            setsock(undefined);
        }
    }, [props.char, router])
    if(disconnect){
        return (
            <div className='flex justify-center items-center h-screen w-screen'>
                <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200 rounded-2xl'>
                    <div className='flex flex-col justify-around items-center w-1/3 h-5/6 text-slate-600'>
                        <div className='mb-1 text-nowrap'>Opponent has disconnected</div>
                        <div><button className='flex' onClick={handle_disconnect}><RotateCcw /> <div>Replay</div></button></div>
                    </div>
                </div>
            </div>
        )
    }
    if (over.length !== 0) {
        return (
            <div className='flex justify-center items-center h-screen w-screen'>
                <div className='flex justify-center items-center h-1/3 w-1/3 bg-gray-200 rounded-2xl'>
                    <div className='flex flex-col justify-around items-center w-1/3 h-5/6 text-slate-600'>
                        <div className='mb-1'>{players.move_type === 10 ? "Victory is yours!" : "Next time, for sure!"}</div>
                        <div className='mb-1'><Image src={`/${over}.gif`} alt='Your Character' height={100} width={100} /></div>
                        <div><button className='flex' onClick={handle_click}><RotateCcw /> <div>Replay</div></button></div>
                    </div>
                </div>
            </div>
        )
    }
    if (found) {
        return (
            <div className='flex justify-center items-center h-screen'>
                <div className='flex relative overflow-hidden justify-center items-center h-2/3 w-2/3 rounded-2xl'>
                    <Image className='absolute' src={'/bg_3.gif'} alt='background-image' fill />
                    <div className='flex flex-col h-full w-1/2'>
                        <div className='h-1/6 w-3/4 ml-3 z-10'>
                            <p className='text-orange-600'>{players.charac_p1}</p>
                            <progress className='pixel-corners overflow-hidden rounded-2xl h-3' max={100} value={players.h1}></progress>
                        </div>
                        <div className='flex h-5/6 ml-3'>
                            <div className='flex flex-col basis-1/6'>
                                <button value={1} data-tag="1" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 0)) || !players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-r-2xl`} disabled={((players.locked & (1 << 0)) || !players.attacker) || players.disable_all ? true : false}>Mend</button>
                                <button value={2} data-tag="1" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 1)) || !players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-r-2xl`} disabled={((players.locked & (1 << 1)) || !players.attacker) || players.disable_all ? true : false}>Hex</button>
                                <button value={3} data-tag="1" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 2)) || !players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-r-2xl`} disabled={((players.locked & (1 << 2)) || !players.attacker) || players.disable_all ? true : false}>Wall</button>
                                <button value={4} data-tag="1" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 3)) || !players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-r-2xl`} disabled={((players.locked & (1 << 3)) || !players.attacker) || players.disable_all ? true : false}>TODO</button>
                                <button value={5} data-tag="1" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 4)) || !players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-r-2xl`} disabled={((players.locked & (1 << 4)) || !players.attacker) || players.disable_all ? true : false}>TODO</button>
                            </div>
                            <div className='flex justify-center items-center basis-5/6'>
                                <Pvp character_name={players.charac_p1!} move_num={move_p1} move_type={setmove_p1} mirror={false} />
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-col h-full w-1/2'>
                        <div className='h-1/6 text-right mr-3 z-10'>
                            <p className='text-orange-600'>{players.charac_p2}</p>
                            <progress className='pixel-corners overflow-hidden h-3 rounded-2xl' max={100} value={players.h2}></progress>
                        </div>
                        <div className='flex h-5/6 mr-3'>
                            <div className='flex justify-center items-center basis-5/6'>
                                <Pvp character_name={players.charac_p2!} move_num={move_p2} move_type={setmove_p2} mirror={true} />
                            </div>
                            <div className='flex flex-col basis-1/6'>
                                <button value={1} data-tag="2" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 0)) || players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-l-2xl`} disabled={((players.locked & (1 << 0)) || players.attacker) || players.disable_all ? true : false}>Mend</button>
                                <button value={2} data-tag="2" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 1)) || players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-l-2xl`} disabled={((players.locked & (1 << 1)) || players.attacker) || players.disable_all ? true : false}>Hex</button>
                                <button value={3} data-tag="2" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 2)) || players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-l-2xl`} disabled={((players.locked & (1 << 2)) || players.attacker) || players.disable_all ? true : false}>Wall</button>
                                <button value={4} data-tag="2" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 3)) || players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-l-2xl`} disabled={((players.locked & (1 << 3)) || players.attacker) || players.disable_all ? true : false}>TODO</button>
                                <button value={5} data-tag="2" onClick={to_rust} className={`text-slate-50 active:scale-90 ring-4 ring-offset-2 my-1 pixel-corners ${((players.locked & (1 << 4)) || players.attacker) || players.disable_all ? 'bg-slate-500 ring-slate-600' : 'bg-orange-400 hover:bg-orange-600 ring-orange-700'} rounded-l-2xl`} disabled={((players.locked & (1 << 4)) || players.attacker) || players.disable_all ? true : false}>TODO</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='absolute left-[90%] top-[90%]'>{howl && howl?.playing() ? <button onClick={handle_music}><Pause/></button> : <button onClick={handle_music}><Play/></button>}</div>
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
