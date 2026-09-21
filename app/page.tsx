import {getCatalog} from '../lib/catalog';
import CatalogExperience from '../components/CatalogExperience';
export const dynamic='force-dynamic';
export default async function Home(){return <CatalogExperience products={await getCatalog()}/>}
