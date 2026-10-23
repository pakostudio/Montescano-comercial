'use client';
import Link from 'next/link';
import {useState} from 'react';
import Dialog from './Dialog';
import LeadForm from './LeadForm';
import {contactLinks} from '../lib/contact';
import './CommercialCtas.css';
export default function CommercialCtas({onContact,compact=false,sku,saldo=false}:{onContact?:()=>void;compact?:boolean;sku?:string;saldo?:boolean}){
 const [formOpen,setFormOpen]=useState(false);
 const wa=contactLinks(sku).whatsapp;
 const quote=`/cotizador${sku?`?${saldo?'saldo':'sku'}=${encodeURIComponent(sku)}`:''}`;
 return <div className={`commercial-ctas ${compact?'commercial-ctas-compact':''}`}>
   {wa&&<a className="commercial-whatsapp" href={wa} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-12.5 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 9.2c.5 2.9 3 5.4 5.9 5.9l1.6-1.5-2.2-1.2-.9 1c-1.2-.5-2.1-1.4-2.6-2.6l1-1-1.2-2.2Z"/></svg><span>WhatsApp</span></a>}
   <button className="commercial-mail" type="button" onClick={onContact??(()=>setFormOpen(true))}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 7 9 7 9-7"/></svg><span>Contacto</span></button>
   <Link className="commercial-quote" href={quote} aria-label={sku?`Solicitar cotización del modelo ${sku}`:"Solicitar cotización"}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3.5H6.5A2.5 2.5 0 0 0 4 6v12a2.5 2.5 0 0 0 2.5 2.5h11A2.5 2.5 0 0 0 20 18V9.5L14 3.5Z"/><path d="M14 3.5V9h6M8 13h4M8 17h3"/><path d="m14.5 15.5 1.4 1.4 2.7-2.8"/></svg><span className="commercial-quote-full">Solicitar cotización</span><span className="commercial-quote-short">Cotizar</span></Link>
 {formOpen&&<Dialog label="Solicitar información" onClose={()=>setFormOpen(false)}><LeadForm context={sku?`cta-modelo/${sku}`:'cta-contacto'}/></Dialog>}
 </div>;
}
