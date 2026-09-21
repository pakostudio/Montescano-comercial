export type Product = {
 id:string; sku:string; slug:string; brand:string; family:string; description:string;
 gender:string|null; material:string|null; movement:string|null; water_resistance:string|null;
 availability:'available'|'limited'|'on_request'|'unavailable'; image:string; images:string[];
 features:{label:string;value:string}[]; variants:{slug:string;sku:string;label:string}[]; collections:string[];
}
export const families = [ ['todos','Todos'],['montescano','Montescano'],['vizanti','Vizanti'],['kids','Kids'],['smart-watch','Smart Watch'],['sets','Sets'],['plumas','Plumas'] ] as const;
export const availabilityLabels = { available:'Disponible',limited:'Disponibilidad limitada',on_request:'Consultar disponibilidad',unavailable:'No disponible' };
export const interests=['Retail / distribución','Proyecto corporativo','Personalización','Compra por volumen','Otro'];
