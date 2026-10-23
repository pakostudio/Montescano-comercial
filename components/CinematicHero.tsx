'use client';

import {useEffect,useRef,useState} from 'react';
import {AnimatePresence,motion,useInView,useReducedMotion,useSpring} from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import type {Product} from '../lib/catalog-types';
import './CinematicHero.css';

const art = [
  {eyebrow:'MONTESCANO',title:'Precisión con personalidad.',accent:'#d7e6cf',glow:'#245444'},
  {eyebrow:'DISEÑO',title:'Un reloj para hacer presencia.',accent:'#eee0c2',glow:'#335951'},
  {eyebrow:'VIZANTI',title:'Otro estilo. La misma actitud.',accent:'#bed6df',glow:'#2f5260'},
];

export default function CinematicHero({products}:{products:Product[]}) {
  const root=useRef<HTMLElement>(null);
  const dragStart=useRef<number|null>(null);
  const visible=useInView(root,{amount:.12});
  const reduced=useReducedMotion();
  const [scene,setScene]=useState(0);
  const [paused,setPaused]=useState(false);
  const [interacting,setInteracting]=useState(false);
  const x=useSpring(0,{stiffness:65,damping:24});
  const y=useSpring(0,{stiffness:65,damping:24});
  const available=products.length;
  const index=available?scene%available:0;
  const product=products[index];
  const current=art[index]??art[0];
  const canAnimate=visible&&!reduced;
  const change=(direction:number)=>{if(available<2)return;setScene(value=>(value+direction+available)%available);};
  useEffect(()=>{
    if(!canAnimate||paused||interacting||available<2)return;
    const id=window.setInterval(()=>setScene(value=>(value+1)%available),6400);
    return()=>window.clearInterval(id);
  },[canAnimate,paused,interacting,available]);
  const reset=()=>{x.set(0);y.set(0);setInteracting(false);};
  return <section ref={root} id="inicio" className="cinema"
    aria-label="Montescano. Relojería mexicana desde 1998"
    onPointerMove={event=>{
      if(!canAnimate||event.pointerType!=='mouse')return;
      const bounds=event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX-bounds.left)/bounds.width-.5)*23);
      y.set(((event.clientY-bounds.top)/bounds.height-.5)*15);
    }}
    onPointerLeave={reset}
    onFocusCapture={()=>setInteracting(true)}
    onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setInteracting(false);}}
  >
    <motion.div className="cinema-atmosphere" aria-hidden="true" animate={{backgroundColor:current.glow}} transition={{duration:reduced?0:1.1}}/>
    <div className="cinema-grid" aria-hidden="true"/>
    <div className="cinema-beam" aria-hidden="true"/>
    <div className="cinema-year" aria-hidden="true">1998</div>

    <div className="cinema-copy">
      <p className="cinema-eyebrow"><span/> RELOJERÍA MEXICANA · DESDE 1998</p>
      <h1><span className="cinema-line"><span>El tiempo,</span></span><span className="cinema-line"><em>a tu manera.</em></span></h1>
      <div className="cinema-scene-copy" aria-live="off">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={index} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduced?0:.33}}>
            <strong style={{color:current.accent}}>{current.eyebrow}</strong>
            <p>{current.title}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>

    <div id="hero-active-watch" className="cinema-stage" role="group" aria-label="Reloj destacado Montescano"
      onPointerDown={event=>{dragStart.current=event.clientX;}}
      onPointerUp={event=>{if(dragStart.current!==null&&Math.abs(event.clientX-dragStart.current)>55){change(event.clientX<dragStart.current?1:-1);setPaused(false);}dragStart.current=null;}}
      onPointerCancel={()=>{dragStart.current=null;}}>
      <div className="cinema-orbit cinema-orbit-one" aria-hidden="true"/>
      <div className="cinema-orbit cinema-orbit-two" aria-hidden="true"/>
      <div className="cinema-halo" aria-hidden="true"/>
      <motion.div className="cinema-product-depth" style={{x:canAnimate?x:0,y:canAnimate?y:0}}>
        <AnimatePresence mode="wait" initial={false}>
          {product&&<motion.div key={product.id} className="cinema-product-reveal"
            initial={{opacity:0,scale:.95,y:16}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:1.02,y:-9}}
            transition={{duration:reduced?0:.5}}>
            <div className="cinema-product-float">
              {product.sku==='TASAC3521'
                ?<Image className="cinema-watch" src="/hero/tasac3521-cutout.png" alt={`Reloj real Montescano ${product.sku}`} width={1104} height={1425} sizes="(max-width:700px) 85vw,45vw" priority draggable={false}/>
                :<img className="cinema-watch cinema-watch-photo" src={`/hero-assets/${product.sku.toLowerCase()}`} alt={`Reloj original ${product.brand} ${product.sku} sin fondo fotográfico`} width="480" height="580" loading="eager" draggable={false}/>}
            </div>
          </motion.div>}
        </AnimatePresence>
      </motion.div>
      {product&&<div className="cinema-model"><span>{product.brand.toUpperCase()}</span><strong>{product.sku}</strong>
        <Link href={`/productos/${product.slug}`}>VER ESTE MODELO <span aria-hidden="true">↗</span></Link>
      </div>}
      {available>1&&<button
        className="cinema-motion-toggle"
        type="button"
        aria-label={paused?'Reanudar movimiento de los relojes':'Pausar movimiento de los relojes'}
        title={paused?'Reanudar animación':'Pausar animación'}
        aria-pressed={paused}
        onClick={()=>{setPaused(value=>!value);setInteracting(false);}}
      ><span aria-hidden="true">{paused?'▶':'Ⅱ'}</span></button>}
      <div className="cinema-swipe" aria-hidden="true">DESLIZA PARA DESCUBRIR</div>
    </div>
  </section>;
}
