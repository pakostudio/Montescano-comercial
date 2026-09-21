'use client';
import {motion,useSpring,useReducedMotion} from 'motion/react';
import type {ReactNode} from 'react';
export default function HeroDepth({children}:{children:ReactNode}){
 const reduced=useReducedMotion();
 const x=useSpring(0,{stiffness:100,damping:24});
 const y=useSpring(0,{stiffness:100,damping:24});
 return <motion.div className="hero-depth" style={{x:reduced?0:x,y:reduced?0:y}} onPointerMove={e=>{if(reduced||e.pointerType!=='mouse'||e.buttons)return;const r=e.currentTarget.getBoundingClientRect();x.set(((e.clientX-r.left)/r.width-.5)*6);y.set(((e.clientY-r.top)/r.height-.5)*6);}} onPointerLeave={()=>{x.set(0);y.set(0);}}>{children}</motion.div>;
}
