export const projectTypes=['Regalo corporativo','Reconocimiento','Incentivo','Evento','Distribución / reventa','Compra por volumen','Otro'];
export const productInterests=['Relojes','Sets','Plumas','Smart Watch','Aún no lo sé / necesito asesoría'];
export const personalizationOptions=['No','Sí','Necesito asesoría'];
export const budgetTypes=['Aún no definido','Tengo presupuesto por pieza','Tengo presupuesto total'];
export const contactPreferences=['WhatsApp','Correo','Indistinto'];
export type QuoteDraft={project_type:string;product_interest:string[];items:{product_id:string}[];needs_advice:boolean;approx_quantity:string;required_date:string;delivery_location:string;personalization_required:string;personalization_notes:string;budget_type:string;budget_amount:string;comments:string;customer_name:string;company:string;job_title:string;email:string;phone:string;preferred_contact:string;consent:boolean;source_page:string;source_context:string};
export const emptyQuote:QuoteDraft={project_type:'',product_interest:[],items:[],needs_advice:false,approx_quantity:'',required_date:'',delivery_location:'',personalization_required:'No',personalization_notes:'',budget_type:'Aún no definido',budget_amount:'',comments:'',customer_name:'',company:'',job_title:'',email:'',phone:'',preferred_contact:'Indistinto',consent:false,source_page:'/cotizador',source_context:'corporativo'};
export const uuidPattern=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function quoteError(q:QuoteDraft,step?:number):string|null{
 if(!step||step===1){if(!projectTypes.includes(q.project_type))return 'Selecciona el tipo de proyecto.';if(!Array.isArray(q.product_interest)||!q.product_interest.length||q.product_interest.length>5||q.product_interest.some(x=>!productInterests.includes(x)))return 'Selecciona al menos un tipo de producto.';}
 if(!step||step===2){if(!Array.isArray(q.items)||q.items.length>20||q.items.some(x=>!x||!uuidPattern.test(x.product_id)))return 'Selecciona hasta 20 modelos del catálogo.';}
 if(!step||step===3){
  if(!/^\d+$/.test(q.approx_quantity)||Number(q.approx_quantity)<1||Number(q.approx_quantity)>2147483647)return 'Indica una cantidad aproximada de piezas válida.';
  if(q.required_date&&(!/^\d{4}-\d{2}-\d{2}$/.test(q.required_date)||!Number.isFinite(Date.parse(q.required_date))||new Date(q.required_date).toISOString().slice(0,10)!==q.required_date))return 'Revisa la fecha requerida.';
  if(!personalizationOptions.includes(q.personalization_required))return 'Indica si necesitas personalización.';
  if(q.personalization_required==='Sí'&&!q.personalization_notes.trim())return 'Describe brevemente la personalización.';
  if(!budgetTypes.includes(q.budget_type))return 'Revisa el tipo de presupuesto.';
  if(q.budget_type!=='Aún no definido'&&(!/^\d+(\.\d{1,2})?$/.test(q.budget_amount)||Number(q.budget_amount)<=0||Number(q.budget_amount)>999999999999))return 'Indica el presupuesto aproximado en MXN.';
 }
 if(!step||step===4){if(q.customer_name.trim().length<2||q.company.trim().length<2)return 'Completa tu nombre y empresa.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q.email))return 'Escribe un correo válido.';if(q.phone.replace(/\D/g,'').length<7||!/^[+\d\s().-]+$/.test(q.phone))return 'Escribe un teléfono o WhatsApp válido.';if(!contactPreferences.includes(q.preferred_contact))return 'Selecciona una preferencia de contacto.';if(q.consent!==true)return 'Acepta el aviso de privacidad para continuar.';}
 return null;
}
export function parseQuote(input:unknown):QuoteDraft&{request_id:string}{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Solicitud no válida.');
 const p=input as Record<string,unknown>;
 const limits:Record<string,number>={project_type:80,approx_quantity:10,required_date:10,delivery_location:160,personalization_required:30,personalization_notes:800,budget_type:40,budget_amount:16,comments:2000,customer_name:120,company:160,job_title:100,email:254,phone:40,preferred_contact:20,source_page:200,source_context:200};
 for(const [key,max]of Object.entries(limits)){if(typeof p[key]!=='string'||p[key].length>max)throw new Error('Revisa los campos del formulario.');p[key]=p[key].trim();}
 if(p.website||typeof p.request_id!=='string'||!uuidPattern.test(p.request_id)||typeof p.needs_advice!=='boolean')throw new Error('Solicitud no válida.');
 const q=p as unknown as QuoteDraft&{request_id:string};const error=quoteError(q);if(error)throw new Error(error);
 const normalized={...emptyQuote,...Object.fromEntries(Object.keys(emptyQuote).map(key=>[key,p[key]])),request_id:q.request_id} as QuoteDraft&{request_id:string};
 normalized.email=normalized.email.toLowerCase();normalized.items=[...new Set(q.items.map(x=>x.product_id))].map(product_id=>({product_id}));
 if(q.personalization_required!=='Sí')normalized.personalization_notes='';if(q.budget_type==='Aún no definido')normalized.budget_amount='';
 return normalized;
}
