import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

const records=JSON.parse(fs.readFileSync('docs/catalog-1026-public.json','utf8'));
const withheld=['TACB3525','TACB7088','RVTD3751','VKO8217FR','VKO8206AS','VKO8217AF','VKO8206BS','VKL8217'];
assert.equal(records.length,323);
assert.equal(new Set(records.map(p=>p.sku)).size,323);
const sqlQuote=value=>value==null?'null':typeof value==='number'||typeof value==='boolean'?String(value):`'${value.replaceAll("'","''")}'`;
for(const p of records){
  assert.ok(!withheld.includes(p.sku));
  assert.ok(p.price>0 && (p.promo_price===null || p.promo_price>0&&p.promo_price<p.price));
  assert.ok(p.images.length);
  for(const image of p.images){
    const bytes=fs.readFileSync(`public${image.path}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),image.sha256);
  }
}
const productRows=records.map(p=>[p.sku,p.slug,p.brand,p.family,p.description,p.gender,p.availability,p.price,p.promo_price,p.is_new,p.source].map(sqlQuote).join(',')).map(r=>`(${r})`).join(',\n');
const imageRows=records.flatMap(p=>p.images.map((i,n)=>[p.slug,i.path,p.source,i.sha256,`${p.brand} ${p.sku}`,i.width,i.height,n].map(sqlQuote).join(','))).map(r=>`(${r})`).join(',\n');
// Update only supplied SKUs. Absence from a source workbook does not authorize removal.
const sql=`begin;
create temp table october_products(sku text,slug text,brand text,family text,description text,gender text,availability text,price numeric,promo numeric,is_new boolean,source text) on commit drop;
insert into october_products values ${productRows};
update montescano.products set is_public=false,is_featured=false,show_price=false,public_price=null,promo_price=null,updated_at=now() where sku in (${withheld.map(sqlQuote).join(',')});
insert into montescano.products(sku,slug,brand_id,category_id,name,description,gender,availability_status,public_price,promo_price,show_price,is_public,review_status,is_new,source_file)
select s.sku,s.slug,b.id,c.id,s.sku,s.description,s.gender,s.availability,s.price,s.promo,true,true,'approved',s.is_new,s.source
from october_products s join montescano.brands b on b.name=s.brand join montescano.categories c on c.slug=s.family
on conflict(slug) do update set brand_id=excluded.brand_id,category_id=excluded.category_id,description=excluded.description,gender=excluded.gender,availability_status=excluded.availability_status,public_price=excluded.public_price,promo_price=excluded.promo_price,show_price=true,is_public=true,review_status='approved',is_new=excluded.is_new,source_file=excluded.source_file,source_page=null,updated_at=now();
create temp table october_images(slug text,path text,source text,hash text,alt text,width integer,height integer,sort_order integer) on commit drop;
insert into october_images values ${imageRows};
update montescano.product_images i set is_approved=false where i.product_id in (select p.id from montescano.products p join october_products s on p.slug=s.slug);
insert into montescano.product_images(product_id,storage_path,source_file,source_hash,alt_text,width,height,sort_order,is_approved)
select p.id,i.path,i.source,i.hash,i.alt,i.width,i.height,i.sort_order,true from october_images i join montescano.products p on p.slug=i.slug
where not exists(select 1 from montescano.product_images old where old.product_id=p.id and old.storage_path=i.path);
update montescano.product_images i set is_approved=true,sort_order=s.sort_order from october_images s where i.storage_path=s.path;
do $$ begin
if (select count(*) from montescano.products p join october_products s on p.sku=s.sku where p.is_public and p.review_status='approved')<>323 then raise exception 'October import count mismatch'; end if;
end $$;
commit;`;
fs.mkdirSync('.audit/import',{recursive:true});
fs.writeFileSync('.audit/import/october.sql',sql);
console.log(JSON.stringify({products:records.length,images:records.reduce((n,p)=>n+p.images.length,0),promotions:records.filter(p=>p.promo_price!==null).length,new:records.filter(p=>p.is_new).length,sqlBytes:sql.length}));
