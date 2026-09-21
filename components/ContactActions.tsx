'use client';
import {contactLinks} from '../lib/contact';
import {ActionLink} from './MotionUI';
export default function ContactActions({sku,corporate=false,floating=false}:{sku?:string;corporate?:boolean;floating?:boolean}) {
 const links=contactLinks(sku,corporate);
 if(floating)return links.whatsapp?<ActionLink className="floating-contact" href={links.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Contactar por WhatsApp"><span className="contact-symbol" aria-hidden="true">↗</span><span>WhatsApp</span></ActionLink>:null;
 if(!links.whatsapp&&!links.email)return null;
 return <div className="contact-actions">{links.whatsapp&&<ActionLink className="button primary" href={links.whatsapp} target="_blank" rel="noopener noreferrer">WHATSAPP <span aria-hidden="true">↗</span></ActionLink>}{links.email&&<ActionLink className="button secondary" href={links.email}>CORREO <span aria-hidden="true">→</span></ActionLink>}</div>;
}
