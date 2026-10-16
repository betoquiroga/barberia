# Validación backend — desempeño mensual de barberos

Plan: `planifications/desempeno-mensual-barberos.md`

## Migraciones

- Puntaje: **10**
- Veredicto: **aprobado**

Evidencia:

- Existe `supabase/migrations/20261016170000_crear_desempeno_barberos.sql`. Las migraciones anteriores (`20261016150000_crear_tabla_clientes.sql`, `20261016160000_crear_tabla_horarios_atencion.sql`) no forman parte de este archivo.
- `public.barberos`: `id uuid` PK `gen_random_uuid()`, `nombre text not null`, `activo boolean not null default true`, `creado_en` y `actualizado_en` `timestamptz not null default now()`. Check `barberos_nombre_largo` (`char_length(btrim(nombre)) between 1 and 120`). Sin índice extra ni correo.
- Trigger solo en `barberos`: función `public.barberos_marcar_actualizado()` `language plpgsql`, `set search_path = ''`, asigna `new.actualizado_en = pg_catalog.now()` y retorna `new`. Trigger `barberos_antes_de_actualizar` `before update` `for each row`.
- `public.servicios`: `id text` PK sin default, `nombre`, `precio_centavos integer not null`, `creado_en`. Checks `servicios_id_valido`, `servicios_nombre_largo` y `servicios_precio_positivo`. Semilla de `corte-clasico` 2500, `arreglo-barba` 1500 y `corte-y-barba` 3500, con los nombres del plan. Sin `actualizado_en`.
- `public.citas`: seis columnas, `estado` default `'programada'`, check `citas_estado_valido`, FK `barbero_id` y `servicio_id` `on delete restrict`, índice `citas_barbero_inicia` sobre `(barbero_id, inicia_en)`. Sin FK a `clientes` y sin `actualizado_en`.
- RLS activo en las tres tablas. `anon` tiene `select`, `insert` y `update` (`using (true)` / `with check (true)`) en `barberos` y `citas`. `servicios` solo `select`. No hay política de `delete`.
- No hay vistas, funciones de agregación ni filas de barberos o citas.

## Lógica de negocio

- Puntaje: **9**
- Veredicto: **aprobado**

Evidencia:

- `types/desempeno.ts` declara `MesDesempeno`, `FilaDesempeno`, `ErrorDesempeno`, `ResultadoDesempeno` y `ResultadoDesempenoBarbero` con los campos y códigos del plan, sin funciones.
- `lib/desempeno/validar-mes.ts` no llama a la red. Cadena vacía o ausente usa el mes actual de `America/Lima`. El query debe ser `/^\d{4}-(0[1-9]|1[0-2])$/`. `9999-12` es `mes_invalido`. `desde` y `hasta` son el día 1 a las 00:00 con desplazamiento `-05:00`, intervalo `[desde, hasta)`.
- `lib/desempeno/repositorio-desempeno.ts` es la única lectura. Usa `leerEntorno` y `crearCliente`. Si el entorno es `null`, devuelve `entorno_incompleto` sin consultar. Lee barberos, citas del intervalo (`gte` / `lt`) y precios. Agrupa en memoria. Cuenta los tres estados. Suma `precio_centavos` solo en `completada` con servicio presente. Ticket con `Math.trunc`; `0` si no hay completadas. Activo sin citas entra con ceros; inactivo solo si tuvo al menos una cita. Orden por `ingresos_centavos` descendente y `nombre` ascendente (`es`). UUID inválido, barbero ausente o inactivo sin citas del mes: `no_encontrado`. Error del SDK: `supabase_inalcanzable`, sin mensaje de Postgres.
- `app/api/desempeno/route.ts` solo hace `GET` y mapea `mes_invalido` a 400 y el resto a 503. `filas` puede ir vacío.
- `app/api/desempeno/[barberoId]/route.ts` solo hace `GET` y mapea 400, 404 y 503. El cuerpo de error es `{ ok: false, error }`.
- No hay `POST`, `PATCH` ni `DELETE`. Este módulo no toca `/api/clientes` ni `/api/horarios`.

Hueco que no baja de 7:

- El detalle compara `barbero_id` con igualdad exacta de texto. Un UUID válido en mayúsculas puede responder 404 aunque la fila exista, porque Postgres devuelve el UUID en minúsculas.
