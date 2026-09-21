-- Additive changes scoped to Montescano. No service-role key is needed by the app.
alter table montescano.products add constraint published_requires_approval check (not is_public or review_status='approved');
alter table montescano.products add constraint hidden_prices_are_null check (show_price or public_price is null);
alter table montescano.leads add column sku text;
alter table montescano.leads add column brand text;
alter table montescano.leads add column source_context text;
alter table montescano.leads add column request_id uuid unique;
alter table montescano.leads add column client_hash text;
create index montescano_leads_rate on montescano.leads(client_hash,created_at);
create index montescano_products_category on montescano.products(category_id);
create index montescano_images_product on montescano.product_images(product_id);
create index montescano_features_product on montescano.product_features(product_id);
create table montescano.product_variants(id uuid primary key default gen_random_uuid(),product_id uuid not null references montescano.products(id),related_product_id uuid not null references montescano.products(id),label text not null);
create table montescano.commercial_collections(id uuid primary key default gen_random_uuid(),slug text not null unique,name text not null,is_public boolean not null default false);
create table montescano.collection_products(collection_id uuid references montescano.commercial_collections(id),product_id uuid references montescano.products(id),primary key(collection_id,product_id));
create table montescano.corporate_projects(id uuid primary key default gen_random_uuid(),slug text not null unique,title text not null,description text not null,is_public boolean not null default false);
create table montescano.api_config(id boolean primary key default true check(id),lead_token_hash text not null);
alter table montescano.api_config enable row level security;
revoke all on montescano.api_config from public,anon,authenticated;
alter table montescano.product_variants enable row level security;
alter table montescano.commercial_collections enable row level security;
alter table montescano.collection_products enable row level security;
alter table montescano.corporate_projects enable row level security;
create policy published_variants on montescano.product_variants for select to anon,authenticated using(exists(select 1 from montescano.products p where p.id=product_id and p.is_public) and exists(select 1 from montescano.products p where p.id=related_product_id and p.is_public));
create policy published_collections on montescano.commercial_collections for select to anon,authenticated using(is_public);
create policy published_collection_products on montescano.collection_products for select to anon,authenticated using(exists(select 1 from montescano.products p where p.id=product_id and p.is_public) and exists(select 1 from montescano.commercial_collections c where c.id=collection_id and c.is_public));
create policy published_corporate on montescano.corporate_projects for select to anon,authenticated using(is_public);
grant select on montescano.product_variants,montescano.commercial_collections,montescano.collection_products,montescano.corporate_projects to anon,authenticated;

create function public.montescano_catalog() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(item order by item->>'family',item->>'sku'),'[]'::jsonb) from (
 select jsonb_build_object('id',p.id,'sku',p.sku,'slug',p.slug,'brand',b.name,'family',c.slug,'description',p.description,'gender',p.gender,'material',p.material,'movement',p.movement,'water_resistance',p.water_resistance,'availability',coalesce(p.availability_status,'on_request'),
 'image',(select i.storage_path from montescano.product_images i where i.product_id=p.id and i.is_approved order by i.sort_order limit 1),
 'images',coalesce((select jsonb_agg(i.storage_path order by i.sort_order) from montescano.product_images i where i.product_id=p.id and i.is_approved),'[]'::jsonb),
 'features',coalesce((select jsonb_agg(jsonb_build_object('label',f.label,'value',f.value) order by f.sort_order) from montescano.product_features f where f.product_id=p.id),'[]'::jsonb),
 'variants',coalesce((select jsonb_agg(jsonb_build_object('slug',rp.slug,'sku',rp.sku,'label',v.label)) from montescano.product_variants v join montescano.products rp on rp.id=v.related_product_id where v.product_id=p.id),'[]'::jsonb),
 'collections',coalesce((select jsonb_agg(cc.name) from montescano.collection_products cp join montescano.commercial_collections cc on cc.id=cp.collection_id where cp.product_id=p.id),'[]'::jsonb)) item
 from montescano.products p join montescano.brands b on b.id=p.brand_id join montescano.categories c on c.id=p.category_id
 where p.is_public and p.review_status='approved'
 ) q;
$$;
revoke all on function public.montescano_catalog() from public;
grant execute on function public.montescano_catalog() to anon,authenticated;

-- Narrow capability: only the server holding a dedicated token can submit a lead.
-- No read/update/delete endpoint or direct INSERT grants are provided.
create function public.montescano_submit_lead(payload jsonb, server_token text, client_fingerprint text) returns uuid language plpgsql security definer set search_path='' as $$
declare lead_id uuid; req uuid; pid uuid; psku text; pbrand text;
begin
 if server_token is null or not exists(select 1 from montescano.api_config where lead_token_hash=encode(sha256(convert_to(server_token,'UTF8')),'hex')) then raise exception 'Not authorized' using errcode='42501'; end if;
 if length(payload::text)>12000 or length(coalesce(payload->>'name','')) not between 2 and 120 or length(coalesce(payload->>'email',''))>254 or coalesce(payload->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(coalesce(payload->>'message','')) not between 10 and 3000 or coalesce(payload->>'consent','') <> 'true' then raise exception 'Invalid fields' using errcode='22023'; end if;
 if coalesce(payload->>'interest','') not in ('Retail / distribución','Proyecto corporativo','Personalización','Compra por volumen','Otro') then raise exception 'Invalid interest' using errcode='22023'; end if;
 if length(coalesce(client_fingerprint,''))<>64 then raise exception 'Invalid client' using errcode='22023'; end if;
 req=(payload->>'request_id')::uuid;
 if req is null then raise exception 'Missing request id' using errcode='22023'; end if;
 perform pg_advisory_xact_lock(hashtextextended(client_fingerprint,0));
 select id into lead_id from montescano.leads where request_id=req and client_hash=client_fingerprint;
 if found then return lead_id; end if;
 if (select count(*) from montescano.leads where client_hash=client_fingerprint and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many requests' using errcode='P0001'; end if;
 if nullif(payload->>'product_id','') is not null then
  select p.id,p.sku,b.name into pid,psku,pbrand from montescano.products p join montescano.brands b on b.id=p.brand_id where p.id=(payload->>'product_id')::uuid and p.is_public and p.review_status='approved';
  if not found then raise exception 'Invalid product' using errcode='22023'; end if;
 end if;
 insert into montescano.leads(name,company,role,email,phone,interest_type,message,product_id,sku,brand,source_context,consent_version,request_id,client_hash)
 values(trim(payload->>'name'),left(payload->>'company',160),left(payload->>'role',100),lower(trim(payload->>'email')),left(payload->>'phone',40),payload->>'interest',payload->>'message',pid,psku,pbrand,left(payload->>'source_context',200),'contact-2026-09-19',req,client_fingerprint) returning id into lead_id;
 return lead_id;
end;
$$;
revoke all on function public.montescano_submit_lead(jsonb,text,text) from public;
grant execute on function public.montescano_submit_lead(jsonb,text,text) to anon;
