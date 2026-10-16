create table public.horarios_atencion (
  id uuid primary key default gen_random_uuid(),
  dia text not null,
  abre time,
  cierra time,
  cerrado boolean not null default false,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint horarios_atencion_dia_valido check (
    dia in ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
  ),
  constraint horarios_atencion_horas_coherentes check (
    (
      cerrado = true
      and abre is null
      and cierra is null
    )
    or (
      cerrado = false
      and abre is not null
      and cierra is not null
      and abre < cierra
    )
  )
);

create unique index horarios_atencion_dia_unico on public.horarios_atencion (dia);

create or replace function public.horarios_atencion_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger horarios_atencion_antes_de_actualizar
before update on public.horarios_atencion
for each row
execute function public.horarios_atencion_marcar_actualizado();

alter table public.horarios_atencion enable row level security;

create policy horarios_atencion_anon_select
on public.horarios_atencion
for select
to anon
using (true);

create policy horarios_atencion_anon_insert
on public.horarios_atencion
for insert
to anon
with check (true);

create policy horarios_atencion_anon_update
on public.horarios_atencion
for update
to anon
using (true)
with check (true);

create policy horarios_atencion_anon_delete
on public.horarios_atencion
for delete
to anon
using (true);
