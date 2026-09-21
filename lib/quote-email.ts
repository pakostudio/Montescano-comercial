import 'server-only';
import type {QuoteDraft} from './quote';
export type QuoteReceipt=Omit<QuoteDraft,'items'|'approx_quantity'|'budget_amount'>&{id:string;folio:string;created_at:string;approx_quantity:number;budget_amount:number|null;items:{sku:string;brand:string;product_id:string}[];notifications:Record<'seller'|'customer',{status:string;id?:string}>};
type Outcome={status:'accepted'|'failed';id?:string;error?:string};
const esc=(value:string)=>value.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));
const row=(label:string,value:string)=>`<tr><td style="padding:8px 0;color:#777;font-size:12px;text-transform:uppercase;letter-spacing:.08em;vertical-align:top;width:38%;">${esc(label)}</td><td style="padding:8px 0;color:#202020;font-size:14px;line-height:1.45;overflow-wrap:anywhere;word-break:break-word;">${esc(value).replace(/\n/g,'<br>')}</td></tr>`;
function emailHtml(q:QuoteReceipt,audience:'seller'|'customer',models:string){
 const configuredSite=process.env.SITE_URL;
 const site=configuredSite?.startsWith('https://')?configuredSite:'https://montescano-catalogo-comercial.vercel.app';
 const logo=site.replace(/\/$/,'')+'/brand/montescano.png';
 const whatsapp='https://wa.me/525624492892?text='+encodeURIComponent('Hola, quiero continuar con mi solicitud '+q.folio+' de Montescano.');
 const title=audience==='seller'?'Nueva solicitud de cotización':'Recibimos tu solicitud';
 const intro=audience==='seller'?'Un nuevo proyecto requiere atención comercial.':'Gracias por contactar a Montescano. Tu solicitud quedó registrada correctamente.';
 const table=audience==='seller'?[row('Folio',q.folio),row('Fecha',new Date(q.created_at).toLocaleString('es-MX',{timeZone:'America/Mexico_City'})),row('Nombre',q.customer_name),row('Empresa',q.company),row('Cargo',q.job_title||'No indicado'),row('Correo',q.email),row('WhatsApp',q.phone),row('Contacto',q.preferred_contact),row('Proyecto',q.project_type),row('Interés',q.product_interest.join(', ')),row('Productos',models),row('Asesoría',q.needs_advice?'Sí':'No'),row('Cantidad',q.approx_quantity+' piezas'),row('Fecha requerida',q.required_date||'Por definir'),row('Entrega',q.delivery_location||'Por definir'),row('Personalización',q.personalization_required+(q.personalization_notes?' — '+q.personalization_notes:'')),row('Presupuesto',q.budget_type+(q.budget_amount?' · '+q.budget_amount.toLocaleString('es-MX',{style:'currency',currency:'MXN'}):'')),row('Comentarios',q.comments||'Sin comentarios'),row('Origen',q.source_page+' · '+q.source_context)].join(''):[row('Folio',q.folio),row('Proyecto',q.project_type),row('Cantidad',q.approx_quantity+' piezas'),row('Modelos',models)].join('');
 return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f4f1ec;color:#202020;font-family:Arial,Helvetica,sans-serif;"><div style="max-width:680px;margin:0 auto;padding:28px 14px;"><div style="background:#151515;padding:24px 28px;text-align:center;border-radius:12px 12px 0 0;"><img src="${logo}" alt="Montescano" width="180" style="display:inline-block;width:180px;height:auto;max-width:70%;"></div><div style="background:#fff;padding:34px 32px;border-radius:0 0 12px 12px;"><p style="margin:0 0 10px;color:#a17745;font-size:12px;font-weight:bold;letter-spacing:.16em;text-transform:uppercase;">MONTESCANO · RELOJERÍA MEXICANA DESDE 1998</p><h1 style="margin:0 0 14px;font-size:28px;line-height:1.15;font-weight:500;">${title}</h1><p style="margin:0 0 26px;color:#666;font-size:16px;line-height:1.55;">${intro}</p><div style="border:1px solid #e7e0d7;border-radius:10px;padding:8px 18px;margin-bottom:26px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${table}</table></div>${audience==='seller'?'<p style="color:#666;font-size:13px;line-height:1.5;">La solicitud ya está guardada en el sistema. Responde este correo para continuar directamente con el prospecto.</p>':'<p style="color:#666;font-size:14px;line-height:1.55;">Nuestro equipo comercial revisará la información para continuar la atención.</p><a href="'+whatsapp+'" style="display:inline-block;background:#a17745;color:#fff;text-decoration:none;padding:13px 20px;border-radius:5px;font-size:13px;font-weight:bold;letter-spacing:.04em;">CONTINUAR POR WHATSAPP →</a>'}<hr style="border:0;border-top:1px solid #eee;margin:30px 0 18px;"><p style="margin:0;color:#999;font-size:11px;line-height:1.5;">Este mensaje fue enviado automáticamente desde el cotizador comercial de Montescano.</p></div></div></body></html>`;
}
export async function notifyQuote(q:QuoteReceipt,record:(audience:'seller'|'customer',outcome:Outcome)=>Promise<void>):Promise<boolean>{
 const key=process.env.RESEND_API_KEY,from=process.env.RESEND_FROM_EMAIL,to=process.env.MONTESCANO_LEAD_EMAIL;
 const models=q.items.map(p=>p.brand+' · '+p.sku).join('\n')||'Necesita asesoría para elegir el modelo';
 const details=[`Folio: ${q.folio}`,`Fecha: ${new Date(q.created_at).toLocaleString('es-MX',{timeZone:'America/Mexico_City'})}`,'',`Nombre: ${q.customer_name}`,`Empresa: ${q.company}`,`Cargo: ${q.job_title||'No indicado'}`,`Correo: ${q.email}`,`WhatsApp: ${q.phone}`,`Preferencia de contacto: ${q.preferred_contact}`,'',`Tipo de proyecto: ${q.project_type}`,`Interés: ${q.product_interest.join(', ')}`,'Productos:',models,`Asesoría solicitada: ${q.needs_advice?'Sí':'No'}`,'',`Cantidad aproximada: ${q.approx_quantity} piezas`,`Fecha requerida: ${q.required_date||'Por definir'}`,`Lugar de entrega: ${q.delivery_location||'Por definir'}`,`Personalización: ${q.personalization_required}`,q.personalization_notes||'',`Presupuesto: ${q.budget_type}${q.budget_amount?' · '+q.budget_amount.toLocaleString('es-MX',{style:'currency',currency:'MXN'})+' MXN':''}`,'',`Comentarios: ${q.comments||'Sin comentarios'}`,'',`Origen: ${q.source_page} · ${q.source_context}`].join('\n');
 const summary=`Gracias por contactar a Montescano.\n\nHemos recibido tu solicitud de cotización.\n\nFolio: ${q.folio}\n\nResumen:\n${q.project_type}\n${q.approx_quantity} piezas\n${models}\n\nNuestro equipo comercial revisará tu solicitud para continuar con la atención.`;
 const results=await Promise.all((['seller','customer'] as const).map(async audience=>{
  if(q.notifications[audience]?.status==='accepted')return true;
  let outcome:Outcome={status:'failed',error:'not_configured'};
  if(key&&from&&to){
   // Idempotency windows last 24 hours. A stale retry must not create duplicate mail.
   if(Date.now()-Date.parse(q.created_at)>23*60*60*1000){outcome={status:'failed',error:'retry_window_expired'};}
   else{
    const body={from:`Montescano <${from}>`,to:[audience==='seller'?to:q.email],reply_to:audience==='seller'?q.email:to,subject:audience==='seller'?`NUEVA COTIZACIÓN ${q.folio} | ${q.company.replace(/[\r\n]/g,' ')} | ${q.approx_quantity} PIEZAS`:`RECIBIMOS TU SOLICITUD ${q.folio} — MONTESCANO`,html:emailHtml(q,audience,models),text:audience==='seller'?details:summary};
    for(let attempt=0;attempt<3;attempt++){
     try{
      const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','Idempotency-Key':`montescano-quote/${q.id}/${audience}`},body:JSON.stringify(body),signal:AbortSignal.timeout(6000)});
      const response=await r.json().catch(()=>({}));
      if(r.ok&&typeof response.id==='string'){outcome={status:'accepted',id:response.id};break;}
      outcome={status:'failed',error:`provider_${r.status}`};if(r.status<500&&r.status!==429)break;
     }catch{outcome={status:'failed',error:'provider_network'};}
     if(attempt<2)await new Promise(resolve=>setTimeout(resolve,400*2**attempt));
    }
   }
  }
  await record(audience,outcome);
  return outcome.status==='accepted';
 }));return results.every(Boolean);
}
