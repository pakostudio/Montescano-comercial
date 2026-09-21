'use client';
import {motion, MotionConfig, useReducedMotion, type HTMLMotionProps} from 'motion/react';
import type {ReactNode} from 'react';
import {FAST, SLOW, EASE, SPRING} from '../lib/motion';

export function MotionProvider({children}:{children:ReactNode}) {
 return <MotionConfig reducedMotion="user" transition={SPRING}>{children}</MotionConfig>;
}
export function Action({children,...props}:HTMLMotionProps<'button'>) {
 const reduced=useReducedMotion();
 return <motion.button whileHover={reduced?{}:{y:-1}} whileTap={reduced?{opacity:.75}:{scale:.975}} transition={SPRING} {...props}>{children}</motion.button>;
}
export function ActionLink({children,...props}:HTMLMotionProps<'a'>) {
 const reduced=useReducedMotion();
 return <motion.a whileHover={reduced?{}:{y:-1}} whileTap={reduced?{opacity:.75}:{scale:.975}} transition={SPRING} {...props}>{children}</motion.a>;
}
export function Reveal({children,className='',delay=0,image=false}:{children:ReactNode;className?:string;delay?:number;image?:boolean}) {
 const reduced=useReducedMotion();
 return <motion.div className={className} initial={{opacity:0,y:reduced?0:image?0:18,scale:reduced?1:image?1.025:1}} whileInView={{opacity:1,y:0,scale:1}} viewport={{once:true,amount:.12}} transition={{duration:reduced?FAST:SLOW,ease:EASE,delay:reduced?0:delay}}>{children}</motion.div>;
}
export function PageEntrance({children}:{children:ReactNode}) {
 const reduced=useReducedMotion();
 return <motion.div initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} transition={{duration:reduced?FAST:.28,ease:EASE}}>{children}</motion.div>;
}
