import 'server-only';
import {getCatalog} from './catalog';
type LeadNotice={name:string;company:string;role:string;email:string;phone:string;interest:string;message:string;source_context:string;product_id?:string};
export async function notifyLead(id:string,p:LeadNotice):Promise<boolean>{
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL,to=process.env.MONTESCANO_LEAD_EMAIL;
 if(!key||!from||!to){console.error('montescano_email_not_configured',{leadId:id});return false;}
 let sku='Consulta general';
 if(p.product_id){try{sku=(await getCatalog()).find(product=>product.id===p.product_id)?.sku||'Consulta de producto';}catch{sku='Consulta de producto';}}
 const body={from:`Montescano — catálogo <${from}>`,to:[to],reply_to:p.email,subject:`Montescano · solicitud comercial · ${sku}`,text:[`Nueva solicitud del catálogo Montescano`,`Referencia: ${id}`,`Modelo: ${sku}`,`Nombre: ${p.name}`,`Empresa: ${p.company||'No indicada'}`,`Cargo: ${p.role||'No indicado'}`,`Email: ${p.email}`,`Teléfono: ${p.phone||'No indicado'}`,`Interés: ${p.interest}`,`Origen: ${p.source_context}`,'',p.message,'','Solicitud guardada en el registro privado. El visitante autorizó contacto para atenderla.'].join('\n')};
 for(let attempt=0;attempt<3;attempt++){
  try{
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`montescano-lead/${id}`},body:JSON.stringify(body),signal:AbortSignal.timeout(6500)});
   if(r.ok){console.info('montescano_email_accepted',{leadId:id});return true;}
   if(r.status<500&&r.status!==429){console.error('montescano_email_rejected',{leadId:id,status:r.status});return false;}
  }catch{ /* Same idempotency key prevents duplicate deliveries on network retry. */ }
  if(attempt<2)await new Promise(resolve=>setTimeout(resolve,400*2**attempt));
 }
 console.error('montescano_email_failed',{leadId:id});return false;
}
