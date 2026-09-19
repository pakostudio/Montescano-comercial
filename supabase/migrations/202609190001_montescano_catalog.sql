create schema if not exists montescano;

create table if not exists montescano.brands (id uuid primary key default gen_random_uuid(), name text not null unique, slug text not null unique, created_at timestamptz not null default now());
create table if not exists montescano.categories (id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique, parent_id uuid references montescano.categories(id), sort_order integer not null default 0);
create table if not exists montescano.products (
 id uuid primary key default gen_random_uuid(), sku text not null, slug text not null unique, brand_id uuid references montescano.brands(id), category_id uuid references montescano.categories(id), name text, description text, gender text, material text, movement text, water_resistance text, availability_status text check (availability_status in ('available','limited','on_request','unavailable')), public_price numeric, show_price boolean not null default false, is_public boolean not null default false, is_featured boolean not null default false, review_status text not null default 'approved' check (review_status in ('approved','pending_review')), source_file text not null, source_page integer, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (brand_id, sku)
);
create table if not exists montescano.product_images (id uuid primary key default gen_random_uuid(), product_id uuid not null references montescano.products(id) on delete cascade, storage_path text not null, source_file text not null, source_page integer, source_hash text, alt_text text, width integer, height integer, view_type text not null default 'catalog', sort_order integer not null default 0, is_approved boolean not null default false);
create table if not exists montescano.product_features (id uuid primary key default gen_random_uuid(), product_id uuid not null references montescano.products(id) on delete cascade, label text not null, value text, source_file text, source_page integer, sort_order integer not null default 0);
create table if not exists montescano.public_references (id uuid primary key default gen_random_uuid(), name text not null, description text, logo_path text, public_reference boolean not null default false);
create table if not exists montescano.leads (id uuid primary key default gen_random_uuid(), name text not null, company text, role text, email text not null, phone text, interest_type text, message text, product_id uuid references montescano.products(id), consent_version text, created_at timestamptz not null default now());

alter table montescano.brands enable row level security;
alter table montescano.categories enable row level security;
alter table montescano.products enable row level security;
alter table montescano.product_images enable row level security;
alter table montescano.product_features enable row level security;
alter table montescano.public_references enable row level security;
alter table montescano.leads enable row level security;

create policy "public approved products" on montescano.products for select to anon, authenticated using (is_public = true and review_status = 'approved');
create policy "public categories" on montescano.categories for select to anon, authenticated using (true);
create policy "public brands" on montescano.brands for select to anon, authenticated using (true);
create policy "public approved images" on montescano.product_images for select to anon, authenticated using (is_approved = true and exists (select 1 from montescano.products p where p.id = product_id and p.is_public = true and p.review_status = 'approved'));
create policy "public approved features" on montescano.product_features for select to anon, authenticated using (exists (select 1 from montescano.products p where p.id = product_id and p.is_public = true and p.review_status = 'approved'));
create policy "public approved references" on montescano.public_references for select to anon, authenticated using (public_reference = true);
revoke all on montescano.leads from anon, authenticated;

grant usage on schema montescano to anon, authenticated;
grant select on montescano.brands, montescano.categories, montescano.products, montescano.product_images, montescano.product_features, montescano.public_references to anon, authenticated;
