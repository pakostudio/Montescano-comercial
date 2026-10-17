'use client';

import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion, useInView, useReducedMotion, useSpring} from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import type {Product} from '../lib/catalog-types';
import './CinematicHero.css';

const scenes = [
  {
    eyebrow: 'PRECISIÓN',
    title: 'Diseño que acompaña cada momento.',
    accent: '#b8c8ab',
    glow: '#244d41',
    line: '#dbe6d2',
    rotate: -14,
    scale: 1,
  },
  {
    eyebrow: 'CARÁCTER',
    title: 'Una pieza con presencia propia.',
    accent: '#d9d1b7',
    glow: '#304f57',
    line: '#e7e2ce',
    rotate: -7,
    scale: 1.035,
  },
  {
    eyebrow: 'IDENTIDAD',
    title: 'El tiempo, a tu manera.',
    accent: '#9fb49a',
    glow: '#1f3d33',
    line: '#d9e8d4',
    rotate: -19,
    scale: .985,
  },
];

export default function CinematicHero({product}: {product?: Product}) {
  const root = useRef<HTMLElement>(null);
  const start = useRef<number | null>(null);
  const visible = useInView(root, {amount: 0.15});
  const reduced = useReducedMotion();
  const [scene, setScene] = useState(0);
  const x = useSpring(0, {stiffness: 65, damping: 24});
  const y = useSpring(0, {stiffness: 65, damping: 24});
  const moving = visible && !reduced;
  const current = scenes[scene];

  useEffect(() => {
    if (!visible || reduced) return;
    const timer = window.setInterval(() => setScene(value => (value + 1) % scenes.length), 5200);
    return () => window.clearInterval(timer);
  }, [visible, reduced]);

  const reset = () => { x.set(0); y.set(0); };
  const change = (direction: number) => setScene(currentScene => (currentScene + direction + scenes.length) % scenes.length);

  return <section ref={root} id="inicio" className="cinema"
    aria-label="Montescano. Relojería mexicana desde 1998"
    onPointerMove={event => {
      if (!moving || event.pointerType !== 'mouse') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - bounds.left) / bounds.width - .5) * 26);
      y.set(((event.clientY - bounds.top) / bounds.height - .5) * 18);
    }} onPointerLeave={reset}>
    <motion.div className="cinema-atmosphere" aria-hidden="true"
      animate={{backgroundColor: current.glow}}
      transition={{duration: reduced ? 0 : 1.1}} />
    <div className="cinema-grid" aria-hidden="true" />
    <div className="cinema-beam" aria-hidden="true" />
    <motion.div className="cinema-year" aria-hidden="true" animate={{x: scene * -14}} transition={{duration:.8}}>1998</motion.div>

    <div className="cinema-copy">
      <p className="cinema-eyebrow"><span /> RELOJERÍA MEXICANA · DESDE 1998</p>
      <h1><span className="cinema-line"><span>El tiempo,</span></span><span className="cinema-line"><em>a tu manera.</em></span></h1>
      <div className="cinema-scene-copy" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={scene} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration: reduced ? 0 : .38}}>
            <strong style={{color:current.accent}}>{current.eyebrow}</strong>
            <p>{current.title}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="cinema-actions">
        <a className="cinema-cta" href="#catalogo">EXPLORAR COLECCIONES <span aria-hidden="true">↗</span></a>
        <a className="cinema-secondary" href="#corporativo">Proyectos corporativos <span aria-hidden="true">↗</span></a>
      </div>
      <div className="cinema-tabs" role="tablist" aria-label="Escenas del hero">
        {scenes.map((item,index)=><button key={item.eyebrow} role="tab" aria-selected={scene===index} onClick={()=>setScene(index)}>
          <span>0{index+1}</span><b>{item.eyebrow}</b><i aria-hidden="true"><motion.span animate={{scaleX:scene===index?1:0}} transition={{duration:reduced?0:.5}} /></i>
        </button>)}
      </div>
    </div>

    <div className="cinema-stage" role="group" aria-label="Reloj Montescano"
      onPointerDown={event => {start.current = event.clientX;}}
      onPointerUp={event => {
        if (start.current !== null && Math.abs(event.clientX - start.current) > 45) change(event.clientX < start.current ? 1 : -1);
        start.current = null;
      }} onPointerCancel={() => {start.current = null;}}>
      <motion.div className="cinema-orbit cinema-orbit-one" aria-hidden="true" animate={{rotate:scene*18}} transition={{duration:1.2}} />
      <motion.div className="cinema-orbit cinema-orbit-two" aria-hidden="true" animate={{rotate:-scene*12}} transition={{duration:1.4}} />
      <motion.div className="cinema-halo" aria-hidden="true" animate={{backgroundColor:`${current.accent}16`,scale:[1,1.035,1]}} transition={{backgroundColor:{duration:1},scale:{duration:4,repeat:Infinity}}} />
      <motion.div className="cinema-product-depth" style={{x: moving ? x : 0, y: moving ? y : 0}}>
        <motion.div className="cinema-product-reveal" animate={{scale:current.scale,rotate:current.rotate}} transition={{type:'spring',stiffness:75,damping:18}}>
          <div className="cinema-product-float">
            <Image className="cinema-watch" src="/hero/tasac3521-cutout.png" alt="Montescano TASAC3521, reloj de carátula azul y brazalete metálico" width={1104} height={1425} sizes="(max-width: 700px) 85vw, 45vw" loading="eager" fetchPriority="high" draggable={false}/>
          </div>
        </motion.div>
      </motion.div>
      <div className="cinema-model"><span>MONTESCANO</span><strong>TASAC3521</strong>
        {product && <Link href={`/productos/${product.slug}`} aria-label="Descubrir el Montescano TASAC3521">Descubrir el modelo <span aria-hidden="true">↗</span></Link>}
      </div>
      <div className="cinema-swipe" aria-hidden="true">ARRASTRA · EXPLORA</div>
    </div>
  </section>;
}
