import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots {
  // Un preview jamás debe competir en buscadores con la versión aprobada.
  if(process.env.VERCEL_ENV==='preview')return {rules:{userAgent:'*',disallow:'/'}};
  const base=(process.env.SITE_URL||'https://montescano-catalogo-comercial.vercel.app').replace(/\/$/,'');
  return {rules:{userAgent:'*',allow:'/',disallow:'/api/'},sitemap:`${base}/sitemap.xml`};
}
