-- Additive, backward-compatible public catalog fields. No inventory or cost data.
alter table montescano.products add column if not exists promo_price numeric;
alter table montescano.products add column if not exists is_new boolean not null default false;
alter table montescano.products add constraint valid_promo_price check (promo_price is null or (show_price and public_price > promo_price and promo_price > 0));
create or replace function public.montescano_catalog() returns jsonb language sql stable security invoker set search_path='' as $$
 select coalesce(jsonb_agg(item order by item->>'family',item->>'sku'),'[]'::jsonb) from (
 select jsonb_build_object('id',p.id,'sku',p.sku,'slug',p.slug,'brand',b.name,'family',c.slug,'description',p.description,'gender',p.gender,'material',p.material,'movement',p.movement,'water_resistance',p.water_resistance,'availability',coalesce(p.availability_status,'on_request'),
 'price',case when p.show_price then p.public_price end,'promo_price',case when p.show_price then p.promo_price end,'is_new',p.is_new,
 'image',(select i.storage_path from montescano.product_images i where i.product_id=p.id and i.is_approved order by i.sort_order limit 1),
 'images',coalesce((select jsonb_agg(i.storage_path order by i.sort_order) from montescano.product_images i where i.product_id=p.id and i.is_approved),'[]'::jsonb),
 'features',coalesce((select jsonb_agg(jsonb_build_object('label',f.label,'value',f.value) order by f.sort_order) from montescano.product_features f where f.product_id=p.id),'[]'::jsonb),
 'variants',coalesce((select jsonb_agg(jsonb_build_object('slug',rp.slug,'sku',rp.sku,'label',v.label)) from montescano.product_variants v join montescano.products rp on rp.id=v.related_product_id where v.product_id=p.id and rp.is_public and rp.review_status='approved'),'[]'::jsonb),
 'collections',coalesce((select jsonb_agg(cc.name) from montescano.collection_products cp join montescano.commercial_collections cc on cc.id=cp.collection_id where cp.product_id=p.id),'[]'::jsonb)) item
 from montescano.products p join montescano.brands b on b.id=p.brand_id join montescano.categories c on c.id=p.category_id
 where p.is_public and p.review_status='approved'
 ) q;
$$;
revoke all on function public.montescano_catalog() from public;
grant execute on function public.montescano_catalog() to anon,authenticated;
