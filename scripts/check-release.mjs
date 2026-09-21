import fs from 'node:fs';
import assert from 'node:assert/strict';
const records=JSON.parse(fs.readFileSync('.audit/catalog/records.json','utf8'));
assert.equal(records.length,427);assert.equal(records.filter(p=>p.review_status==='pending_review').length,28);
for(const r of records.filter(r=>r.is_public)){assert.ok(r.image&&fs.existsSync(`public${r.image}`),r.sku);assert.ok(r.source_file&&r.source_page,r.sku);}
for(const name of fs.readdirSync('public',{recursive:true})){assert.ok(!/\.(pdf|xlsx|sql|csv)$/i.test(name),'Original in public');}
assert.ok(!fs.existsSync('public/catalogo'),'Whole source pages must not be published');
console.log('PASS: 427 records, 28 in review, approved asset paths present, originals excluded.');
