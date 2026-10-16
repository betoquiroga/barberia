alter table public.servicios
  add column descripcion text not null default '';

alter table public.servicios
  add constraint servicios_descripcion_larga check (char_length(descripcion) <= 240);

update public.servicios
set descripcion = case id
  when 'corte-clasico' then 'Corte de cabello con tijera o máquina.'
  when 'arreglo-barba' then 'Perfilado y arreglo de barba.'
  when 'corte-y-barba' then 'Corte de cabello y arreglo de barba en la misma visita.'
end
where id in ('corte-clasico', 'arreglo-barba', 'corte-y-barba');

alter table public.servicios
  alter column descripcion drop default;

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null unique references public.citas (id) on delete restrict,
  monto_centavos integer not null,
  moneda text not null default 'PEN',
  estado text not null default 'pendiente',
  referencia_pasarela text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint pagos_monto_positivo check (monto_centavos > 0),
  constraint pagos_moneda_pen check (moneda = 'PEN'),
  constraint pagos_estado_valido check (estado in ('pendiente', 'pagado', 'fallido')),
  constraint pagos_referencia_larga check (
    referencia_pasarela is null or char_length(btrim(referencia_pasarela)) between 1 and 120
  )
);

create index pagos_estado on public.pagos (estado);

create or replace function public.pagos_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger pagos_antes_de_actualizar
before update on public.pagos
for each row
execute function public.pagos_marcar_actualizado();

alter table public.pagos enable row level security;

create policy pagos_anon_select
on public.pagos
for select
to anon
using (true);

create policy pagos_anon_insert
on public.pagos
for insert
to anon
with check (true);

create policy pagos_anon_update
on public.pagos
for update
to anon
using (true)
with check (true);
