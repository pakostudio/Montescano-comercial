import {getCatalog} from '../../lib/catalog';
import QuoteWizard from '../../components/QuoteWizard';
import type {Metadata} from 'next';
import './quote.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Cotizador comercial',alternates:{canonical:'/cotizador'}};
export default async function QuotePage({searchParams}:{searchParams:Promise<{sku?:string}>}){const [products,params]=await Promise.all([getCatalog(),searchParams]);const initialProduct=products.find(p=>p.sku===params.sku);return <><header className="site-header"><a className="logo" href="/"><img src="/brand/montescano.png" width="164" height="53" alt="Montescano"/></a><a className="text-link" href="/">← VOLVER AL CATÁLOGO</a></header><main><QuoteWizard key={initialProduct?.id||'general'} products={products} initialProduct={initialProduct}/></main></>}
