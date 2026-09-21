import {createHmac} from 'node:crypto';
import {interests} from '../../../lib/catalog-types';
import {notifyLead} from '../../../lib/lead-email';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
 const fail=(message:string,status=400)=>Response.json({error:message},{status});
 const site=process.env.SITE_URL, url=process.env.SUPABASE_URL,key=process.env.SUPABASE_PUBLISHABLE_KEY,token=process.env.MONTESCANO_LEAD_TOKEN;
 if(!site||!url||!key||!token) return fail('El formulario no está disponible en este momento.',503);
 if(request.headers.get('origin')!==new URL(site).origin) return fail('Solicitud no permitida.',403);
 if(!request.headers.get('content-type')?.includes('application/json')) return fail('Formato no válido.',415);
 const reader=request.body?.getReader();if(!reader)return fail('Solicitud vacía.');
 let text='',size=0;const decoder=new TextDecoder();
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>12000){await reader.cancel();return fail('Mensaje demasiado largo.',413);}text+=decoder.decode(value,{stream:true});}
 let p;try{p=JSON.parse(text);}catch{return fail('Solicitud no válida.');}
 if(!p||typeof p!=='object'||Array.isArray(p))return fail('Solicitud no válida.');
 const lengths:Record<string,[number,number]>={name:[2,120],company:[0,160],role:[0,100],email:[5,254],phone:[0,40],message:[10,3000],source_context:[1,200]};
 for(const [field,[min,max]] of Object.entries(lengths)){if(typeof p[field]!=='string'||p[field].trim().length<min||p[field].length>max)return fail('Revisa los campos del formulario.');}
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)||!interests.includes(p.interest)||p.consent!==true||p.website)return fail('Revisa los datos y autoriza el contacto.');
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(p.request_id))return fail('Solicitud no válida.');
 if(p.product_id&&!/^[0-9a-f-]{36}$/i.test(p.product_id))return fail('Producto no válido.');
 const ip=request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')?.split(',')[0]||'local';
 const fingerprint=createHmac('sha256',token).update(ip).digest('hex');
 try{
 const response=await fetch(`${url}/rest/v1/rpc/montescano_submit_lead`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({payload:p,server_token:token,client_fingerprint:fingerprint}),cache:'no-store'});
 if(!response.ok){const result=await response.json();return fail(result.code==='P0001'?'Has enviado varias solicitudes. Inténtalo más tarde.':'No pudimos guardar tu solicitud. Inténtalo de nuevo.',result.code==='P0001'?429:503);}
 const id=await response.json();
 const notification=await notifyLead(id,p);
 return Response.json({ok:true,id,notification},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{return fail('No pudimos conectar. Inténtalo de nuevo.',503);}
}
