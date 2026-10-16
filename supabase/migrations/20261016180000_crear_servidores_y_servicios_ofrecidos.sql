create table public.servidores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text not null default '',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint servidores_nombre_largo check (char_length(btrim(nombre)) between 1 and 120),
  constraint servidores_telefono_largo check (char_length(telefono) <= 20)
);

create or replace function public.servidores_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger servidores_antes_de_actualizar
before update on public.servidores
for each row
execute function public.servidores_marcar_actualizado();

alter table public.servidores enable row level security;

create policy servidores_anon_select
on public.servidores
for select
to anon
using (true);

create policy servidores_anon_insert
on public.servidores
for insert
to anon
with check (true);

create policy servidores_anon_update
on public.servidores
for update
to anon
using (true)
with check (true);

create policy servidores_anon_delete
on public.servidores
for delete
to anon
using (true);

create table public.servicios_ofrecidos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio_pesos integer not null,
  costo_pesos integer not null,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint servicios_ofrecidos_nombre_largo check (char_length(btrim(nombre)) between 1 and 80),
  constraint servicios_ofrecidos_precio_positivo check (precio_pesos > 0),
  constraint servicios_ofrecidos_costo_positivo check (costo_pesos > 0),
  constraint servicios_ofrecidos_precio_cubre_costo check (precio_pesos >= costo_pesos)
);

create unique index servicios_ofrecidos_nombre_unico
on public.servicios_ofrecidos (lower(btrim(nombre)));

create or replace function public.servicios_ofrecidos_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger servicios_ofrecidos_antes_de_actualizar
before update on public.servicios_ofrecidos
for each row
execute function public.servicios_ofrecidos_marcar_actualizado();

alter table public.servicios_ofrecidos enable row level security;

create policy servicios_ofrecidos_anon_select
on public.servicios_ofrecidos
for select
to anon
using (true);

create policy servicios_ofrecidos_anon_insert
on public.servicios_ofrecidos
for insert
to anon
with check (true);

create policy servicios_ofrecidos_anon_update
on public.servicios_ofrecidos
for update
to anon
using (true)
with check (true);

create policy servicios_ofrecidos_anon_delete
on public.servicios_ofrecidos
for delete
to anon
using (true);

create table public.servicio_ofrecido_servidor (
  servicio_ofrecido_id uuid not null references public.servicios_ofrecidos (id) on delete cascade,
  servidor_id uuid not null references public.servidores (id) on delete cascade,
  primary key (servicio_ofrecido_id, servidor_id)
);

create index servicio_ofrecido_servidor_servidor
on public.servicio_ofrecido_servidor (servidor_id);

alter table public.servicio_ofrecido_servidor enable row level security;

create policy servicio_ofrecido_servidor_anon_select
on public.servicio_ofrecido_servidor
for select
to anon
using (true);

create policy servicio_ofrecido_servidor_anon_insert
on public.servicio_ofrecido_servidor
for insert
to anon
with check (true);

create policy servicio_ofrecido_servidor_anon_update
on public.servicio_ofrecido_servidor
for update
to anon
using (true)
with check (true);

create policy servicio_ofrecido_servidor_anon_delete
on public.servicio_ofrecido_servidor
for delete
to anon
using (true);

insert into public.servicios_ofrecidos (nombre, precio_pesos, costo_pesos)
values ('Corte de cabello', 15000, 5000);
