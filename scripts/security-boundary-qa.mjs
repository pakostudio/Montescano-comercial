/**
 * Read-only public security smoke tests. This NEVER submits valid leads or quotes.
 * It checks rejected HTTP methods, cross-site origins, body limits and response headers.
 */
import assert from 'node:assert/strict';
const origin=process.env.SECURITY_QA_URL??'https://montescano.vercel.app';
const u=new URL(origin);
assert.equal(u.protocol,'https:','Production security checks require HTTPS');
const checks=[];
async function probe(name,path,opts,expected){
 const res=await fetch(new URL(path,u),{redirect:'manual',cache:'no-store',signal:AbortSignal.timeout(18000),...opts});
 assert.equal(res.status,expected,`${name}: HTTP ${res.status} (expected ${expected})`);
 checks.push({name,status:res.status});
 return res;
}
const main=await probe('Homepage accessible','/',{},200);
const expectHeader=(name)=>assert(main.headers.get(name),`Missing security header: ${name}`);
['x-frame-options','x-content-type-options','referrer-policy','content-security-policy','strict-transport-security'].forEach(expectHeader);
const sec=main.headers.get('content-security-policy')??'';
assert(sec.includes("frame-ancestors 'none'"),'No frame-ancestors protection');
assert(sec.includes("object-src 'none'"),'No object-src restriction');
const json={'content-type':'application/json'};
for(const ep of ['/api/leads','/api/cotizador']){
 const name=ep.endsWith('leads')?'Lead':'Quote';
 await probe(name+' GET blocked',ep,{},405);
 await probe(name+' malicious origin blocked',ep,{method:'POST',headers:{...json,origin:'https://example.net','sec-fetch-site':'cross-site'},body:'{}'},403);
 await probe(name+' absent origin blocked',ep,{method:'POST',headers:json,body:'{}'},403);
 await probe(name+' incorrect media blocked',ep,{method:'POST',headers:{origin:u.origin,'content-type':'text/plain'},body:'{}'},415);
 await probe(name+' invalid JSON blocked',ep,{method:'POST',headers:{...json,origin:u.origin},body:'not-json'},400);
}
await probe('Lead oversized blocked','/api/leads',{method:'POST',headers:{...json,origin:u.origin},body:JSON.stringify({extra:'a'.repeat(13000)})},413);
await probe('Quote oversized blocked','/api/cotizador',{method:'POST',headers:{...json,origin:u.origin},body:JSON.stringify({extra:'a'.repeat(19000)})},413);
console.log('PASS security boundary QA:',checks.length,'probes plus response headers');
checks.forEach(x=>console.log(x.name+': '+x.status));
