import type {MetadataRoute} from 'next';
import {getCatalog,getSaldos} from '../lib/catalog';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base=process.env.SITE_URL!;
 const [catalog,saldos]=await Promise.all([getCatalog(),getSaldos()]);
 return [
  {url:base,changeFrequency:'weekly',priority:1},
  {url:`${base}/saldos`,changeFrequency:'weekly',priority:.8},
  {url:`${base}/privacidad`,priority:.2},
  ...catalog.map(p=>({url:`${base}/productos/${p.slug}`,changeFrequency:'weekly' as const,priority:.7})),
  ...saldos.map(p=>({url:`${base}/saldos/${p.slug}`,changeFrequency:'weekly' as const,priority:.6})),
 ];
}
