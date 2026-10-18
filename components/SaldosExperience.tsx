'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {Product} from '../lib/catalog-types';
import {availabilityLabels} from '../lib/catalog-types';
import ProductPrice,{hasPromotion} from './ProductPrice';
import styles from './SaldosExperience.module.css';

type Sort='featured'|'price-asc'|'price-desc';
export default function SaldosExperience({products}:{products:Product[]}){
  const [query,setQuery]=useState('');
  const [brand,setBrand]=useState('todas');
  const [sort,setSort]=useState<Sort>('featured');
  const [visible,setVisible]=useState(16);
  const brands=useMemo(()=>[...new Set(products.map(p=>p.brand))].sort(),[products]);
  const filtered=useMemo(()=>{
    const q=query.trim().toLocaleLowerCase('es');
    const list=products.filter(p=>(brand==='todas'||p.brand===brand)&&(!q||[p.sku,p.brand,p.description].join(' ').toLocaleLowerCase('es').includes(q)));
    if(sort!=='featured')list.sort((a,b)=>{
      const price=(p:Product)=>typeof p.price==='number'&&p.price>0?(hasPromotion(p)?p.promo_price!:p.price):null;
      const av=price(a),bv=price(b);
      if(av===null&&bv!==null)return 1;
      if(av!==null&&bv===null)return -1;
      return av!==null&&bv!==null?(sort==='price-asc'?av-bv:bv-av)||a.sku.localeCompare(b.sku):a.sku.localeCompare(b.sku);
    });
    return list;
  },[products,brand,query,sort]);
  const changeBrand=(next:string)=>{setBrand(next);setVisible(16);};
  const clear=()=>{setQuery('');setBrand('todas');setSort('featured');setVisible(16);};
  const heroProducts=products.filter(p=>p.image).slice(0,3);
  return <div className={styles.page}>
    <a className={styles.skip} href="#modelos">Ir a los modelos en Saldos</a>
    <header className={styles.header}>
      <Link href="/" className={styles.logo}><img src="/brand/montescano.png" alt="Montescano" width="170" height="55"/></Link>
      <div className={styles.title}><span>COLECCIÓN ESPECIAL</span><strong>VENTA DE SALDOS</strong></div>
      <Link className={styles.back} href="/">← CATÁLOGO COMERCIAL</Link>
    </header>
    <main>
      <section className={styles.hero} aria-label="Venta de Saldos Montescano">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span/> EDICIÓN COMERCIAL · MONTESCANO</p>
          <h1>Venta de <strong>Saldos.</strong></h1>
          <p className={styles.deck}>Una selección independiente de relojes disponibles para consulta comercial. Modelos reales, precios publicados en MXN y disponibilidad por confirmar.</p>
          <a href="#modelos" className={styles.heroButton}>EXPLORAR LOS MODELOS <span aria-hidden="true">↗</span></a>
          <p className={styles.disclaimer}>Hasta agotar existencias. La cotización final está sujeta a confirmación.</p>
        </div>
        <div className={styles.heroStack} aria-label="Tres relojes reales de Venta de Saldos">
          {heroProducts.map((p,i)=><Link key={p.id} href={`/saldos/${p.slug}`} className={styles.stackCard} style={{'--i':i} as CSSProperties}>
            <img src={p.image} alt={`${p.brand} ${p.sku}`} width="280" height="320" loading={i===0?'eager':'lazy'}/>
            <span>{p.sku}</span>
          </Link>)}
        </div>
        <span className={styles.watermark} aria-hidden="true">SALDOS</span>
      </section>
      <section id="modelos" className={styles.catalog}>
        <div className={styles.intro}><div><p>EXCLUSIVO EN ESTA SECCIÓN</p><h2>Modelos de Saldos.</h2></div><span>{products.length} REFERENCIAS PUBLICADAS</span></div>
        <div className={styles.tools}>
          <label className={styles.search}><span>BUSCAR MODELO</span><input type="search" placeholder="SKU, marca o descripción" value={query} onChange={e=>{setQuery(e.target.value);setVisible(16);}}/></label>
          <label className={styles.sort}><span>ORDENAR POR</span><select value={sort} onChange={e=>{setSort(e.target.value as Sort);setVisible(16);}}><option value="featured">Selección del catálogo</option><option value="price-asc">Menor precio</option><option value="price-desc">Mayor precio</option></select></label>
        </div>
        <div className={styles.brands} aria-label="Filtrar por marca">
          <button type="button" aria-pressed={brand==='todas'} onClick={()=>changeBrand('todas')}>TODAS LAS MARCAS</button>
          {brands.map(name=><button key={name} type="button" aria-pressed={brand===name} onClick={()=>changeBrand(name)}>{name.toUpperCase()}</button>)}
        </div>
        <div className={styles.count} role="status" aria-live="polite">{filtered.length} modelos encontrados{(query||brand!=='todas')&&<button type="button" onClick={clear}>Limpiar filtros ×</button>}</div>
        <div className={styles.grid}>{filtered.slice(0,visible).map(p=><article key={p.id} className={styles.card}>
          <Link href={`/saldos/${p.slug}`} className={styles.media} aria-label={`Ver saldo ${p.brand} ${p.sku}`}>
            {p.image?<img src={p.image} alt={`${p.brand} ${p.sku}`} width="300" height="350" loading="lazy"/>:<span>Imagen por confirmar</span>}
            <span className={styles.openArrow} aria-hidden="true">↗</span><b>SALDO</b>
          </Link>
          <div className={styles.info}><p>{p.family==='kids'?'Vizanti Kids':p.brand}</p><h3><Link href={`/saldos/${p.slug}`}>{p.sku}</Link></h3>
            <p className={styles.desc}>{p.description}</p><ProductPrice product={p}/>
            <span className={styles.availability}>{availabilityLabels[p.availability]}</span><Link className={styles.detail} href={`/saldos/${p.slug}`}>VER DETALLES <span aria-hidden="true">↗</span></Link>
          </div>
        </article>)}</div>
        {filtered.length===0&&<div className={styles.empty}>No hay modelos que coincidan con la búsqueda. <button type="button" onClick={clear}>Ver todos los Saldos</button></div>}
        {visible<filtered.length&&<button type="button" className={styles.more} onClick={()=>setVisible(v=>v+16)}>MOSTRAR MÁS RELOJES <span aria-hidden="true">↓</span></button>}
      </section>
    </main>
    <footer className={styles.footer}><Link href="/">MONTESCANO · CATÁLOGO COMERCIAL</Link><Link href="/privacidad">PRIVACIDAD Y CONTACTO</Link></footer>
  </div>;
}
