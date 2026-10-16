import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {Product} from '../lib/catalog-types';
import {availabilityLabels} from '../lib/catalog-types';
import styles from './SaldosExperience.module.css';

const money=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'});

export default function SaldosExperience({products}:{products:Product[]}){
  return <div className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.logo}><img src="/brand/montescano.png" alt="Montescano" width="170" height="55"/></Link>
      <div className={styles.title}><span>SECCIÓN ESPECIAL</span><strong>VENTA DE SALDOS</strong></div>
      <Link className={styles.back} href="/">← CATÁLOGO COMERCIAL</Link>
    </header>
    <main>
      <section className={styles.hero}>
        <div><p>OPORTUNIDADES POR VOLUMEN</p><h1>Venta de<br/><em>Saldos</em></h1><p>Modelos seleccionados fuera del catálogo regular. Precios en MXN y disponibilidad sujeta a confirmación.</p><a href="#modelos">VER MODELOS ↓</a></div>
        <div className={styles.heroStack}>{products.slice(0,3).map((p,i)=><div key={p.id} style={{'--i':i} as CSSProperties}><img src={p.image} alt={p.sku} width="260" height="310"/><span>{p.sku}</span></div>)}</div>
        <span className={styles.watermark}>SALDOS</span>
      </section>
      <section id="modelos" className={styles.catalog}>
        <div className={styles.intro}><div><p>SELECCIÓN DISPONIBLE</p><h2>Modelos en venta de saldos.</h2></div><span>{products.length} MODELOS</span></div>
        <div className={styles.grid}>{products.map(p=><article key={p.id} className={styles.card}>
          <Link href={`/saldos/${p.slug}`} className={styles.media}>{p.image&&<img src={p.image} alt={`${p.brand} ${p.sku}`} width="300" height="350" loading="lazy"/>}<span>↗</span><b>SALDO</b></Link>
          <div className={styles.info}><p>{p.family==='kids'?'Vizanti Kids':p.brand}</p><h3><Link href={`/saldos/${p.slug}`}>{p.sku}</Link></h3><p className={styles.desc}>{p.description}</p>{typeof p.promo_price==='number'&&p.promo_price>0?<strong>{money.format(p.promo_price)} <small>MXN</small></strong>:typeof p.price==='number'&&p.price>0?<strong>{money.format(p.price)} <small>MXN</small></strong>:null}<span className={styles.availability}>{availabilityLabels[p.availability]}</span><Link className={styles.detail} href={`/saldos/${p.slug}`}>VER DETALLES →</Link></div>
        </article>)}</div>
        {!products.length&&<div className={styles.empty}>No hay modelos de saldos publicados en este momento.</div>}
      </section>
    </main>
    <footer className={styles.footer}><Link href="/">MONTESCANO · CATÁLOGO COMERCIAL</Link><Link href="/cotizador">SOLICITAR COTIZACIÓN ↗</Link></footer>
  </div>;
}
