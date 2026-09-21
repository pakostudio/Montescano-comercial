-- Anonymous visitors submit via the app server's existing narrowly scoped token.
-- Both tables deny direct public access, including reads. No service-role key.
create sequence montescano.quote_folio_seq;
revoke all on sequence montescano.quote_folio_seq from public,anon,authenticated;
create table montescano.quote_requests (
 id uuid primary key default gen_random_uuid(),
 folio text not null unique,
 created_at timestamptz not null default now(),
 status text not null default 'new' check(status in ('new','contacted','quoted','won','lost')),
 project_type text not null check(project_type in ('Regalo corporativo','Reconocimiento','Incentivo','Evento','Distribución / reventa','Compra por volumen','Otro')),
 product_interest text[] not null,
 needs_advice boolean not null default false,
 approx_quantity integer not null check(approx_quantity>0),
 required_date date,delivery_location text,
 personalization_required text not null check(personalization_required in ('No','Sí','Necesito asesoría')),
 personalization_notes text,
 budget_type text not null check(budget_type in ('Aún no definido','Tengo presupuesto por pieza','Tengo presupuesto total')),
 budget_amount numeric(14,2) check(budget_amount>0),
 customer_name text not null,company text not null,job_title text,email text not null,phone text not null,
 preferred_contact text not null check(preferred_contact in ('WhatsApp','Correo','Indistinto')),
 comments text,source_page text not null,source_context text not null,
 consent_version text not null default 'quote-2026-09-20',
 request_id uuid not null unique,client_hash text not null,payload_hash text not null,
 notifications jsonb not null default '{"seller":{"status":"pending"},"customer":{"status":"pending"}}'::jsonb
);
create table montescano.quote_request_items(
 id uuid primary key default gen_random_uuid(),
 quote_request_id uuid not null references montescano.quote_requests(id) on delete cascade,
 product_id uuid not null references montescano.products(id),
 sku text not null,brand text not null,
 unique(quote_request_id,product_id)
);
alter table montescano.quote_requests enable row level security;
alter table montescano.quote_request_items enable row level security;
revoke all on montescano.quote_requests,montescano.quote_request_items from public,anon,authenticated;
create index quote_requests_client on montescano.quote_requests(client_hash,created_at);
create index quote_items_product on montescano.quote_request_items(product_id);

