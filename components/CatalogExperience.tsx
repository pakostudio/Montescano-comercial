"use client";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { useEffect, useMemo, useState, useRef } from "react";
import Link from "next/link";
import {
  families,
  availabilityLabels,
  type Product,
} from "../lib/catalog-types";
import Dialog from "./Dialog";
import LeadForm from "./LeadForm";
import {Action,ActionLink,Reveal} from './MotionUI';
import CinematicHero from './CinematicHero';
import ContactActions from './ContactActions';
import CommercialCtas from './CommercialCtas';
import saldosStyles from './SaldosNavLink.module.css';
import QuoteLink from './QuoteLink';
import ProductPrice, {hasPromotion} from './ProductPrice';
import {FAST,NORMAL,SLOW,EASE,SPRING} from '../lib/motion';
function NavIcon({kind}:{kind:string}){
  const common={viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round" as const,strokeLinejoin:"round" as const,"aria-hidden":true};
  if(kind==='inicio')return <svg {...common}><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-6h6v6"/></svg>;
  if(kind==='montescano')return <svg {...common}><path d="M5 21V5.5L12 3l7 2.5V21"/><path d="M8 8h2M14 8h2M8 12h2M14 12h2M8 16h2M14 16h2"/></svg>;
  if(kind==='vizanti')return <svg {...common}><path d="M12 21c.2-5.4 2.1-9.6 6.8-13.7-5.7.1-9 2.8-9.8 7.7"/><path d="M12 21c-.4-4.9-2.6-8.4-7.4-10.8 1 5.2 3.5 8.3 7.4 10.8Z"/><path d="M12 21v-9"/></svg>;
  if(kind==='kids')return <svg {...common}><circle cx="12" cy="12" r="8"/><path d="M9 10h.01M15 10h.01M9 14c1.8 1.7 4.2 1.7 6 0M8 5.5 6.5 3.8M16 5.5l1.5-1.7"/></svg>;
  if(kind==='smart-watch')return <svg {...common}><rect x="7" y="6" width="10" height="12" rx="2.5"/><path d="M9 6 10 2h4l1 4M9 18l1 4h4l1-4M10 10h4v4h-4z"/></svg>;
  if(kind==='sets')return <svg {...common}><path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/></svg>;
  if(kind==='corporativo')return <svg {...common}><path d="M16 20v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="3"/><path d="M17 11a3 3 0 1 0 0-6M21 20v-2.2a3.8 3.8 0 0 0-2.5-3.6"/></svg>;
  if(kind==='saldos')return <svg {...common}><path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8.5" cy="8.5" r="1.2"/></svg>;
  return <svg {...common}><path d="M4 5.5c2.8-.9 5.5-.5 8 1.2v12c-2.5-1.7-5.2-2.1-8-1.2v-12ZM20 5.5c-2.8-.9-5.5-.5-8 1.2v12c2.5-1.7 5.2-2.1 8-1.2v-12Z"/></svg>;
}
const normalizedGender = (value:string|null|undefined) => (value || '').trim().toLocaleUpperCase('es');
const genderMatches = (productGender:string|null, filterGender:string) => {
  if (!filterGender) return true;
  const p=normalizedGender(productGender), f=normalizedGender(filterGender);
  if (f==='NIÑOS') return ['NIÑO','NIÑA','NIÑOS','NIÑAS'].includes(p);
  return p===f;
};
const initialFilters = {
  brand: "",
  gender: "",
  collection: "",
  availability: "",
};
export default function CatalogExperience({
  products,
}: {
  products: Product[];
}) {
  const reduced = useReducedMotion();
  const tabsRef=useRef<HTMLDivElement>(null);
  const [section,setSection]=useState('inicio');
  const [selection,setSelection]=useState<'edition'|'all'|'new'|'promo'>('all');
  const [sort,setSort]=useState<'catalog'|'price-asc'|'price-desc'|'newest'>('catalog');
  const {scrollY}=useScroll();
  useMotionValueEvent(scrollY,'change',value=>setScrolled(value>24));
  const [active, setActive] = useState("todos"),
    [query, setQuery] = useState(""),
    [filters, setFilters] = useState(initialFilters),
    [visible, setVisible] = useState(24);
  const [quick, setQuick] = useState<Product | null>(null),
    [lead, setLead] = useState<{
      product?: Product;
      interest?: string;
      context: string;
    } | null>(null),
    [filterOpen, setFilterOpen] = useState(false),
    [menu, setMenu] = useState(false),
    [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setSection(entry.target.id);},{rootMargin:'-18% 0px -65% 0px',threshold:0});
    ['inicio','catalogo','corporativo'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  }, []);
  useEffect(()=>{const container=tabsRef.current;const selected=container?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');if(container&&selected)container.scrollTo({left:selected.offsetLeft-container.offsetLeft-(container.clientWidth-selected.clientWidth)/2,behavior:reduced?'instant':'smooth'});},[active,reduced]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("coleccion");
    if (f && families.some(([id]) => id === f)) {setActive(f);if(!['todos','montescano','vizanti','kids'].includes(f))setSelection('all');}
    const g = p.get("genero");
    if (g) {setSelection('all');setFilters((v) => ({ ...v, gender: g }));}
  }, []);
  useEffect(() => {
    setVisible(24);
  }, [active, query, filters, selection, sort]);
  const editionCount=useMemo(()=>products.filter(p=>p.edition==='2026-10').length,[products]);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (active === "todos" || p.family === active) &&
          (selection === 'all' || (selection === 'edition' ? p.edition==='2026-10' : selection==='new' ? p.is_new : hasPromotion(p))) &&
          (!query ||
            `${p.sku} ${p.brand} ${p.description} ${p.collections.join(" ")}`
              .toLocaleLowerCase("es")
              .includes(query.toLocaleLowerCase("es"))) &&
          (!filters.brand || p.brand === filters.brand) &&
          genderMatches(p.gender,filters.gender) &&
          (!filters.collection || p.collections.includes(filters.collection)) &&
          (!filters.availability || p.availability === filters.availability),
      ).sort((a,b)=>{
        const price=(p:Product)=>{const v=hasPromotion(p)?p.promo_price:p.price;return typeof v==='number'&&v>0?v:null;};
        if(sort==='catalog'){
          const score=(p:Product)=>p.collections.some(c=>/parejas|en pareja/i.test(c))?0:p.family==='sets'?1:p.family==='montescano'?2:p.family==='vizanti'?3:p.family==='kids'?4:5;
          return score(a)-score(b)||a.sku.localeCompare(b.sku);
        }
        if(sort==='price-asc'||sort==='price-desc'){
          const av=price(a),bv=price(b);
          if(av===null&&bv!==null)return 1;
          if(av!==null&&bv===null)return -1;
          if(av!==null&&bv!==null)return (sort==='price-asc'?av-bv:bv-av)||a.sku.localeCompare(b.sku);
          return a.sku.localeCompare(b.sku);
        }
        if(sort==='newest')return Number(Boolean(b.is_new))-Number(Boolean(a.is_new))||a.sku.localeCompare(b.sku);
        return 0;
      }),
    [products,active,query,filters,selection,sort],
  );
  const filterCount = Object.values(filters).filter(Boolean).length;
  const corporateProduct = products.find((p) => p.family === "sets");
  const corporateModels = products.filter(p => p.family === 'sets' || p.collections.some(c => /parejas|en set|corporativ|regalos/i.test(c)));
  const featuredPairs = products.filter(p=>p.collections.some(c=>/parejas|en pareja/i.test(c)));
  const hasPairCollections=featuredPairs.length>0;
  const clear = () => {
    setSelection('all');
    setSort('catalog');
    setFilters(initialFilters);
    setActive("todos");
    setQuery("");
  };
  const choose = (family: string) => {
    setSelection(['todos','montescano','vizanti','kids'].includes(family)?'edition':'all');
    setActive(family);
    setFilters(initialFilters);
    setQuery("");
    setMenu(false);
  };
  const reveal = {
    initial: { opacity: 0, y: reduced ? 0 : 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.12 },
    transition: { duration: reduced?FAST:SLOW,ease:EASE },
  };
  return (
    <MotionConfig
      reducedMotion="user"
      transition={SPRING}
    >
      <a href="#catalogo" className="skip-link">
        Saltar al catálogo
      </a>
      <motion.header layout className={`site-header cinematic-header ${scrolled ? "scrolled" : ""}`} transition={{layout:{duration:NORMAL,ease:EASE}}}>
        <Link href="/" className="logo" aria-label="Montescano, inicio">
          <img
            src="/brand/montescano.png"
            width="164"
            height="53"
            alt="Montescano"
          />
        </Link>
        <nav aria-label="Principal" className="desktop-nav">
          {[
            ["INICIO", "#inicio", "todos", "inicio"],
            ["MONTESCANO", "#catalogo", "montescano", "montescano"],
            ["VIZANTI", "#catalogo", "vizanti", "vizanti"],
            ["VIZANTI KIDS", "#catalogo", "kids", "kids"],
            ["SMART WATCH", "#catalogo", "smart-watch", "smart-watch"],
            ["SETS", "#catalogo", "sets", "sets"],
            ["CORPORATIVO", "#corporativo", "", "corporativo"],
          ].map(([label, href, family, icon]) => (
            <ActionLink className="nav-premium-item" key={label} href={href} aria-current={(section==='catalogo'?active===family&&family!=='todos':href===`#${section}`)?'location':undefined} onClick={() => {setSection(href.slice(1));if(family)choose(family);}}>
              <NavIcon kind={icon}/><span>{label}</span>
              {(section==='catalogo'?active===family&&family!=='todos':href===`#${section}`) && (
                <motion.i
                  className="nav-indicator"
                  layoutId="navigation-active"
                  transition={SPRING}
                />
              )}
            </ActionLink>
          ))}
          <Link className={saldosStyles.desktop} href="/saldos" aria-label="Venta de Saldos"><NavIcon kind="saldos"/><span>SALDOS</span></Link>
        </nav>
        <div className="header-commercial-cluster">
          <CommercialCtas onContact={()=>setLead({context:'header-contacto'})}/>
          
        </div>
        <Action
          className="menu-toggle"
          onClick={() => setMenu(true)}
          aria-expanded={menu}
          aria-label="Abrir menú principal"
        >
          <strong className="mobile-menu-label">MENÚ</strong>
          <span />
          <span />
        </Action>
      </motion.header>
      <main>
        <CinematicHero />
        <section id="catalogo" className="catalog-section">
          <motion.div {...reveal} className="section-intro">
            <div>
              <p className="kicker">{selection==='edition'?'CATÁLOGO ACTUALIZADO · OCTUBRE 2026':'CATÁLOGO COMERCIAL MONTESCANO'}</p>
              <h2>{selection==='edition'?'Montescano y Vizanti · Colección 2026.':'Relojes para cada ocasión y proyectos corporativos.'}</h2>
            </div>
            <p className="section-note">
              {selection==='edition'?<>{editionCount} modelos con fotografía aprobada del catálogo oficial de octubre 2026.</>:<>Colecciones generales de Montescano, Vizanti, Kids, Sets y Plumas.</>}
              <br />
              Precios públicos en MXN. Disponibilidad sujeta a confirmación.
            </p>
          </motion.div>
          <div className="controls">
            {hasPairCollections && <div className="catalog-selections" aria-label="Relojes en pareja"><button onClick={()=>{setSelection('all');setActive('todos');setFilters({...initialFilters,collection:featuredPairs[0].collections.find(c=>/parejas|en pareja/i.test(c))||''});setQuery('')}}>RELOJES EN PAREJA · {featuredPairs.length}</button><button onClick={()=>{setSelection('all');setActive('sets');setFilters(initialFilters);setQuery('')}}>SETS Y REGALOS</button></div>}
            <div className="catalog-selections" aria-label="Selección de productos">
              {([['edition',`Catálogo octubre 2026 · ${editionCount}`],['all',`Ver todo el catálogo · ${products.length}`],['new','Novedades'],['promo','Promociones']] as const).map(([id,label]) =>
                <button key={id} aria-pressed={selection===id} onClick={()=>setSelection(id)}>{label}</button>)}
            </div>
            <motion.div layoutScroll ref={tabsRef} className="category-tabs" aria-label="Categoría">
              {families.map(([id, name]) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{backgroundColor:'#edf0e8'}}
                  className={active === id ? "active" : ""}
                  onClick={() => selection==='edition'&&!['todos','montescano','vizanti','kids'].includes(id)?choose(id):setActive(id)}
                  aria-pressed={active === id}
                >
                  <span>{name}</span>
                  <small>
                    {products.filter(p=>(id==='todos'||p.family===id)&&(selection!=='edition'||!['todos','montescano','vizanti','kids'].includes(id)||p.edition==='2026-10')).length}
                  </small>
                  {active === id && (
                    <motion.i
                      className="tab-indicator"
                      layoutId="active-category"
                      transition={SPRING}
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>
            <div className="search-row">
              <label className="search-box">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m16 16 5 5" />
                </svg>
                <input
                  type="search"
                  placeholder="Buscar por modelo o SKU..."
                  aria-label="Buscar por modelo o SKU"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <Action
                    onClick={() => setQuery("")}
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </Action>
                )}
              </label>
              <Action
                className="filter-button"
                onClick={() => setFilterOpen(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M3 6h18M3 12h18M3 18h18M8 3v6M16 9v6M8 15v6" />
                </svg>{" "}
                Filtros {filterCount > 0 && <span>{filterCount}</span>}
              </Action>
              <label className="sort-box">ORDENAR
                <select value={sort} onChange={e=>setSort(e.target.value as typeof sort)} aria-label="Ordenar catálogo">
                  <option value="catalog">Orden del catálogo</option>
                  <option value="newest">Novedades primero</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                </select>
              </label>
              <p className="result-count" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}><motion.span key={filtered.length} initial={{opacity:0,y:reduced?0:4}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:FAST}}>{filtered.length}</motion.span></AnimatePresence> modelos
              </p>
            </div>
            <motion.div layout className="filter-chips">
              <AnimatePresence>
                {Object.entries(filters)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <motion.button
                      layout
                      initial={{ opacity: 0,scale:reduced?1:.96 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0,scale:reduced?1:.96 }}
                      whileTap={{scale:.97}}
                      key={k}
                      onClick={() => setFilters((f) => ({ ...f, [k]: "" }))}
                    >
                      {k === "availability"
                        ? availabilityLabels[
                            v as keyof typeof availabilityLabels
                          ]
                        : v}{" "}
                      ×
                    </motion.button>
                  ))}
              </AnimatePresence>
              {(filterCount > 0 || query) && (
                <Action onClick={clear}>Limpiar filtros</Action>
              )}
            </motion.div>
          </div>
          <motion.div layout="position" className="product-grid">
            <AnimatePresence mode="popLayout">
              {filtered.slice(0, visible).map((p,index) => (
                <motion.article
                  layout="position"
                  initial={{ opacity: 0, y: reduced ? 0 : 10,scale:reduced?1:.985 }}
                  animate={{ opacity: 1, y: 0,scale:1 }}
                  exit={{ opacity: 0, scale: reduced?1:.985,transition:{duration:FAST} }}
                  transition={{ duration: NORMAL,ease:EASE,delay:reduced?0:Math.min(index,5)*.025,layout:SPRING }}
                  className="product-card"
                  key={p.id}
                >
                  <motion.button
                    initial="rest"
                    whileHover="hover"
                    whileFocus="hover"
                    variants={{rest:{y:0},hover:{y:reduced?0:-3}}}
                    whileTap={{ scale: 0.98 }}
                    className="product-open"
                    onClick={() => setQuick(p)}
                    aria-label={`Ver detalles de ${p.sku}`}
                  >
                    <div className="product-media">
                      <motion.img
                        variants={{rest:{scale:1},hover:{scale:reduced?1:1.035}}}
                        transition={{duration:SLOW,ease:EASE}}
                        src={p.image}
                        alt={`${p.brand} ${p.sku}`}
                        width="240"
                        height="280"
                        loading="lazy"
                      />
                      
                    </div>
                    <div className="product-info">
                      <p className="product-brand">
                        {p.family === "kids" ? "Vizanti Kids" : p.brand}
                      </p>
                      <h3>{p.sku}</h3>
                      <p className="product-description">{p.description}</p>
                      <ProductPrice product={p}/>
                      <span className="card-cta">
                        VER DETALLES 
                      </span>
                    </div>
                  </motion.button>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
          <AnimatePresence>{filtered.length === 0 && (
            <motion.div initial={{opacity:0,y:reduced?0:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:NORMAL}} className="empty">
              <h3>No encontramos ese modelo.</h3>
              <p>Prueba otro SKU o elimina alguno de los filtros.</p>
              <Action className="button secondary" onClick={clear}>
                LIMPIAR FILTROS
              </Action>
            </motion.div>
          )}</AnimatePresence>
          {visible < filtered.length && (
            <div className="load-more">
              <p>
                {Math.min(visible, filtered.length)} de {filtered.length}{" "}
                modelos
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="button secondary"
                onClick={() => setVisible((v) => v + 24)}
              >
                VER MÁS MODELOS ↓
              </motion.button>
            </div>
          )}
        </section>
        <motion.section {...reveal} className="looking">
          <div className="section-intro">
            <div>
              <p className="kicker">UNA ELECCIÓN PERSONAL</p>
              <h2>¿Qué estás buscando?</h2>
            </div>
          </div>
          <div className="look-grid">
            {[
              ["Caballero", "Caballero"],
              ["Dama", "Dama"],
              ["Niños", "Niños"],
              ["Proyectos corporativos", "corporativo"],
            ].map(([title, target]) => {
              const p = products.find((p) =>
                target === "corporativo"
                  ? p.family === "sets"
                  : genderMatches(p.gender,target),
              );
              return (
                <motion.a
                  initial="rest" whileHover="hover" whileFocus="hover" whileTap={{scale:.985}}
                  variants={{rest:{y:0},hover:{y:reduced?0:-3}}}
                  key={target}
                  className="look-card"
                  href={target === "corporativo" ? "#corporativo" : "#catalogo"}
                  onClick={() => {
                    if (target !== "corporativo") {
                      clear();
                      setSelection('all');
                      setFilters({ ...initialFilters, gender: target });
                    }
                  }}
                >
                  {p && (
                    <motion.img variants={{rest:{scale:1},hover:{scale:reduced?1:1.035}}} transition={{duration:SLOW,ease:EASE}}
                      src={p.image}
                      alt={p.description}
                      loading="lazy"
                      width="230"
                      height="245"
                    />
                  )}
                  <motion.span variants={{rest:{y:0},hover:{y:reduced?0:-2}}}>
                    {title}
                    
                  </motion.span>
                </motion.a>
              );
            })}
          </div>
        </motion.section>
        <section id="corporativo" className="corporate">
          <Reveal image className="corporate-image">
            {corporateProduct && (
              <img
                src={corporateProduct.image}
                alt="Set de regalo Montescano"
                width="400"
                height="350"
                loading="lazy"
              />
            )}
          </Reveal>
          <div>
            <Reveal delay={.06}><p className="kicker">UNA MARCA QUE TE REPRESENTA</p>
            <h2>
              Proyectos corporativos
              <br />y personalización.
            </h2></Reveal>
            <Reveal delay={.12}><p>
              Relojes, plumas y sets para empresas, distribuidores,
              reconocimientos e incentivos.
            </p>
            <p>
              Personalización con logotipos, leyendas o nombres en contratapa y
              carátula. Láser, serigrafía o tampografía, según el modelo y sobre
              cotización.
            </p></Reveal>
            <Reveal delay={.2}><ContactActions corporate/>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="button secondary"
              onClick={() => { window.location.href='/cotizador'; }}
            >
              COTIZAR PROYECTO
            </motion.button>
            <a className="button secondary" href="#catalogo" onClick={() => {setSelection('all');setActive('sets');setFilters(initialFilters);setQuery('');}}>VER SETS DISPONIBLES</a>
            <Action
              className="text-link"
              onClick={() => setLead({interest:'Personalización',context:'personalizacion'})}
            >
              SOLICITAR INFORMACIÓN
            </Action></Reveal>
          </div>
        </section>
        {corporateModels.length > 0 && <section className="catalog-section" aria-label="Modelos para proyectos corporativos"><div className="section-intro"><div><p className="kicker">PORTAFOLIO CORPORATIVO</p><h2>Modelos disponibles para proyectos corporativos</h2></div><p className="section-note">Sets y modelos identificados para parejas o proyectos empresariales. Consulta disponibilidad con un asesor.</p></div><div className="product-grid">{corporateModels.map(p=><article className="product-card" key={`corporate-${p.id}`}><Link className="product-open" href={`/productos/${p.slug}`}><div className="product-media"><img src={p.image} alt={`${p.brand} ${p.sku}`} loading="lazy" width="240" height="280"/></div><div className="product-info"><p className="product-brand">{p.brand}</p><h3>{p.sku}</h3><p className="product-description">{p.description}</p><span className="card-cta">VER DETALLES</span></div></Link></article>)}</div></section>}
      </main>
      <footer>
        <div className="footer-brand">
          <img
            src="/brand/montescano.png"
            alt="Montescano"
            width="175"
            height="56"
          />
          <p>Relojería mexicana desde 1998.</p>
          <CommercialCtas onContact={()=>setLead({context:'footer-contacto'})} compact/>
        </div>
        <div>
          <p className="footer-title">COLECCIONES</p>
          {families.slice(1).map(([id, name]) => (
            <a href="#catalogo" key={id} onClick={() => choose(id)}>
              {name}
            </a>
          ))}
        </div>
        <div>
          <p className="footer-title">MONTESCANO</p>
          <a href="#inicio">Inicio</a>
          <a href="#corporativo">Corporativo</a>
          
          <Link href="/saldos">Venta de Saldos</Link>
          <Link href="/privacidad">Información del formulario</Link>
        </div>
        <div className="footer-bottom">Montescano · Catálogo comercial</div>
      </footer>
      <AnimatePresence>
        {quick && (
          <Dialog
            key="quick"
            label={`Detalles de ${quick.sku}`}
            onClose={() => setQuick(null)}
          >
            <div className="quick-view">
              <motion.div className="quick-image" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:SLOW}}>
                <motion.img initial={{scale:reduced?1:.96,y:reduced?0:12}} animate={{scale:1,y:0}} transition={{duration:SLOW,ease:EASE}}
                  src={quick.image}
                  alt={`${quick.brand} ${quick.sku}`}
                  width="350"
                  height="420"
                />
              </motion.div>
              <motion.div className="quick-info" initial={{opacity:0,y:reduced?0:10}} animate={{opacity:1,y:0}} transition={{duration:NORMAL,delay:reduced?0:.1,ease:EASE}}>
                <p className="kicker">{quick.brand}</p>
                <h2>{quick.sku}</h2>
                <p>{quick.description}</p>
                <ProductPrice product={quick}/>
                <dl>
                  {[
                    ["Género", quick.gender],
                    ["Material", quick.material],
                    ["Movimiento", quick.movement],
                    ["Disponibilidad", availabilityLabels[quick.availability]],
                    ...quick.features.map((f) => [f.label, f.value]),
                  ]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                {quick.variants.length > 0 && (
                  <p>
                    Variantes:{" "}
                    {quick.variants.map((v) => (
                      <Link key={v.slug} href={`/productos/${v.slug}`}>
                        {v.sku}{" "}
                      </Link>
                    ))}
                  </p>
                )}
                <ContactActions sku={quick.sku}/>
                <QuoteLink sku={quick.sku}/>
                <Action
                  className="button secondary"
                  onClick={() => {
                    setLead({
                      product: quick,
                      context: `quick-view/${quick.slug}`,
                    });
                    setQuick(null);
                  }}
                >
                  SOLICITAR INFORMACIÓN
                </Action>
                <Link className="text-link" href={`/productos/${quick.slug}`}>
                  VER DETALLE COMPLETO
                </Link>
              </motion.div>
            </div>
          </Dialog>
        )}
        {lead && (
          <Dialog
            key="lead"
            label="Solicitar información"
            onClose={() => setLead(null)}
          >
            <LeadForm
              product={lead.product}
              initialInterest={lead.interest}
              context={lead.context}
            />
          </Dialog>
        )}
        {filterOpen && (
          <Dialog
            key="filters"
            label="Filtros del catálogo"
            sheet
            onClose={() => setFilterOpen(false)}
          >
            <div className="filter-panel">
              <p className="kicker">TU SELECCIÓN</p>
              <h2>Filtrar modelos</h2>
              <label>
                Categoría
                <select
                  value={active}
                  onChange={(e) => setActive(e.target.value)}
                >
                  {families.map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              {(["brand", "gender", "collection", "availability"] as const).map(
                (key) => {
                  const labels = {
                    brand: "Marca",
                    gender: "Género",
                    collection: "Colección",
                    availability: "Disponibilidad pública",
                  };
                  const options =
                    key === "brand"
                      ? [...new Set(products.map((p) => p.brand))]
                      : key === "gender"
                        ? [
                            ...new Set(
                              products
                                .map((p) => normalizedGender(p.gender))
                                .filter(Boolean)
                                .map(x=>['NIÑO','NIÑA','NIÑOS','NIÑAS'].includes(x)?'Niños':x==='DAMA'?'Dama':x==='CABALLERO'?'Caballero':x),
                            ),
                          ]
                        : key === "collection"
                          ? [...new Set(products.flatMap((p) => p.collections))]
                            : Object.keys(availabilityLabels);
                  return (
                    <label key={key}>
                      {labels[key]}
                      <select
                        value={filters[key]}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, [key]: e.target.value }))
                        }
                      >
                        <option value="">Todas las opciones</option>
                        {options.map((o) => (
                          <option key={o} value={o}>
                            {key === "availability"
                              ? availabilityLabels[
                                  o as keyof typeof availabilityLabels
                                ]
                              : o}
                          </option>
                        ))}
                      </select>
                    </label>
                  );
                },
              )}
              <Action
                className="button primary"
                onClick={() => setFilterOpen(false)}
              >
                VER {filtered.length} MODELOS
              </Action>
              <Action className="text-link" onClick={clear}>
                LIMPIAR FILTROS
              </Action>
            </div>
          </Dialog>
        )}
        {menu && (
          <Dialog
            key="menu"
            label="Menú principal"
            sheet
            onClose={() => setMenu(false)}
          >
            <nav className="mobile-nav" aria-label="Menú móvil">
              <div className="mobile-nav-heading">
                <span>MONTESCANO</span>
                <strong>Explorar el catálogo</strong>
                <p>Relojería mexicana · Desde 1998</p>
              </div>
              <a href="#inicio" onClick={() => setMenu(false)}><NavIcon kind="inicio"/> Inicio</a>
              <a className="mobile-nav-catalog" href="#catalogo" onClick={() => {choose('todos');setMenu(false)}}><NavIcon kind="catalog"/> Catálogo octubre 2026</a>
              {families.slice(1).map(([id, name]) => (
                <a key={id} href="#catalogo" onClick={() => choose(id)}><NavIcon kind={id}/>
                  {name === "Kids" ? "Vizanti Kids" : name}
                </a>
              ))}
              <Link className={saldosStyles.mobile} href="/saldos" onClick={() => setMenu(false)}><NavIcon kind="saldos"/> Venta de Saldos</Link>
              <a href="#corporativo" onClick={() => setMenu(false)}><NavIcon kind="corporativo"/> Corporativo</a>
              <div className="mobile-nav-actions"><p>CONTACTO COMERCIAL</p>
                <CommercialCtas onContact={()=>{setMenu(false);setLead({context:"menu-contacto"});}} compact/>
              </div>
            </nav>
          </Dialog>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
