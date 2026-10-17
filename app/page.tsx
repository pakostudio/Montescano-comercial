import {getCatalog} from '../lib/catalog';
import CatalogExperience from '../components/CatalogExperience';
import SaldosNavLink from '../components/SaldosNavLink';

export const dynamic='force-dynamic';

export default async function Home(){
  return <><SaldosNavLink/><CatalogExperience products={await getCatalog()}/></>;
}