create function public.montescano_submit_quote(payload jsonb,server_token text,client_fingerprint text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare q montescano.quote_requests%rowtype; req uuid; item jsonb; pid uuid; psku text; pbrand text; n text; digest text;
begin
 if server_token is null or not exists(select 1 from montescano.api_config where lead_token_hash=encode(sha256(convert_to(server_token,'UTF8')),'hex')) then raise exception 'Not authorized' using errcode='42501'; end if;
 if payload is null or jsonb_typeof(payload)<>'object' or length(payload::text)>18000 or coalesce(payload->>'consent','')<>'true'
 or length(trim(coalesce(payload->>'customer_name',''))) not between 2 and 120
 or length(trim(coalesce(payload->>'company',''))) not between 2 and 160
 or length(coalesce(payload->>'email',''))>254 or coalesce(payload->>'email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or length(coalesce(payload->>'phone','')) not between 7 and 40
 or coalesce(payload->>'approx_quantity','') !~ '^[0-9]{1,10}$'
 or coalesce(client_fingerprint,'') !~ '^[a-f0-9]{64}$'
 or jsonb_typeof(payload->'items') is distinct from 'array' or jsonb_array_length(payload->'items')>20
 or jsonb_typeof(payload->'product_interest') is distinct from 'array' or jsonb_array_length(payload->'product_interest') not between 1 and 5
 then raise exception 'Invalid fields' using errcode='22023'; end if;
 if exists(select 1 from jsonb_array_elements_text(payload->'product_interest') v where v not in ('Relojes','Sets','Plumas','Smart Watch','Aún no lo sé / necesito asesoría')) then raise exception 'Invalid interests' using errcode='22023'; end if;
 req=(payload->>'request_id')::uuid; if req is null then raise exception 'Missing request id' using errcode='22023'; end if;
 digest=encode(sha256(convert_to((payload-'request_id')::text,'UTF8')),'hex');
 perform pg_advisory_xact_lock(hashtextextended(req::text,1));
 select * into q from montescano.quote_requests where request_id=req;
 if found then
  if q.client_hash<>client_fingerprint or q.payload_hash<>digest then raise exception 'Request conflict' using errcode='23505'; end if;
 else
  perform pg_advisory_xact_lock(hashtextextended(client_fingerprint,0));
  if (select count(*) from montescano.quote_requests where client_hash=client_fingerprint and created_at>now()-interval '1 hour')>=5 then raise exception 'Too many requests' using errcode='P0001'; end if;
  n=nextval('montescano.quote_folio_seq')::text;
  insert into montescano.quote_requests(folio,project_type,product_interest,needs_advice,approx_quantity,required_date,delivery_location,personalization_required,personalization_notes,budget_type,budget_amount,customer_name,company,job_title,email,phone,preferred_contact,comments,source_page,source_context,request_id,client_hash,payload_hash)
  values('COT-'||to_char(now() at time zone 'America/Mexico_City','YYYY')||'-'||lpad(n,greatest(4,length(n)),'0'),payload->>'project_type',array(select jsonb_array_elements_text(payload->'product_interest')),coalesce((payload->>'needs_advice')::boolean,false),(payload->>'approx_quantity')::integer,nullif(payload->>'required_date','')::date,left(payload->>'delivery_location',160),payload->>'personalization_required',left(payload->>'personalization_notes',800),payload->>'budget_type',nullif(payload->>'budget_amount','')::numeric,trim(payload->>'customer_name'),trim(payload->>'company'),left(payload->>'job_title',100),lower(trim(payload->>'email')),payload->>'phone',payload->>'preferred_contact',left(payload->>'comments',2000),left(payload->>'source_page',200),left(payload->>'source_context',200),req,client_fingerprint,digest)
  returning * into q;
  for item in select * from jsonb_array_elements(payload->'items') loop
   pid=(item->>'product_id')::uuid;
   select p.sku,b.name into psku,pbrand from montescano.products p join montescano.brands b on b.id=p.brand_id where p.id=pid and p.is_public and p.review_status='approved';
   if not found then raise exception 'Invalid product' using errcode='22023'; end if;
   insert into montescano.quote_request_items(quote_request_id,product_id,sku,brand) values(q.id,pid,psku,pbrand) on conflict(quote_request_id,product_id) do nothing;
  end loop;
 end if;
 -- Private server response: the HTTP handler returns only folio + notification booleans.
 return (to_jsonb(q)-'client_hash'-'payload_hash'-'request_id')||jsonb_build_object('items',coalesce((select jsonb_agg(jsonb_build_object('product_id',i.product_id,'sku',i.sku,'brand',i.brand) order by i.sku) from montescano.quote_request_items i where i.quote_request_id=q.id),'[]'::jsonb));
end; $$;
revoke all on function public.montescano_submit_quote(jsonb,text,text) from public,anon,authenticated;
grant execute on function public.montescano_submit_quote(jsonb,text,text) to anon;

create function public.montescano_quote_notification(quote_id uuid,audience text,result jsonb,server_token text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if server_token is null or not exists(select 1 from montescano.api_config where lead_token_hash=encode(sha256(convert_to(server_token,'UTF8')),'hex')) then raise exception 'Not authorized' using errcode='42501'; end if;
 if audience not in ('seller','customer') or coalesce(result->>'status','') not in ('accepted','failed') or length(result::text)>1000 then raise exception 'Invalid result' using errcode='22023'; end if;
 update montescano.quote_requests set notifications=jsonb_set(notifications,array[audience],result||jsonb_build_object('updated_at',now()))
 where id=quote_id and coalesce(notifications->audience->>'status','')<>'accepted';
end; $$;
revoke all on function public.montescano_quote_notification(uuid,text,jsonb,text) from public,anon,authenticated;
grant execute on function public.montescano_quote_notification(uuid,text,jsonb,text) to anon;
