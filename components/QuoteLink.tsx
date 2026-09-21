import Link from 'next/link';
export default function QuoteLink({sku}:{sku:string}){return <Link className="text-link" href={`/cotizador?sku=${encodeURIComponent(sku)}`}>AGREGAR A COTIZACIÓN →</Link>;}
