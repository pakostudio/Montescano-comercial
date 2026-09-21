'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {motion,AnimatePresence,useReducedMotion} from 'motion/react';
import type {Product} from '../lib/catalog-types';
import {Action,ActionLink} from './MotionUI';
import {corporateContact} from '../lib/contact';
import {budgetTypes,contactPreferences,emptyQuote,personalizationOptions,productInterests,projectTypes,quoteError,type QuoteDraft} from '../lib/quote';

const stepNames=['PROYECTO','PRODUCTOS','NECESIDADES','CONTACTO','REVISAR'];
export default function QuoteWizard({products,initialProduct}:{products:Product[];initialProduct?:Product}){
 const [draft,setDraft]=useState<QuoteDraft>({...emptyQuote,items:initialProduct?[{product_id:initialProduct.id}]:[],source_context:initialProduct?'producto/'+initialProduct.slug:'corporativo',source_page:initialProduct?'/productos/'+initialProduct.slug:'/#corporativo'});
 const [step,setStep]=useState(1),[query,setQuery]=useState(''),[status,setStatus]=useState<'idle'|'loading'|'success'|'error'>('idle'),[error,setError]=useState(''),[receipt,setReceipt]=useState<{folio:string;notifications:boolean}|null>(null);
 const requestId=useRef<string|null>(null),sending=useRef(false),heading=useRef<HTMLHeadingElement>(null),first=useRef(true);
 const reduced=useReducedMotion();
 const selected=products.filter(p=>draft.items.some(i=>i.product_id===p.id));
 const matches=products.filter(p=>(p.sku+' '+p.brand+' '+p.description).toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))).slice(0,12);
 useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'});},[step,reduced,status]);
 function update(p:Partial<QuoteDraft>){setDraft(d=>({...d,...p}));setError('');requestId.current=null;}
 function move(next:number){if(sending.current)return;setError('');setStep(next);}
 function next(){const e=quoteError(draft,step);if(e){setError(e);return;}move(step+1);}
 function toggleProduct(p:Product){const exists=draft.items.some(x=>x.product_id===p.id);if(!exists&&draft.items.length>=20){setError('Puedes seleccionar hasta 20 modelos.');return;}update({items:exists?draft.items.filter(x=>x.product_id!==p.id):[...draft.items,{product_id:p.id}],needs_advice:false});}
 async function submit(){
  if(sending.current)return;
  for(let i=1;i<=4;i++){const e=quoteError(draft,i);if(e){setStep(i);setError(e);return;}}
  sending.current=true;setStatus('loading');setError('');requestId.current??=crypto.randomUUID();
  try{const r=await fetch('/api/cotizador',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...draft,request_id:requestId.current,website:''})});const j=await r.json();if(!r.ok||!j.ok||!j.folio)throw new Error(j.error||'No pudimos registrar tu solicitud. Inténtalo de nuevo.');setReceipt(j);setStatus('success');}
  catch(e){setError(e instanceof Error?e.message:'No pudimos conectar. Inténtalo de nuevo.');setStatus('error');}
  finally{sending.current=false;}
 }
 if(receipt){
  const message=selected.length?'Hola, envié la solicitud '+receipt.folio+' sobre el modelo '+selected.map(p=>p.sku).join(', ')+' para '+draft.approx_quantity+' piezas. Me gustaría continuar la atención por WhatsApp.':'Hola, envié la solicitud de cotización '+receipt.folio+' para '+draft.approx_quantity+' piezas. Me gustaría continuar la atención por WhatsApp.';
  const whatsapp='https://wa.me/'+corporateContact.whatsapp.replace(/\D/g,'')+'?text='+encodeURIComponent(message);
  return <motion.section className="quote-shell quote-success" initial={{opacity:0}} animate={{opacity:1}} role="status"><p className="kicker">SOLICITUD RECIBIDA</p><h1 ref={heading} tabIndex={-1}>{receipt.folio}</h1><p>Tu solicitud fue registrada correctamente.</p><p>Nuestro equipo comercial revisará tu solicitud para continuar con la atención.</p>{!receipt.notifications&&<p>El aviso por correo no pudo completarse. Tu solicitud está guardada; puedes continuar por WhatsApp con tu folio.</p>}<ActionLink className="button primary" href={whatsapp} target="_blank" rel="noopener noreferrer">CONTINUAR POR WHATSAPP <span aria-hidden="true">→</span></ActionLink><Link className="text-link quote-return" href="/">VOLVER AL CATÁLOGO</Link></motion.section>;
 }
 const fields=(entries:{key:keyof QuoteDraft;label:string;type?:string;max?:number;required?:boolean;auto?:string}[])=>entries.map(({key,label,type='text',max=160,required=false,auto})=><label key={key}>{label}{required?' *':''}<input name={key} type={type} value={String(draft[key])} maxLength={max} required={required} autoComplete={auto} onChange={e=>update({[key]:e.target.value})}/></label>);
 const select=(key:'personalization_required'|'budget_type'|'preferred_contact',label:string,options:string[])=><label>{label}<select value={draft[key]} onChange={e=>update({[key]:e.target.value})}>{options.map(x=><option key={x}>{x}</option>)}</select></label>;
 const reviewGroups=[
  {step:1,title:'Proyecto',rows:[['Tipo de proyecto',draft.project_type],['Interés',draft.product_interest.join(', ')]]},
  {step:2,title:'Productos',rows:[['Modelos',selected.map(p=>p.brand+' · '+p.sku).join(', ')||'Necesito asesoría para elegir el modelo'],['Asesoría',draft.needs_advice?'Sí':'No indicada']]},
  {step:3,title:'Necesidades',rows:[['Cantidad aproximada',draft.approx_quantity+' piezas'],['Fecha requerida',draft.required_date||'Por definir'],['Lugar de entrega',draft.delivery_location||'Por definir'],['Personalización',draft.personalization_required],...(draft.personalization_required==='Sí'?[['Descripción',draft.personalization_notes]]:[]),['Presupuesto',draft.budget_type==='Aún no definido'?'Aún no definido':draft.budget_type+' · '+Number(draft.budget_amount).toLocaleString('es-MX',{style:'currency',currency:'MXN'})+' MXN'],['Comentarios',draft.comments||'Sin comentarios']]},
  {step:4,title:'Contacto',rows:[['Nombre',draft.customer_name],['Empresa',draft.company],['Cargo',draft.job_title||'No indicado'],['Correo',draft.email],['WhatsApp',draft.phone],['Preferencia',draft.preferred_contact]]},
 ];
 return <section className="quote-shell">
  <nav className="quote-progress" aria-label="Progreso del cotizador">{stepNames.map((name,i)=><button type="button" key={name} disabled={i+1>step||status==='loading'} onClick={()=>move(i+1)} className={step===i+1?'active':step>i+1?'done':''} aria-current={step===i+1?'step':undefined}><b>0{i+1}</b>{name}{step===i+1&&<motion.i layoutId="quote-progress-indicator" transition={{type:'spring',stiffness:380,damping:34}}/>}</button>)}</nav>
  <form noValidate onSubmit={e=>{e.preventDefault();if(step===5)void submit();else next();}}>
  <fieldset disabled={status==='loading'} className="quote-fieldset">
  <AnimatePresence mode="wait" initial={false}><motion.div key={step} className="quote-step" initial={{opacity:0,x:reduced?0:12}} animate={{opacity:1,x:0}} exit={{opacity:0}} transition={{duration:.2}}>
   <p className="kicker">PASO 0{step} / 05</p>
   <h1 ref={heading} tabIndex={-1}>{['¿Qué tipo de proyecto necesitas?','¿Qué modelos quieres considerar?','Cuéntanos lo esencial del proyecto.','¿Dónde podemos encontrarte?','Tu solicitud'][step-1]}</h1>
   {step===1&&<>
    <div className="quote-options" role="group" aria-label="Tipo de proyecto">{projectTypes.map(x=><Action type="button" aria-pressed={draft.project_type===x} className={draft.project_type===x?'selected':''} onClick={()=>update({project_type:x})} key={x}>{x}</Action>)}</div>
    <h2>¿Qué tipo de producto te interesa?</h2><p className="quote-muted">Puedes seleccionar varias opciones.</p>
    <div className="quote-options compact" role="group" aria-label="Tipos de producto">{productInterests.map(x=><Action type="button" aria-pressed={draft.product_interest.includes(x)} className={draft.product_interest.includes(x)?'selected':''} onClick={()=>update({product_interest:draft.product_interest.includes(x)?draft.product_interest.filter(y=>y!==x):[...draft.product_interest,x]})} key={x}>{x}</Action>)}</div>
   </>}
   {step===2&&<>
    <p className="quote-muted">Puedes continuar sin seleccionar un modelo específico.</p>
    <label className="quote-check"><input type="checkbox" checked={draft.needs_advice} onChange={e=>update({needs_advice:e.target.checked})}/>NECESITO ASESORÍA PARA ELEGIR EL MODELO</label>
    {selected.length>0&&<div className="quote-selected" aria-label="Productos seleccionados"><h2>Tu selección · {selected.length}</h2>{selected.map(p=><div key={p.id}><img src={p.image} alt={p.brand+' '+p.sku} width="54" height="62"/><span>{p.brand} · {p.sku}</span><Action type="button" onClick={()=>toggleProduct(p)} aria-label={'Eliminar '+p.sku}>×</Action></div>)}</div>}
    <label className="quote-search">Buscar SKU, modelo o marca<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Ej. TASAC3521, Vizanti..." /></label>
    <div className="quote-results">{matches.map(p=><Action type="button" aria-pressed={draft.items.some(x=>x.product_id===p.id)} className={draft.items.some(x=>x.product_id===p.id)?'selected':''} onClick={()=>toggleProduct(p)} key={p.id}><img src={p.image} alt="" width="54" height="62"/><span>{p.brand} · {p.sku}</span><b aria-hidden="true">{draft.items.some(x=>x.product_id===p.id)?'✓':'+'}</b></Action>)}</div>
    {matches.length===0&&<p role="status">No encontramos ese modelo. Puedes continuar y solicitar asesoría.</p>}
   </>}
   {step===3&&<div className="quote-fields">
    <label>Cantidad aproximada *<input type="number" inputMode="numeric" min="1" max="2147483647" step="1" required value={draft.approx_quantity} onChange={e=>update({approx_quantity:e.target.value})}/></label>
    {fields([{key:'required_date',label:'Fecha en que necesitas el proyecto',type:'date'},{key:'delivery_location',label:'Ciudad / estado de entrega'}])}
    {select('personalization_required','Personalización',personalizationOptions)}
    {draft.personalization_required==='Sí'&&<label className="wide">Describe brevemente qué deseas personalizar *<textarea required placeholder="Logotipo en contratapa, nombre individual, leyenda, etc." maxLength={800} value={draft.personalization_notes} onChange={e=>update({personalization_notes:e.target.value})}/></label>}
    {select('budget_type','Presupuesto aproximado (opcional)',budgetTypes)}
    {draft.budget_type!=='Aún no definido'&&<label>Monto aproximado MXN *<input type="number" inputMode="decimal" min=".01" step=".01" value={draft.budget_amount} onChange={e=>update({budget_amount:e.target.value})}/></label>}
    <label className="wide">Cuéntanos algo más sobre tu proyecto (opcional)<textarea maxLength={2000} value={draft.comments} onChange={e=>update({comments:e.target.value})}/></label>
   </div>}
   {step===4&&<>
    <div className="quote-fields">{fields([{key:'customer_name',label:'Nombre',required:true,max:120,auto:'name'},{key:'company',label:'Empresa',required:true,auto:'organization'},{key:'email',label:'Correo',type:'email',required:true,max:254,auto:'email'},{key:'phone',label:'Teléfono / WhatsApp',type:'tel',required:true,max:40,auto:'tel'},{key:'job_title',label:'Cargo (opcional)',max:100,auto:'organization-title'}])}{select('preferred_contact','¿Cómo prefieres que te contactemos?',contactPreferences)}</div>
    <label className="quote-consent"><input type="checkbox" required checked={draft.consent} onChange={e=>update({consent:e.target.checked})}/><span>He leído y acepto el <Link href="/privacidad" target="_blank" rel="noopener noreferrer">aviso de privacidad</Link>.</span></label>
   </>}
   {step===5&&<><p className="quote-muted">Revisa los datos antes de enviar. Esta solicitud permite preparar una cotización formal; no confirma precios ni disponibilidad.</p>{reviewGroups.map(group=><section className="quote-review-group" key={group.step}><div className="quote-review-heading"><h2>{group.title}</h2><Action type="button" className="text-link" onClick={()=>move(group.step)} aria-label={'Editar '+group.title}>EDITAR</Action></div><dl className="quote-review">{group.rows.map(([key,value])=><div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section>)}</>}
  </motion.div></AnimatePresence>
  <AnimatePresence>{error&&<motion.p key="error" role="alert" className="form-error" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>{error}</motion.p>}</AnimatePresence>
  <div className="quote-actions">{step>1?<Action type="button" className="text-link" onClick={()=>move(step-1)}>← REGRESAR</Action>:<span/>}<Action type="submit" className="button primary" disabled={status==='loading'}>{status==='loading'?'ENVIANDO...':step===5?'SOLICITAR COTIZACIÓN →':'CONTINUAR →'}</Action></div>
  </fieldset></form>
 </section>;
}
