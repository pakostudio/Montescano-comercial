'use client';
import Link from 'next/link';
import {contactLinks} from '../lib/contact';
import './CommercialCtas.css';
export default function CommercialCtas({onContact,compact=false,sku,saldo=false}:{onContact?:()=>void;compact?:boolean;sku?:string;saldo?:boolean}){
 const wa=contactLinks(sku).whatsapp;
 const quote=`/cotizador${sku?`?${saldo?'saldo':'sku'}=${encodeURIComponent(sku)}`:''}`;
 return <div className={`commercial-ctas ${compact?'commercial-ctas-compact':''}`}>
   {wa&&<a className="commercial-whatsapp" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 9.2c.5 2.9 3 5.4 5.9 5.9l1.6-1.5-2.2-1.2-.9 1c-1.2-.5-2.1-1.4-2.6-2.6l1-1-1.2-2.2Z"/></svg><span>WhatsApp</span></a>}
   {onContact?<button className="commercial-mail" type="button" onClick={onContact}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg><span>Contacto</span></button>:<a className="commercial-mail" href={sku?'#solicitud':'/#contacto'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg><span>Contacto</span></a>}
   <Link className="commercial-quote" href={quote}>Solicitar cotización <span aria-hidden="true">↗</span></Link>
 </div>;
}
