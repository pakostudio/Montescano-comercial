-- Separate commercial catalog from saldo products and keep exact inventory private.
alter table montescano.products
  add column if not exists is_saldo boolean not null default false;

create table if not exists montescano.inventory_snapshot (
  product_id uuid primary key references montescano.products(id) on delete cascade,
  sku text not null unique,
  quantity_primary integer,
  quantity_merag integer,
  quantity_sears integer,
  quantity_total integer,
  source_kind text not null check (source_kind in ('catalog','saldo')),
  source_file text not null,
  source_row integer,
  snapshot_date date not null default current_date,
  notes text,
  updated_at timestamptz not null default now(),
  check (quantity_primary is null or quantity_primary >= 0),
  check (quantity_merag is null or quantity_merag >= 0),
  check (quantity_sears is null or quantity_sears >= 0),
  check (quantity_total is null or quantity_total >= 0)
);

alter table montescano.inventory_snapshot enable row level security;
revoke all on table montescano.inventory_snapshot from public,anon,authenticated;
create index if not exists inventory_snapshot_source_kind_idx on montescano.inventory_snapshot(source_kind);

update montescano.products set is_saldo=true where sku in (
 'VSCR337','VSCA337','VSCA349','VADA9809','VAD2303PT','VAD2304TQ','VAD2202AZ','VR5637',
 'VAD2202VD','VADF2202DN','VADF2202GR','VA2208','VAD9377','VAD9376','VAD9378','VSDN348',
 'VSDL2109','VSDR218','VSCA218','VSDT218','VP5894','VN2258','VN5895','VR5700','VSCA8835',
 'VC3315GR','VC3315ND','VC3315AZ','RVR2678','RVA5757','VDP5824','RVR38','RVA2669','RVN5756',
 'RVPD2201','RVPP2202','ASDB7197','WFA03','WF03','TAICB43','TAIDN04','TAIDN09','TAIDB09',
 'TACC2317','TAID67','TAID69','TAID41','TAIB7038A'
);

create or replace function public.montescano_catalog() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(item order by item->>'family',item->>'sku'),'[]'::jsonb) from (
 select jsonb_build_object('id',p.id,'sku',p.sku,'slug',p.slug,'brand',b.name,'family',c.slug,'description',p.description,'gender',p.gender,'material',p.material,'movement',p.movement,'water_resistance',p.water_resistance,'availability',coalesce(p.availability_status,'on_request'),
 'price',case when p.show_price then p.public_price end,'promo_price',case when p.show_price then p.promo_price end,'is_new',p.is_new,'is_saldo',p.is_saldo,
 'image',(select i.storage_path from montescano.product_images i where i.product_id=p.id and i.is_approved order by i.sort_order limit 1),
 'images',coalesce((select jsonb_agg(i.storage_path order by i.sort_order) from montescano.product_images i where i.product_id=p.id and i.is_approved),'[]'::jsonb),
 'features',coalesce((select jsonb_agg(jsonb_build_object('label',f.label,'value',f.value) order by f.sort_order) from montescano.product_features f where f.product_id=p.id),'[]'::jsonb),
 'variants',coalesce((select jsonb_agg(jsonb_build_object('slug',rp.slug,'sku',rp.sku,'label',v.label)) from montescano.product_variants v join montescano.products rp on rp.id=v.related_product_id where v.product_id=p.id and rp.is_public and rp.review_status='approved'),'[]'::jsonb),
 'collections',coalesce((select jsonb_agg(cc.name) from montescano.collection_products cp join montescano.commercial_collections cc on cc.id=cp.collection_id where cp.product_id=p.id),'[]'::jsonb)) item
 from montescano.products p join montescano.brands b on b.id=p.brand_id join montescano.categories c on c.id=p.category_id
 where p.is_public and p.review_status='approved' and not p.is_saldo
 ) q;
$$;
revoke all on function public.montescano_catalog() from public;
grant execute on function public.montescano_catalog() to anon,authenticated;

create or replace function public.montescano_saldos() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(item order by item->>'brand',item->>'sku'),'[]'::jsonb) from (
 select jsonb_build_object('id',p.id,'sku',p.sku,'slug',p.slug,'brand',b.name,'family',c.slug,'description',p.description,'gender',p.gender,'material',p.material,'movement',p.movement,'water_resistance',p.water_resistance,'availability',coalesce(p.availability_status,'on_request'),
 'price',case when p.show_price then p.public_price end,'promo_price',case when p.show_price then p.promo_price end,'is_new',p.is_new,'is_saldo',true,
 'image',(select i.storage_path from montescano.product_images i where i.product_id=p.id and i.is_approved order by i.sort_order limit 1),
 'images',coalesce((select jsonb_agg(i.storage_path order by i.sort_order) from montescano.product_images i where i.product_id=p.id and i.is_approved),'[]'::jsonb),
 'features',coalesce((select jsonb_agg(jsonb_build_object('label',f.label,'value',f.value) order by f.sort_order) from montescano.product_features f where f.product_id=p.id),'[]'::jsonb),
 'variants',coalesce((select jsonb_agg(jsonb_build_object('slug',rp.slug,'sku',rp.sku,'label',v.label)) from montescano.product_variants v join montescano.products rp on rp.id=v.related_product_id where v.product_id=p.id and rp.is_public and rp.review_status='approved'),'[]'::jsonb),
 'collections',coalesce((select jsonb_agg(cc.name) from montescano.collection_products cp join montescano.commercial_collections cc on cc.id=cp.collection_id where cp.product_id=p.id),'[]'::jsonb)) item
 from montescano.products p join montescano.brands b on b.id=p.brand_id join montescano.categories c on c.id=p.category_id
 where p.is_public and p.review_status='approved' and p.is_saldo
 ) q;
$$;
revoke all on function public.montescano_saldos() from public;
grant execute on function public.montescano_saldos() to anon,authenticated;
