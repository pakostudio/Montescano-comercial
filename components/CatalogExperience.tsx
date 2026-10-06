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
import QuoteLink from './QuoteLink';
import ProductPrice, {hasPromotion} from './ProductPrice';
import {FAST,NORMAL,SLOW,EASE,SPRING} from '../lib/motion';
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
  const [selection,setSelection]=useState('all');
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
    ['inicio','catalogo','corporativo','contacto'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el);});
    return()=>observer.disconnect();
  }, []);
  useEffect(()=>{const container=tabsRef.current;const selected=container?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');if(container&&selected)container.scrollTo({left:selected.offsetLeft-container.offsetLeft-(container.clientWidth-selected.clientWidth)/2,behavior:reduced?'instant':'smooth'});},[active,reduced]);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const f = p.get("coleccion");
    if (f && families.some(([id]) => id === f)) setActive(f);
    const g = p.get("genero");
    if (g) setFilters((v) => ({ ...v, gender: g }));
  }, []);
  useEffect(() => {
    setVisible(24);
  }, [active, query, filters, selection]);
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (active === "todos" || p.family === active) &&
          (selection === 'all' || (selection === 'new' ? p.is_new : hasPromotion(p))) &&
          (!query ||
            `${p.sku} ${p.brand} ${p.description} ${p.collections.join(" ")}`
              .toLocaleLowerCase("es")
              .includes(query.toLocaleLowerCase("es"))) &&
          (!filters.brand || p.brand === filters.brand) &&
          (!filters.gender || p.gender === filters.gender) &&
          (!filters.collection || p.collections.includes(filters.collection)) &&
          (!filters.availability || p.availability === filters.availability),
      ),
    [products, active, query, filters, selection],
  );
  const filterCount = Object.values(filters).filter(Boolean).length;
  const featuredProduct = products.find((p) => p.sku === "TASAC3521");
  const corporateProduct = products.find((p) => p.family === "sets");
  const clear = () => {
    setSelection('all');
    setFilters(initialFilters);
    setActive("todos");
    setQuery("");
  };
  const choose = (family: string) => {
    setSelection('all');
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
            ["INICIO", "#inicio", "todos"],
            ["MONTESCANO", "#catalogo", "montescano"],
            ["VIZANTI", "#catalogo", "vizanti"],
            ["VIZANTI KIDS", "#catalogo", "kids"],
            ["SMART WATCH", "#catalogo", "smart-watch"],
            ["SETS", "#catalogo", "sets"],
            ["CORPORATIVO", "#corporativo", ""],
            ["CONTACTO", "#contacto", ""],
          ].map(([label, href, family]) => (
            <ActionLink key={label} href={href} aria-current={(section==='catalogo'?active===family&&family!=='todos':href===`#${section}`)?'location':undefined} onClick={() => {setSection(href.slice(1));if(family)choose(family);}}>
              {label}
              {(section==='catalogo'?active===family&&family!=='todos':href===`#${section}`) && (
                <motion.i
                  className="nav-indicator"
                  layoutId="navigation-active"
                  transition={SPRING}
                />
              )}
            </ActionLink>
          ))}
        </nav>
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="header-cta"
          onClick={() => setLead({ context: "header" })}
        >
          SOLICITAR INFORMACIÓN ↗
        </motion.button>
        <Action
          className="menu-toggle"
          onClick={() => setMenu(true)}
          aria-expanded={menu}
          aria-label="Abrir menú"
        >
          <span />
          <span />
        </Action>
      </motion.header>
      <main>
        <CinematicHero product={featuredProduct} />
        <section id="catalogo" className="catalog-section">
          <motion.div {...reveal} className="section-intro">
            <div>
              <p className="kicker">EXPLORA LAS COLECCIONES</p>
              <h2>Encuentra tu próximo modelo.</h2>
            </div>
            <p className="section-note">
              Colecciones actualizadas · Octubre 2026.
              <br />
              Precios en MXN. Disponibilidad sujeta a confirmación.
            </p>
          </motion.div>
          <div className="controls">
            <div className="catalog-selections" aria-label="Selección de productos">
              {([['all','Todos los modelos'],['new','Novedades'],['promo','Promociones']] as const).map(([id,label]) =>
                <button key={id} aria-pressed={selection===id} onClick={()=>setSelection(id)}>{label}</button>)}
            </div>
            <motion.div layoutScroll ref={tabsRef} className="category-tabs" aria-label="Categoría">
              {families.map(([id, name]) => (
                <motion.button
                  key={id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{backgroundColor:'#edf0e8'}}
                  className={active === id ? "active" : ""}
                  onClick={() => setActive(id)}
                  aria-pressed={active === id}
                >
                  <span>{name}</span>
                  <small>
                    {id === "todos"
                      ? products.length
                      : products.filter((p) => p.family === id).length}
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
                      <motion.span variants={{rest:{opacity:0,x:-3},hover:{opacity:1,x:0}}} className="card-arrow" aria-hidden="true">
                        ↗
                      </motion.span>
                    </div>
                    <div className="product-info">
                      <p className="product-brand">
                        {p.family === "kids" ? "Vizanti Kids" : p.brand}
                      </p>
                      <h3>{p.sku}</h3>
                      <p className="product-description">{p.description}</p>
                      <ProductPrice product={p}/>
                      <span className="card-cta">
                        VER DETALLES <motion.span variants={{rest:{x:0},hover:{x:reduced?0:4}}} aria-hidden="true">→</motion.span>
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
                  : p.gender === target,
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
                    <motion.b variants={{rest:{x:0,opacity:.65},hover:{x:reduced?0:3,opacity:1}}} aria-hidden="true">↗</motion.b>
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
              COTIZAR PROYECTO ↗
            </motion.button>
            <Action
              className="text-link"
              onClick={() => setLead({interest:'Personalización',context:'personalizacion'})}
            >
              SOLICITAR INFORMACIÓN →
            </Action></Reveal>
          </div>
        </section>
        <section id="contacto" className="contact-section">
          <Reveal className="contact-copy">
            <p className="kicker">CONTACTO COMERCIAL</p>
            <h2>
              La siguiente conversación
              <br />
              empieza aquí.
            </h2>
            <p>
              Cuéntanos qué estás buscando. Ya sea para tu tienda, tu equipo o
              un proyecto especial, envía tu solicitud al equipo de Montescano.
            </p>
            <ContactActions/>
          </Reveal>
          <Reveal delay={.12}><LeadForm /></Reveal>
        </section>
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
          <ContactActions/>
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
          <a href="#contacto">Contacto</a>
          <Link href="/privacidad">Información del formulario</Link>
        </div>
        <div className="footer-bottom">Montescano · Catálogo comercial</div>
      </footer>
      {section!=='inicio'&&!quick&&!lead&&!filterOpen&&!menu&&<ContactActions floating/>}
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
                  SOLICITAR INFORMACIÓN ↗
                </Action>
                <Link className="text-link" href={`/productos/${quick.slug}`}>
                  VER DETALLE COMPLETO →
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
                                .map((p) => p.gender)
                                .filter((x): x is string => Boolean(x)),
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
                VER {filtered.length} MODELOS →
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
              <a href="#inicio" onClick={() => setMenu(false)}>
                Inicio
              </a>
              {families.slice(1).map(([id, name]) => (
                <a key={id} href="#catalogo" onClick={() => choose(id)}>
                  {name === "Kids" ? "Vizanti Kids" : name}
                </a>
              ))}
              <a href="#corporativo" onClick={() => setMenu(false)}>
                Corporativo
              </a>
              <a href="#contacto" onClick={() => setMenu(false)}>
                Contacto
              </a>
            </nav>
          </Dialog>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
