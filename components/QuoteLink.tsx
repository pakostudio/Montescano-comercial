import Link from 'next/link';
export default function QuoteLink({sku,saldo=false}:{sku:string;saldo?:boolean}){
 return <Link className="button primary quote-model-cta" href={`/cotizador?${saldo?'saldo':'sku'}=${encodeURIComponent(sku)}`} aria-label={`Solicitar cotización del modelo ${sku}`}>COTIZAR ESTE MODELO <span aria-hidden="true">↗</span></Link>;
}
