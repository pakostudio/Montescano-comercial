import type {Metadata} from 'next';
import {getSaldos} from '../../lib/catalog';
import SaldosExperience from '../../components/SaldosExperience';

export const dynamic='force-dynamic';
export const metadata:Metadata={
 title:'Venta de Saldos · Montescano',
 description:'Selección de relojes de saldos Montescano y Vizanti. Modelos reales con precios publicados y disponibilidad sujeta a confirmación.',
 alternates:{canonical:'/saldos'},
};
export default async function SaldosPage(){
 return <SaldosExperience products={await getSaldos()}/>;
}
