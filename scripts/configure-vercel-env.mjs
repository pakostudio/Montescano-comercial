import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
import {spawnSync} from 'node:child_process';
const env=parseEnv(readFileSync('.env.local','utf8'));
env.SITE_URL='https://montescano-catalogo-comercial.vercel.app';
for(const name of ['SUPABASE_URL','SUPABASE_PUBLISHABLE_KEY','MONTESCANO_LEAD_TOKEN','SITE_URL']){
 if(!env[name])throw new Error(`Missing ${name}`);
 const args=['env','add',name,'production','--yes'];
 if(name.includes('KEY')||name.includes('TOKEN'))args.push('--sensitive');
 const r=spawnSync('vercel',args,{input:env[name],encoding:'utf8'});
 if(r.status!==0){console.error(`Failed to configure ${name}: ${r.stderr}`);process.exit(1);}
 console.log(`${name}: configured`);
}
