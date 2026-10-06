'use client';

import {useRef, useState} from 'react';
import {motion, useInView, useReducedMotion, useSpring} from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import type {Product} from '../lib/catalog-types';
import './CinematicHero.css';

const atmospheres = [
  {name: 'Azul nocturno', color: '#517b9d', glow: '#234a62'},
  {name: 'Verde profundo', color: '#97a984', glow: '#344e3a'},
  {name: 'Luz de plata', color: '#b7c8ce', glow: '#48535a'},
];

export default function CinematicHero({product}: {product?: Product}) {
  const root = useRef<HTMLElement>(null);
  const start = useRef<number | null>(null);
  const visible = useInView(root, {amount: 0.15});
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [scene, setScene] = useState(0);
  const x = useSpring(0, {stiffness: 65, damping: 24});
  const y = useSpring(0, {stiffness: 65, damping: 24});
  const moving = !reduced && !paused && visible;
  const reset = () => { x.set(0); y.set(0); };
  const change = (direction: number) => setScene(current => (current + direction + atmospheres.length) % atmospheres.length);

  return <section ref={root} id="inicio" className="cinema" data-paused={!moving}
    aria-label="Montescano. El tiempo, a tu manera"
    onPointerMove={event => {
      if (!moving || event.pointerType !== 'mouse') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      x.set(((event.clientX - bounds.left) / bounds.width - .5) * 22);
      y.set(((event.clientY - bounds.top) / bounds.height - .5) * 16);
    }} onPointerLeave={reset}>
    <motion.div className="cinema-atmosphere" aria-hidden="true"
      animate={{backgroundColor: atmospheres[scene].glow}}
      transition={{duration: reduced ? 0 : 1.2}} />
    <div className="cinema-grain" aria-hidden="true" />
    <div className="cinema-beam" aria-hidden="true" />
    <div className="cinema-year" aria-hidden="true">1998</div>

    <div className="cinema-copy">
      <p className="cinema-eyebrow"><span /> RELOJERÍA MEXICANA · DESDE 1998</p>
      <h1><span className="cinema-line"><span>El tiempo,</span></span><span className="cinema-line"><em>a tu manera.</em></span></h1>
      <p className="cinema-description">Hay piezas que dicen quién eres.<br />Encuentra la tuya.</p>
      <div className="cinema-actions">
        <a className="cinema-cta" href="#catalogo">EXPLORAR COLECCIONES <span aria-hidden="true">↗</span></a>
        <a className="cinema-secondary" href="#corporativo">Proyectos corporativos <span aria-hidden="true">↗</span></a>
      </div>
    </div>

    <div className="cinema-stage" role="group" aria-label="Reloj Montescano. Cambia la iluminación con los controles"
      onPointerDown={event => {start.current = event.clientX;}}
      onPointerUp={event => {
        if (start.current !== null && Math.abs(event.clientX - start.current) > 45) change(event.clientX < start.current ? 1 : -1);
        start.current = null;
      }} onPointerCancel={() => {start.current = null;}}>
      <div className="cinema-orbit cinema-orbit-one" aria-hidden="true" />
      <div className="cinema-orbit cinema-orbit-two" aria-hidden="true" />
      <div className="cinema-halo" aria-hidden="true" />
      <motion.div className="cinema-product-depth" style={{x: moving ? x : 0, y: moving ? y : 0}}>
        <div className="cinema-product-reveal"><div className="cinema-product-float">
          <Image className="cinema-watch" src="/hero/tasac3521-cutout.png" alt="Montescano TASAC3521, reloj de carátula azul y brazalete metálico" width={1104} height={1425} sizes="(max-width: 700px) 85vw, 45vw" loading="eager" fetchPriority="high" draggable={false}/>
        </div></div>
      </motion.div>
      <div className="cinema-model"><span>MONTESCANO</span><strong>TASAC3521</strong>
        {product && <Link href={`/productos/${product.slug}`} aria-label="Descubrir el Montescano TASAC3521">Descubrir el modelo <span aria-hidden="true">↗</span></Link>}
      </div>
    </div>

    <div className="cinema-bottom">
      <a className="cinema-scroll" href="#catalogo"><span aria-hidden="true">↓</span> DESCUBRE TU SIGUIENTE PIEZA</a>
      <div className="cinema-lighting" role="group" aria-label="Iluminación del escenario">
        <span className="cinema-lighting-label">LUZ /</span>
        {atmospheres.map((atmosphere, index) => <button key={atmosphere.name} type="button" className="cinema-swatch" aria-label={atmosphere.name} aria-pressed={scene === index} onClick={() => setScene(index)}><span style={{background: atmosphere.color}} /></button>)}
        <span className="cinema-scene-name" aria-live="polite">{atmospheres[scene].name}</span>
      </div>
      {!reduced && <button className="cinema-pause" type="button" aria-label={paused ? 'Reanudar animación' : 'Pausar animación'} aria-pressed={paused} onClick={() => {setPaused(!paused); reset();}}><span aria-hidden="true">{paused ? '▷' : 'Ⅱ'}</span><span>{paused ? 'Reanudar' : 'Pausar'}</span></button>}
    </div>
  </section>;
}
