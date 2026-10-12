import Link from 'next/link';
import type {Metadata} from 'next';
import {getSaldos} from '../../lib/catalog';
import {availabilityLabels} from '../../lib/catalog-types';
import ProductPrice from '../../components/ProductPrice';

export const dynamic='force-dynamic';
export const metadata:Metadata={
  title:'Venta de Saldos · Montescano',
  description:'Selección de modelos en venta de saldos de Montescano y Vizanti.',
  alternates:{canonical:'/saldos'},
};

export default async function SaldosPage(){
  const products=await getSaldos();
  return <>
    <header className="site-header detail-header">
      <Link className="logo" href="/" aria-label="Montescano, catálogo comercial">
        <img src="/brand/montescano.png" alt="Montescano" width="164" height="53"/>
      </Link>
      <Link className="text-link" href="/">← CATÁLOGO COMERCIAL</Link>
    </header>
    <main>
      <section className="catalog-section">
        <div className="section-intro">
          <div>
            <p className="kicker">SELECCIÓN ESPECIAL</p>
            <h1>Venta de Saldos</h1>
          </div>
          <p className="section-note">Modelos seleccionados · Octubre 2026.<br/>Precios en MXN. Disponibilidad sujeta a confirmación.</p>
        </div>
        <p className="result-count">{products.length} modelos disponibles para consulta</p>
        <div className="product-grid">
          {products.map(p=><article className="product-card" key={p.id}>
            <Link className="product-open" href={`/saldos/${p.slug}`} aria-label={`Ver saldo ${p.sku}`}>
              <div className="product-media">
                {p.image ? <img src={p.image} alt={`${p.brand} ${p.sku}`} width="240" height="280" loading="lazy"/> : null}
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
              <div className="product-info">
                <p className="product-brand">{p.family==='kids'?'Vizanti Kids':p.brand}</p>
                <h2>{p.sku}</h2>
                <p className="product-description">{p.description}</p>
                <ProductPrice product={p}/>
                <p className="availability">{availabilityLabels[p.availability]}</p>
                <span className="card-cta">VER DETALLES →</span>
              </div>
            </Link>
          </article>)}
        </div>
      </section>
    </main>
    <footer>
      <Link href="/">Montescano · Catálogo comercial</Link>
      <Link href="/privacidad">Información del formulario</Link>
    </footer>
  </>;
}
