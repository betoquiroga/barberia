create table public.barberos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint barberos_nombre_largo check (char_length(btrim(nombre)) between 1 and 120)
);

create or replace function public.barberos_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger barberos_antes_de_actualizar
before update on public.barberos
for each row
execute function public.barberos_marcar_actualizado();

create table public.servicios (
  id text primary key,
  nombre text not null,
  precio_centavos integer not null,
  creado_en timestamptz not null default now(),
  constraint servicios_id_valido check (
    id in ('corte-clasico', 'arreglo-barba', 'corte-y-barba')
  ),
  constraint servicios_nombre_largo check (char_length(btrim(nombre)) between 1 and 80),
  constraint servicios_precio_positivo check (precio_centavos > 0)
);

insert into public.servicios (id, nombre, precio_centavos)
values
  ('corte-clasico', 'Corte clásico', 2500),
  ('arreglo-barba', 'Arreglo de barba', 1500),
  ('corte-y-barba', 'Corte y barba', 3500);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  barbero_id uuid not null references public.barberos (id) on delete restrict,
  servicio_id text not null references public.servicios (id) on delete restrict,
  inicia_en timestamptz not null,
  estado text not null default 'programada',
  creado_en timestamptz not null default now(),
  constraint citas_estado_valido check (estado in ('programada', 'completada', 'cancelada'))
);

create index citas_barbero_inicia on public.citas (barbero_id, inicia_en);

alter table public.barberos enable row level security;
alter table public.servicios enable row level security;
alter table public.citas enable row level security;

create policy barberos_anon_select
on public.barberos
for select
to anon
using (true);

create policy barberos_anon_insert
on public.barberos
for insert
to anon
with check (true);

create policy barberos_anon_update
on public.barberos
for update
to anon
using (true)
with check (true);

create policy citas_anon_select
on public.citas
for select
to anon
using (true);

create policy citas_anon_insert
on public.citas
for insert
to anon
with check (true);

create policy citas_anon_update
on public.citas
for update
to anon
using (true)
with check (true);

create policy servicios_anon_select
on public.servicios
for select
to anon
using (true);
