import Link from 'next/link';
export default function QuoteLink({sku,saldo=false}:{sku:string;saldo?:boolean}){return <Link className="text-link" href={`/cotizador?${saldo?'saldo':'sku'}=${encodeURIComponent(sku)}`}>AGREGAR A COTIZACIÓN →</Link>;}
