"use client"
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react'
import moves from '@/data/moves.json'
import { MoveKey } from './Matching'
type PvpProps = {
    move_num : MoveKey,
    character_name : string,
    canvas_width? : number,
    canvas_height? : number,
    move_type : Dispatch<SetStateAction<MoveKey>>,
    mirror : boolean
}
const Pvp : React.FC<PvpProps> = ({move_num, character_name, canvas_height = 200, canvas_width = 100, move_type, mirror}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const key_char = character_name as keyof typeof moves;
        const arr = moves[key_char][move_num];
        const n = arr.length;
        // maybe optionally can set the canvas width here
        canvas.width = canvas_width;
        canvas.height = canvas_height;
        const img = new Image();
        img.src = `/${character_name}.png`;
        let animation_frame : number;
        img.onload = () => {
            let i = 0;
            let stagger_frame = 10;
            let j = 0;
            function animate(){
                ctx?.clearRect(0,0,canvas_width,canvas_height);
                ctx?.save();
                if(mirror){
                    ctx?.translate(canvas_width,0);
                    ctx?.scale(-1,1);
                }
                ctx?.drawImage(img,arr[i],arr[i+1],arr[i+2],arr[i+3],0,0,canvas_width,canvas_height);
                j++;
                if(j % stagger_frame == 0) i+=4;
                j %= stagger_frame;
                if(move_num !== "0" && i == n){
                    move_type("0");
                    return;
                }
                i %= n;
                ctx?.restore();
                animation_frame = requestAnimationFrame(animate);
            }
            animate();
        }
        return () => {
            cancelAnimationFrame(animation_frame);
            ctx?.clearRect(0,0,canvas_width,canvas_height);
        }
    }, [character_name, canvas_height, canvas_width, move_num, move_type, mirror])
    return (
        <canvas ref={canvasRef}></canvas>
    )
}

export default Pvp
