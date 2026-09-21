import {createHmac} from 'node:crypto';
import {parseQuote} from '../../../lib/quote';
import {notifyQuote,type QuoteReceipt} from '../../../lib/quote-email';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
 const fail=(error:string,status=400)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
 const {SITE_URL,SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,MONTESCANO_LEAD_TOKEN}=process.env;
 if(!SITE_URL||!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY||!MONTESCANO_LEAD_TOKEN)return fail('El cotizador no está disponible en este momento.',503);
 if(request.headers.get('origin')!==new URL(SITE_URL).origin)return fail('Solicitud no permitida.',403);
 if(!request.headers.get('content-type')?.includes('application/json'))return fail('Formato no válido.',415);
 let input;
 try{
  const reader=request.body?.getReader();if(!reader)return fail('Solicitud vacía.');
  let text='',size=0;const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>18000){await reader.cancel();return fail('Solicitud demasiado larga.',413);}text+=decoder.decode(value,{stream:true});}
  input=JSON.parse(text+decoder.decode());
 }catch{return fail('Solicitud no válida.');}
 let payload;try{payload=parseQuote(input);}catch(e){return fail(e instanceof Error?e.message:'Revisa los datos.');}
 const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')?.split(',')[0]||'local';
 const fingerprint=createHmac('sha256',MONTESCANO_LEAD_TOKEN).update(ip).digest('hex');
 const rpc=(name:string,body:unknown)=>fetch(SUPABASE_URL+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:SUPABASE_PUBLISHABLE_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:AbortSignal.timeout(12000)});
 let receipt:QuoteReceipt;
 try{
  const r=await rpc('montescano_submit_quote',{payload,server_token:MONTESCANO_LEAD_TOKEN,client_fingerprint:fingerprint});
  if(!r.ok){const j=await r.json().catch(()=>({}));if(j.code==='P0001')return fail('Has enviado varias solicitudes. Inténtalo más tarde.',429);if(j.code==='23505')return fail('Esta solicitud ya cambió. Revisa los datos e inténtalo de nuevo.',409);return fail('No pudimos guardar tu solicitud. Inténtalo de nuevo.',503);}
  receipt=await r.json();if(!receipt.id||!receipt.folio)return fail('No pudimos confirmar el registro. Inténtalo de nuevo.',503);
 }catch{return fail('No pudimos conectar. Conservamos tus datos en pantalla para que reintentes.',503);}
 let notifications=false;
 try{notifications=await notifyQuote(receipt,async(audience,result)=>{
  try{const saved=await rpc('montescano_quote_notification',{quote_id:receipt.id,audience,result,server_token:MONTESCANO_LEAD_TOKEN});if(!saved.ok)console.error('quote_notification_status_failed',{folio:receipt.folio,audience});}
  catch{console.error('quote_notification_status_failed',{folio:receipt.folio,audience});}
 });}catch{console.error('quote_notification_failed',{folio:receipt.folio});}
 // Saving succeeded, regardless of email delivery. Never turn this into a lost-lead error.
 return Response.json({ok:true,folio:receipt.folio,notifications},{status:201,headers:{'Cache-Control':'no-store'}});
}
