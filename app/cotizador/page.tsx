import {getCatalog,getSaldos} from '../../lib/catalog';
import QuoteWizard from '../../components/QuoteWizard';
import CommercialCtas from '../../components/CommercialCtas';
import type {Metadata} from 'next';
import './quote.css';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Cotizador comercial',alternates:{canonical:'/cotizador'}};

export default async function QuotePage({searchParams}:{searchParams:Promise<{sku?:string;saldo?:string}>}){
  const params=await searchParams;
  const saldo=Boolean(params.saldo);
  // Mantener las fuentes separadas: un saldo sólo se cotiza con modelos de saldos.
  const products=saldo?await getSaldos():await getCatalog();
  const initialProduct=products.find(p=>p.sku===(saldo?params.saldo:params.sku));
  return <>
    <header className="site-header">
      <a className="logo" href="/"><img src="/brand/montescano.png" width="164" height="53" alt="Montescano"/></a>
      <a className="text-link" href={saldo?'/saldos':'/'}>← {saldo?'VOLVER A SALDOS':'VOLVER AL CATÁLOGO'}</a>
      <CommercialCtas showQuote={false}/>
    </header>
    <main><QuoteWizard key={(saldo?'saldo/':'catalogo/')+(initialProduct?.id||'general')} products={products} initialProduct={initialProduct}/></main>
    <footer className="quote-footer"><a href="/">MONTESCANO · CATÁLOGO COMERCIAL</a><CommercialCtas variant="footer" showQuote={false}/></footer>
  </>;
}
