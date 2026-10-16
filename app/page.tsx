import {getCatalog,getSaldos} from '../lib/catalog';
import LuxrioExperience from '../components/LuxrioExperience';

export const dynamic='force-dynamic';

export default async function Home(){
  const [products,saldoProducts]=await Promise.all([getCatalog(),getSaldos()]);
  return <LuxrioExperience products={products} saldoProducts={saldoProducts}/>;
}
