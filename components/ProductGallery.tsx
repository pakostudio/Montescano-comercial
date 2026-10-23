'use client';
import {useRef,useState} from 'react';
import styles from './ProductGallery.module.css';

export default function ProductGallery({images,brand,sku}:{images:string[];brand:string;sku:string}){
 const photos=[...new Set(images.filter(Boolean))];
 const [active,setActive]=useState(0);
 const modal=useRef<HTMLDialogElement>(null);
 if(!photos.length)return <div className={styles.empty}>Fotografía en actualización.</div>;
 const label=`${brand} ${sku}`;
 return <div className={styles.gallery}>
  <button type="button" className={styles.main} aria-label={`Ampliar fotografía ${active+1} de ${photos.length} del modelo ${sku}`} onClick={()=>modal.current?.showModal()}>
   <img src={photos[active]} alt={`${label}, fotografía ${active+1}`} width="600" height="700" loading="eager" onLoad={e=>{e.currentTarget.style.maxWidth=`${e.currentTarget.naturalWidth}px`;}}/>
   <span className={styles.zoom}>AMPLIAR ↗</span>
  </button>
  {photos.length>1&&<div className={styles.thumbs} role="group" aria-label={`Fotografías de ${sku}`}>
   {photos.map((src,i)=><button key={src} type="button" aria-pressed={active===i} aria-label={`Ver fotografía ${i+1}`} onClick={()=>setActive(i)}>
    <img src={src} alt="" width="70" height="76" loading="lazy"/>
   </button>)}
  </div>}
  <p className={styles.caption}>FOTOGRAFÍAS REALES DEL CATÁLOGO · {sku}</p>
  <dialog ref={modal} className={styles.modal} aria-label={`Vista ampliada: ${label}`} onClick={e=>{if(e.target===e.currentTarget)modal.current?.close();}}>
   <button type="button" className={styles.close} onClick={()=>modal.current?.close()}>CERRAR ×</button>
   <img src={photos[active]} alt={`Vista ampliada de ${label}, fotografía ${active+1}`} width="950" height="1100" onLoad={e=>{e.currentTarget.style.maxWidth=`${e.currentTarget.naturalWidth}px`;}}/>
  </dialog>
 </div>;
}
