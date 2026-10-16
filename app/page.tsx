import {getCatalog} from '../lib/catalog';
import LuxrioExperience from '../components/LuxrioExperience';

export const dynamic='force-dynamic';

export default async function Home(){
  return <LuxrioExperience products={await getCatalog()}/>;
}
