'use client';
import {useState} from 'react';
import Link from 'next/link';
import Dialog from './Dialog';
import LeadForm from './LeadForm';
import {contactLinks} from '../lib/contact';
import styles from './CommercialCtas.module.css';

export default function CommercialCtas({variant='header',sku,saldo=false,showQuote=true}:{variant?:'header'|'footer'|'detail';sku?:string;saldo?:boolean;showQuote?:boolean}){
 const [open,setOpen]=useState(false);
 const links=contactLinks(sku);
 const quote=sku?`/cotizador?${saldo?'saldo':'sku'}=${encodeURIComponent(sku)}`:'/cotizador';
 return <>
  <div className={`${styles.group} ${styles[variant]}`} aria-label="Opciones de contacto comercial">
   {links.whatsapp&&<a className={styles.whatsapp} href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label={sku?`WhatsApp para preguntar por ${sku}`:'Contactar a Montescano por WhatsApp'}>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.2A8 8 0 1 1 20 11.5Z"/><path d="M9 9.1c.7 2.6 2.3 4.3 5.1 5.5l1.2-1 2 1.2c-.4 1.1-1.2 1.7-2.3 1.6-4-.5-7.7-4.6-8-8.2-.1-.9.7-2 1.4-2.5l1.3 2.2Z"/></svg>
    <span>WHATSAPP</span>
   </a>}
   <button className={styles.contact} type="button" onClick={()=>setOpen(true)} aria-haspopup="dialog" aria-label="Abrir formulario de contacto">
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 6 9 7 9-7"/></svg>
    <span>CONTACTO</span>
   </button>
   {showQuote&&<Link href={quote} className={styles.quote} aria-label={sku?`Solicitar cotización del modelo ${sku}`:'Solicitar cotización'}>
    <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M5 3h11l4 4v14H5z"/><path d="M16 3v5h4M8 12h9M8 16h7"/></svg>
    <span className={styles.quoteFull}>{variant==='detail'?'COTIZAR MODELO':'SOLICITAR COTIZACIÓN'}</span>
    <span className={styles.quoteShort}>COTIZAR</span>
    <b aria-hidden="true">↗</b>
   </Link>}
  </div>
  {open&&<Dialog label={sku?`Solicitar información sobre ${sku}`:'Formulario de contacto comercial'} onClose={()=>setOpen(false)}>
   <div className={styles.dialogContent}>
    <LeadForm context={sku?`contacto-rapido/${sku}`:'contacto-rapido'} initialInterest={sku?'Retail / distribución':'Retail / distribución'}/>
   </div>
  </Dialog>}
 </>;
}
