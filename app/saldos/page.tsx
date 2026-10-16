import type {Metadata} from 'next';
import {getSaldos} from '../../lib/catalog';
import SaldosExperience from '../../components/SaldosExperience';

export const dynamic='force-dynamic';
export const metadata:Metadata={
  title:'Venta de Saldos · Montescano',
  description:'Selección de modelos en venta de saldos de Montescano y Vizanti.',
  alternates:{canonical:'/saldos'},
};

export default async function SaldosPage(){
  return <SaldosExperience products={await getSaldos()}/>;
}
