'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import type {Product} from '../lib/catalog-types';
import {families} from '../lib/catalog-types';
import {hasPromotion} from './ProductPrice';
import ContactActions from './ContactActions';
import LeadForm from './LeadForm';
import styles from './LuxrioExperience.module.css';

const money = new Intl.NumberFormat('es-MX', {style:'currency', currency:'MXN'});
const familyNames = Object.fromEntries(families.map(([id,name])=>[id,name])) as Record<string,string>;

type View = 'all'|'new'|'promo';

function productPrice(product:Product){
  const promo=hasPromotion(product);
  const value=promo?product.promo_price:product.price;
  if(typeof value!=='number'||value<=0) return null;
  return <div className={styles.price}>
    {promo&&typeof product.price==='number'&&<del>{money.format(product.price)}</del>}
    <strong>{money.format(value)}</strong><small> MXN</small>
  </div>;
}

function ProductCard({product}:{product:Product}){
  const promo=hasPromotion(product);
  return <article className={styles.productCard}>
    <Link href={`/productos/${product.slug}`} className={styles.productMedia} aria-label={`Ver ${product.sku}`}>
      {product.image&&<img src={product.image} alt={`${product.brand} ${product.sku}`} loading="lazy" width="320" height="390"/>}
      <span className={styles.arrow}>↗</span>
      <div className={styles.badges}>
        {product.is_new&&<span>NUEVO</span>}
        {promo&&<span>PROMO</span>}
      </div>
    </Link>
    <div className={styles.productInfo}>
      <p>{product.family==='kids'?'Vizanti Kids':product.brand}</p>
      <Link href={`/productos/${product.slug}`}><h3>{product.sku}</h3></Link>
      <p className={styles.description}>{product.description}</p>
      {productPrice(product)}
    </div>
  </article>;
}

