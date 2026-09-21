// Public corporate contacts only. Leave empty until explicitly confirmed by Montescano.
export const corporateContact = {
 whatsapp: process.env.NEXT_PUBLIC_MONTESCANO_WHATSAPP || '525624492892',
 email: process.env.NEXT_PUBLIC_MONTESCANO_EMAIL || 'pako@sportcstudio.com',
};
export function contactLinks(sku?:string, corporate=false) {
 const message=sku?`Hola, me interesa recibir información sobre el modelo ${sku} de Montescano.`:corporate?'Hola, me interesa recibir información sobre proyectos corporativos y personalización Montescano.':'Hola, me interesa recibir información comercial sobre Montescano.';
 const subject=sku?`Información modelo ${sku} — Montescano`:corporate?'Proyecto corporativo — Montescano':'Información comercial Montescano';
 const number=corporateContact.whatsapp.replace(/[\s()+-]/g,'');
 return {
  whatsapp:/^[1-9]\d{7,14}$/.test(number)?`https://wa.me/${number}?text=${encodeURIComponent(message)}`:null,
  email:/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(corporateContact.email)?`mailto:${corporateContact.email}?subject=${encodeURIComponent(subject)}`:null,
 };
}
