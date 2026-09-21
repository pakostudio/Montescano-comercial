import type {MetadataRoute} from 'next';
import {getCatalog} from '../lib/catalog';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const base=process.env.SITE_URL!;return [{url:base,changeFrequency:'weekly',priority:1},{url:`${base}/privacidad`,priority:.2},...(await getCatalog()).map(p=>({url:`${base}/productos/${p.slug}`,changeFrequency:'weekly' as const,priority:.7}))];}