export default function LuxrioExperience({products,saldoProducts}:{products:Product[];saldoProducts:Product[]}){
  const [family,setFamily]=useState('todos');
  const [view,setView]=useState<View>('all');
  const [query,setQuery]=useState('');
  const [visible,setVisible]=useState(20);
  const [menu,setMenu]=useState(false);

  const saldoKeys=useMemo(()=>new Set(saldoProducts.flatMap(p=>[p.id,p.slug])),[saldoProducts]);
  const regularProducts=useMemo(()=>products.filter(p=>!p.is_saldo&&!saldoKeys.has(p.id)&&!saldoKeys.has(p.slug)),[products,saldoKeys]);

  const featured=regularProducts.find(p=>p.family==='montescano'&&p.is_new&&p.image)
    ||regularProducts.find(p=>p.family==='montescano'&&p.image)
    ||regularProducts.find(p=>p.image);
  const news=regularProducts.filter(p=>p.is_new&&p.image).slice(0,4);
  const editorial=(news.length>=4?news:regularProducts.filter(p=>p.image).slice(0,4));
  const heroSecondary=regularProducts.find(p=>p.family==='vizanti'&&p.image&&p.id!==featured?.id);
  const corporate=regularProducts.find(p=>p.family==='sets'&&p.image);
  const saldos=saldoProducts.filter(p=>p.image).slice(0,3);

  const collectionCards=['montescano','vizanti','kids'].map(id=>({
    id,
    product:regularProducts.find(p=>p.family===id&&p.image),
    count:regularProducts.filter(p=>p.family===id).length,
  }));

  const filtered=useMemo(()=>regularProducts.filter(p=>{
    if(family!=='todos'&&p.family!==family) return false;
    if(view==='new'&&!p.is_new) return false;
    if(view==='promo'&&!hasPromotion(p)) return false;
    if(query){
      const haystack=`${p.sku} ${p.brand} ${p.description} ${p.collections.join(' ')}`.toLocaleLowerCase('es');
      if(!haystack.includes(query.toLocaleLowerCase('es'))) return false;
    }
    return true;
  }),[regularProducts,family,view,query]);

  const chooseFamily=(id:string)=>{
    setFamily(id);setView('all');setVisible(20);setMenu(false);
    requestAnimationFrame(()=>document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'}));
  };

  return <div className={styles.page}>
    <header className={styles.header}>
      <Link href="/" className={styles.logo}><img src="/brand/montescano.png" alt="Montescano" width="170" height="55"/></Link>
      <nav className={styles.desktopNav} aria-label="Principal">
        <a href="#inicio">INICIO</a>
        <button onClick={()=>chooseFamily('montescano')}>MONTESCANO</button>
        <button onClick={()=>chooseFamily('vizanti')}>VIZANTI</button>
        <button onClick={()=>chooseFamily('kids')}>KIDS</button>
        <button onClick={()=>chooseFamily('smart-watch')}>SMART WATCH</button>
        <button onClick={()=>chooseFamily('sets')}>SETS</button>
        <Link className={styles.saldosNav} href="/saldos">SALDOS</Link>
        <a href="#corporativo">CORPORATIVO</a>
      </nav>
      <a className={styles.contactLink} href="#contacto">CONTACTO ↗</a>
      <button className={styles.menuButton} onClick={()=>setMenu(v=>!v)} aria-expanded={menu} aria-label="Menú">{menu?'×':'☰'}</button>
      {menu&&<nav className={styles.mobileNav} aria-label="Móvil">
        <a href="#inicio" onClick={()=>setMenu(false)}>Inicio</a>
        <button onClick={()=>chooseFamily('montescano')}>Montescano</button>
        <button onClick={()=>chooseFamily('vizanti')}>Vizanti</button>
        <button onClick={()=>chooseFamily('kids')}>Vizanti Kids</button>
        <button onClick={()=>chooseFamily('smart-watch')}>Smart Watch</button>
        <button onClick={()=>chooseFamily('sets')}>Sets</button>
        <button onClick={()=>chooseFamily('plumas')}>Plumas</button>
        <Link className={styles.mobileSaldo} href="/saldos">VENTA DE SALDOS ↗</Link>
        <a href="#corporativo" onClick={()=>setMenu(false)}>Corporativo</a>
        <a href="#contacto" onClick={()=>setMenu(false)}>Contacto</a>
      </nav>}
    </header>

    <main>
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>RELOJERÍA MEXICANA · DESDE 1998</p>
          <h1><span>El tiempo,</span><em>con identidad.</em></h1>
          <p>Diseño, precisión y carácter en colecciones Montescano, Vizanti y soluciones corporativas.</p>
          <div className={styles.heroActions}>
            <button onClick={()=>chooseFamily('montescano')}>EXPLORAR COLECCIÓN <b>↗</b></button>
            <Link href="/cotizador">COTIZAR PROYECTO →</Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.heroRing}/>
          {featured?.image&&<img src={featured.image} alt={`${featured.brand} ${featured.sku}`} width="520" height="610"/>}
          {featured&&<div className={styles.heroMeta}><span>{featured.sku}</span>{productPrice(featured)}</div>}
        </div>
        <div className={styles.heroSide}>MONTESCANO <span>2026</span></div>
      </section>

      <section className={styles.dualBanners}>
        <button className={styles.banner} onClick={()=>{setView('new');setFamily('todos');document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});}}>
          <div><p>NOVEDADES</p><h2>Diseños que marcan<br/>un nuevo momento.</h2><span>VER NOVEDADES →</span></div>
          {featured?.image&&<img src={featured.image} alt="Novedades Montescano" width="260" height="310"/>}
        </button>
        <button className={`${styles.banner} ${styles.bannerDark}`} onClick={()=>{setView('promo');setFamily('todos');document.getElementById('catalogo')?.scrollIntoView({behavior:'smooth'});}}>
          <div><p>SELECCIÓN ESPECIAL</p><h2>Modelos con<br/>precio promocional.</h2><span>VER PROMOCIONES →</span></div>
          {heroSecondary?.image&&<img src={heroSecondary.image} alt="Promociones Vizanti" width="260" height="310"/>}
        </button>
      </section>

      <section className={styles.editSection}>
        <div className={styles.sectionHead}><div><p>SELECCIÓN MONTESCANO</p><h2>Relojes para cada momento.</h2></div><button onClick={()=>chooseFamily('todos')}>VER TODO EL CATÁLOGO ↗</button></div>
        <div className={styles.editorialGrid}>{editorial.map(p=><ProductCard product={p} key={p.id}/>)}</div>
      </section>

      <section className={styles.collections}>
        <div className={styles.sectionHead}><div><p>EXPLORA POR MARCA</p><h2>Nuestras colecciones.</h2></div></div>
        <div className={styles.collectionGrid}>{collectionCards.map(({id,product,count})=><button key={id} onClick={()=>chooseFamily(id)} className={styles.collectionCard}>
          <span>{String(count).padStart(2,'0')} MODELOS</span>
          {product?.image&&<img src={product.image} alt={familyNames[id]} width="330" height="380"/>}
          <div><h3>{familyNames[id]}</h3><b>↗</b></div>
        </button>)}</div>
      </section>

      <section id="corporativo" className={styles.corporate}>
        <div className={styles.corporateArt}>{corporate?.image&&<img src={corporate.image} alt="Set corporativo Montescano" width="560" height="470"/>}</div>
        <div className={styles.corporateCopy}><p>UNA MARCA QUE TE REPRESENTA</p><h2>Personaliza<br/><span>tu tiempo.</span></h2><p>Relojes, plumas y sets para empresas, distribuidores, reconocimientos e incentivos. Personalización según modelo y proyecto.</p><div><Link href="/cotizador">COTIZAR PROYECTO ↗</Link><a href="#contacto">HABLAR CON EL EQUIPO →</a></div></div>
      </section>

      <section className={styles.saldoStrip}>
        <div className={styles.saldoCopy}><p>OPORTUNIDADES POR VOLUMEN</p><h2>Venta de <em>Saldos</em></h2><p>Una sección independiente del catálogo regular, con modelos seleccionados y disponibilidad sujeta a confirmación.</p><Link href="/saldos">ENTRAR A VENTA DE SALDOS <b>↗</b></Link></div>
        <div className={styles.saldoProducts}>{saldos.length?saldos.map(p=><Link href={`/saldos/${p.slug}`} key={p.id}><img src={p.image} alt={p.sku} width="190" height="230"/><span>{p.sku}</span></Link>):<div className={styles.saldoFallback}>Consulta los modelos disponibles<br/>en la sección de saldos.</div>}</div>
        <div className={styles.saldoMark}>SALDOS</div>
      </section>

      <section id="catalogo" className={styles.catalog}>
        <div className={styles.sectionHead}><div><p>CATÁLOGO COMERCIAL · OCTUBRE 2026</p><h2>Encuentra tu próximo modelo.</h2></div><span>{filtered.length} MODELOS</span></div>
        <div className={styles.catalogControls}>
          <div className={styles.viewTabs}>{(['all','new','promo'] as View[]).map(id=><button className={view===id?styles.active:''} key={id} onClick={()=>{setView(id);setVisible(20)}}>{id==='all'?'TODOS':id==='new'?'NOVEDADES':'PROMOCIONES'}</button>)}</div>
          <div className={styles.familyTabs}>{families.map(([id,name])=><button className={family===id?styles.active:''} key={id} onClick={()=>{setFamily(id);setVisible(20)}}>{name}</button>)}</div>
          <label className={styles.search}><span>⌕</span><input type="search" value={query} onChange={e=>{setQuery(e.target.value);setVisible(20)}} placeholder="Buscar por modelo, SKU o colección..."/><button onClick={()=>setQuery('')} aria-label="Limpiar">{query?'×':''}</button></label>
        </div>
        <div className={styles.productGrid}>{filtered.slice(0,visible).map(p=><ProductCard product={p} key={p.id}/>)}</div>
        {!filtered.length&&<div className={styles.empty}><h3>No encontramos ese modelo.</h3><button onClick={()=>{setQuery('');setFamily('todos');setView('all')}}>LIMPIAR FILTROS</button></div>}
        {visible<filtered.length&&<div className={styles.more}><span>{visible} de {filtered.length}</span><button onClick={()=>setVisible(v=>v+20)}>VER MÁS MODELOS ↓</button></div>}
      </section>

      <section id="contacto" className={styles.contact}>
        <div><p>CONTACTO COMERCIAL</p><h2>La siguiente conversación<br/><span>empieza aquí.</span></h2><p>Cuéntanos qué estás buscando para tienda, distribución, volumen o un proyecto corporativo.</p><ContactActions/></div>
        <div className={styles.form}><LeadForm/></div>
      </section>
    </main>

    <footer className={styles.footer}>
      <div><img src="/brand/montescano.png" alt="Montescano" width="180" height="58"/><p>Relojería mexicana desde 1998.</p></div>
      <div><strong>COLECCIONES</strong><button onClick={()=>chooseFamily('montescano')}>Montescano</button><button onClick={()=>chooseFamily('vizanti')}>Vizanti</button><button onClick={()=>chooseFamily('kids')}>Vizanti Kids</button><button onClick={()=>chooseFamily('smart-watch')}>Smart Watch</button></div>
      <div><strong>COMERCIAL</strong><Link href="/saldos" className={styles.footerSaldo}>Venta de Saldos</Link><Link href="/cotizador">Cotizador</Link><a href="#corporativo">Corporativo</a><a href="#contacto">Contacto</a></div>
      <div className={styles.footerBottom}>MONTESCANO · CATÁLOGO COMERCIAL 2026</div>
    </footer>
  </div>;
}
