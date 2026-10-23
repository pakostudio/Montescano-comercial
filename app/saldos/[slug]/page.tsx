import Link from 'next/link';
import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {getSaldos} from '../../../lib/catalog';
import {availabilityLabels} from '../../../lib/catalog-types';
import ProductPrice from '../../../components/ProductPrice';
import ProductGallery from '../../../components/ProductGallery';
import ContactActions from '../../../components/ContactActions';
import CommercialCtas from '../../../components/CommercialCtas';
import QuoteLink from '../../../components/QuoteLink';
import LeadForm from '../../../components/LeadForm';
import {Reveal,ActionLink} from '../../../components/MotionUI';

export const dynamic='force-dynamic';

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const p=(await getSaldos()).find(p=>p.slug===slug);
  if(!p) return {title:'Saldo no encontrado'};
  return {title:`${p.sku} · Venta de Saldos`,description:p.description,alternates:{canonical:`/saldos/${slug}`},openGraph:{title:`${p.sku} · Venta de Saldos`,description:p.description,images:p.image?[{url:p.image}]:[]}};
}

export default async function SaldoDetail({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const p=(await getSaldos()).find(p=>p.slug===slug);
  if(!p) notFound();
  return <>
    <header className="site-header detail-header">
      <Link className="logo" href="/"><img src="/brand/montescano.png" alt="Montescano" width="164" height="53"/></Link>
      <CommercialCtas sku={p.sku} saldo/><Link className="text-link" href="/saldos">← VOLVER A SALDOS</Link>
    </header>
    <main>
      <section className="product-detail">
        <Reveal image className="detail-photo">
          <ProductGallery images={p.images.length?p.images:[p.image]} brand={p.brand} sku={p.sku}/>
        </Reveal>
        <Reveal delay={.08} className="detail-copy">
          <p className="kicker">VENTA DE SALDOS · {p.brand}</p>
          <h1>{p.sku}</h1>
          <p className="detail-description">{p.description}</p>
          <ProductPrice product={p}/>
          <p className="availability">{availabilityLabels[p.availability]}</p>
          <dl>
            {[["Género",p.gender],["Material",p.material],["Movimiento",p.movement],["Resistencia al agua",p.water_resistance],...p.features.map(f=>[f.label,f.value])].filter(([,v])=>v).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <ContactActions sku={p.sku}/>
          <QuoteLink sku={p.sku} saldo/>
          <ActionLink href="#solicitud" className="button secondary">SOLICITAR INFORMACIÓN ↗</ActionLink>
        </Reveal>
      </section>
      <section id="solicitud" className="detail-form"><LeadForm product={p} context={`saldo/${p.slug}`}/></section>
    </main>
    <footer><CommercialCtas sku={p.sku} saldo compact/><Link href="/saldos">Montescano · Venta de Saldos</Link><Link href="/privacidad">Información del formulario</Link></footer>
  </>;
}
