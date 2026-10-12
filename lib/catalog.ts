import {cache} from 'react';
import type {Product} from './catalog-types';

const order=['montescano','vizanti','kids','smart-watch','sets','plumas'];

async function getCatalogRpc(rpc:string):Promise<Product[]> {
 const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key) throw new Error('Missing catalog configuration');
 const response=await fetch(`${url}/rest/v1/rpc/${rpc}`,{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:'{}',cache:'no-store'});
 if(!response.ok) throw new Error('Catalog unavailable');
 const data=await response.json();
 if(!Array.isArray(data)) throw new Error('Invalid catalog response');
 return data.sort((a:Product,b:Product)=>order.indexOf(a.family)-order.indexOf(b.family)||a.sku.localeCompare(b.sku));
}

export const getCatalog=cache(()=>getCatalogRpc('montescano_catalog'));
export const getSaldos=cache(()=>getCatalogRpc('montescano_saldos'));
