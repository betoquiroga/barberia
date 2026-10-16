alter table public.citas
  alter column barbero_id drop not null;

alter table public.citas
  add column nombre text not null,
  add column correo text not null,
  add column telefono text not null,
  add column nota text not null default '';

alter table public.citas
  add constraint citas_nombre_largo check (char_length(btrim(nombre)) between 1 and 120),
  add constraint citas_telefono_largo check (char_length(btrim(telefono)) between 7 and 20),
  add constraint citas_nota_larga check (char_length(nota) <= 300),
  add constraint citas_correo_minusculas check (correo = lower(correo)),
  add constraint citas_correo_forma check (correo ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

create index citas_correo on public.citas (correo);
