# Validación backend — fix-supabase

Plan: `planifications/fix-supabase.md`
Proyecto consultado: `https://krpyyghflgcxhmscvemw.supabase.co`

## Migraciones

- Puntaje: **9**
- Veredicto: **aprobado**

Evidencia:

- `supabase/migrations/20261016211402_crear_clientes_y_horarios.sql` concatena, en orden y sin `delete`, el DDL de `20261016150000_crear_tabla_clientes.sql` y `20261016160000_crear_tabla_horarios_atencion.sql`.
- `20261016190000_vaciar_tabla_clientes.sql` no está en el repo ni en `supabase_migrations.schema_migrations`.
- Siguen en el repo `20261016150000`, `20261016160000`, `20261016170000` y `20261016180000`.
- En remoto existen `public.clientes` y `public.horarios_atencion` con las columnas, checks, índices únicos, triggers, RLS y políticas `anon` del plan. Ambas tienen 0 filas.
- `public.citas` conserva `id`, `barbero_id`, `servicio_id`, `inicia_en`, `estado`, `creado_en`, las FKs, `citas_estado_valido` y `citas_barbero_inicia`. Sigue en 0 filas.
- El historial remoto incluye `20261016150000`, `20261016160000`, `20261016170000`, `20261016180000`, `20261016203523`, `20261016205752` y `20261016211402`. Un `db push` de los archivos locales no vuelve a crear barberos, citas ni servidores.
- Observación que baja el puntaje de 10 a 9: el remoto también tiene `20261016211523` (`crear_clientes_y_horarios`), que no está en el repo. No duplica las tablas ni rompe los criterios de aceptación.

## Lógica de negocio

- Puntaje: **9**
- Veredicto: **aprobado**

Evidencia:

- `lib/supabase/leer-entorno.ts` solo acepta `https://krpyyghflgcxhmscvemw.supabase.co`; otra URL sigue en `entorno_incompleto`.
- `lib/supabase/comprobar-conexion.ts` y `types/supabase-conexion.ts` usan el proyecto `krpyyghflgcxhmscvemw`.
- `.env.local` usa esa URL y una clave `anon` cuyo `ref` es ese proyecto. No se commitea.
- `app/api/citas/route.ts` mantiene `200`, `400` (`mes_invalido`) y `503` (`entorno_incompleto` / `supabase_inalcanzable`). El repositorio sigue en `select("inicia_en, estado")` sobre `citas`.
- Clientes y horarios siguen en `clientes` y `horarios_atencion`. No hay rutas ni métodos nuevos.
- `GET /api/supabase/conexion` devuelve el `proyecto` del tipo actualizado cuando el entorno es válido.
- No se ejercieron en esta pasada las respuestas HTTP en vivo (`/api/citas`, `/api/clientes`, `/api/horarios`). El código y el entorno cubren el contrato del plan.
