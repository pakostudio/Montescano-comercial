// Read one JSON line from stdin; never log credentials or put them in argv.
import {createInterface} from 'node:readline';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const linked=JSON.parse(readFileSync('.vercel/project.json','utf8'));
if(linked.projectId!=='prj_tOY36ayk6FGsE4PLkK6FfUMeIPVF')throw new Error('Wrong linked project');
const input=createInterface({input:process.stdin});
input.once('line',line=>{
 input.close();
 const {key}=JSON.parse(line);
 if(typeof key!=='string'||!key.startsWith('re_'))throw new Error('Invalid credential');
 for(const [name,value] of Object.entries({RESEND_API_KEY:key,RESEND_FROM_EMAIL:'pako@sportcstudio.com',MONTESCANO_LEAD_EMAIL:'pako@sportcstudio.com'})){
  const args=['env','add',name,'production','--yes'];if(name==='RESEND_API_KEY')args.push('--sensitive');
  const result=spawnSync('vercel',args,{input:value,encoding:'utf8'});
  if(result.status!==0){console.error('Configuration failed:',name);process.exit(1);}
  console.log('Configured:',name);
 }
});
