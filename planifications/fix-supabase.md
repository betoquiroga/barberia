# Fix de Supabase

Tarea: [Fix de Supabase](https://app.notion.com/p/3fbc47b73c228055a945dd8aa8e5a178). Prioridad urgente.

## Objetivo

`GET /api/citas` deja de responder `503` y `/citas` deja de mostrar «No se pudo contactar el servicio. Inténtalo de nuevo.». La app habla con el proyecto donde ya están `barberos`, `servicios`, `citas`, `servidores`, `servicios_ofrecidos` y `servicio_ofrecido_servidor`. En ese mismo proyecto existen `clientes` y `horarios_atencion`, que hoy no están.

## Causa

Hay dos proyectos y el código usa el que no tiene el esquema de la barbería.

| | Ref | URL |
| --- | --- | --- |
| Código y `.env` esperados hoy | `gtzbxiiunbehowfayelc` | `https://gtzbxiiunbehowfayelc.supabase.co` |
| Proyecto donde se aplicaron las migraciones de barbería | `krpyyghflgcxhmscvemw` | `https://krpyyghflgcxhmscvemw.supabase.co` |

`lib/supabase/leer-entorno.ts` solo acepta la URL de `gtzbxiiunbehowfayelc`. Con esa URL y una clave de ese proyecto, `leerDiagramaCitas` consulta `public.citas` en un proyecto que no tiene la tabla. El SDK devuelve error y `app/api/citas/route.ts` lo traduce a `503` con `supabase_inalcanzable`. El log `GET /api/citas 503` (application-code ~400–510 ms) y el mensaje rojo de `/citas` salen de ahí. El enlace a `generate-viewport` es el overlay de Next en desarrollo; no hay que cambiar viewport ni `app/layout.tsx`.

En `krpyyghflgcxhmscvemw` (consultado el 2026-10-16):

- Existen `public.barberos` (0 filas), `public.servicios` (3 filas), `public.citas` (0 filas), `public.servidores`, `public.servicios_ofrecidos`, `public.servicio_ofrecido_servidor`. RLS activo. `anon`, `authenticated` y `service_role` tienen `SELECT` sobre `citas`.
- Columnas de `citas`: `id`, `barbero_id`, `servicio_id`, `inicia_en`, `estado`, `creado_en`. Coinciden con el `select("inicia_en, estado")` del repositorio.
- No existen `public.clientes` ni `public.horarios_atencion`.
- `supabase_migrations` tiene `20261016203523 crear_desempeno_barberos` y `20261016205752 crear_servidores_y_servicios_ofrecidos`. No tiene las versiones locales `20261016150000`, `20261016160000`, `20261016170000` ni `20261016180000`.

## Alcance

- Apuntar el cliente de servidor al ref `krpyyghflgcxhmscvemw`.
- Dejar en ese proyecto las tablas `clientes` y `horarios_atencion` con el mismo DDL que los SQL locales que nunca se aplicaron.
- Alinear el historial de migraciones para que un `db push` no vuelva a crear `barberos`, `citas` ni `servidores`.
- Quitar la migración que vacía `clientes`.

## Fuera de alcance

- Pantalla `/citas`, textos, `SelectorMes` y el `fetch` del navegador.
- Contrato JSON de `GET /api/citas`, `GET/POST /api/clientes`, `GET/POST /api/horarios`, desempeño, servidores y servicios ofrecidos.
- Semilla de citas o de barberos. Cero filas en `citas` es un mes vacío (`200`), no un `503`.
- Cambiar RLS, grants o políticas de las tablas que ya existen.
- `generateViewport`, `app/layout.tsx` y el prerender de `/`.
- Librerías nuevas. No instalar nada.

## Suposiciones

- El proyecto vigente es `krpyyghflgcxhmscvemw`, porque ahí están las tablas y las dos migraciones de barbería. `gtzbxiiunbehowfayelc` queda fuera.
- La clave publicable de `krpyyghflgcxhmscvemw` la pone quien implementa en `.env.local`. El plan no incluye el valor. Sirve la publishable key o la anon key de ese proyecto. No se usa `service_role`.
- `20261016203523` y `20261016205752` crearon el mismo esquema que `supabase/migrations/20261016170000_crear_desempeno_barberos.sql` y `supabase/migrations/20261016180000_crear_servidores_y_servicios_ofrecidos.sql`. No se reescriben esos cuatro archivos.
- `supabase/migrations/20261016190000_vaciar_tabla_clientes.sql` no está aplicada y no debe aplicarse. Borrar clientes no arregla `/api/citas`.

## Esquema que falta

Una sola migración nueva, creada con `supabase migration new crear_clientes_y_horarios` (no inventar el timestamp). El SQL es el de estos dos archivos, en este orden, sin el `delete`:

1. `supabase/migrations/20261016150000_crear_tabla_clientes.sql`
2. `supabase/migrations/20261016160000_crear_tabla_horarios_atencion.sql`

### `public.clientes`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `nombre` | `text not null` | check `clientes_nombre_largo`: `char_length(btrim(nombre))` entre 1 y 120 |
| `correo` | `text not null` | check `clientes_correo_minusculas`: `correo = lower(correo)` |
| `telefono` | `text not null` | check `clientes_telefono_largo`: `char_length(btrim(telefono))` entre 7 y 20 |
| `detalle` | `text not null` | `default ''`; check `clientes_detalle_largo`: `char_length(detalle) <= 500` |
| `creado_en` | `timestamptz not null` | `default now()` |
| `actualizado_en` | `timestamptz not null` | `default now()` |

- Índice único `clientes_correo_unico` en `(correo)`.
- Función `public.clientes_marcar_actualizado()` (`plpgsql`, `search_path = ''`) y trigger `clientes_antes_de_actualizar` `before update`.
- RLS activo. Políticas `clientes_anon_select`, `clientes_anon_insert`, `clientes_anon_update`, `clientes_anon_delete` para `anon`, las cuatro con `using (true)` o `with check (true)` según la operación, igual que el SQL de `20261016150000`.

### `public.horarios_atencion`

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | `uuid` PK | `default gen_random_uuid()` |
| `dia` | `text not null` | check `horarios_atencion_dia_valido`: `lunes` … `domingo` (`miercoles`, `sabado` sin tilde) |
| `abre` | `time` | nullable |
| `cierra` | `time` | nullable |
| `cerrado` | `boolean not null` | `default false` |
| `creado_en` | `timestamptz not null` | `default now()` |
| `actualizado_en` | `timestamptz not null` | `default now()` |

- Check `horarios_atencion_horas_coherentes`: cerrado implica `abre` y `cierra` nulos; abierto implica ambas horas y `abre < cierra`.
- Índice único `horarios_atencion_dia_unico` en `(dia)`.
- Función `public.horarios_atencion_marcar_actualizado()` y trigger `horarios_atencion_antes_de_actualizar`.
- RLS activo. Políticas `horarios_atencion_anon_select`, `_insert`, `_update`, `_delete` para `anon`, iguales al SQL de `20261016160000`.

No se agregan columnas a `citas`. No se toca el check `citas_estado_valido` ni el índice `citas_barbero_inicia`.

## Historial de migraciones

Trabajar contra el ref `krpyyghflgcxhmscvemw`.

1. Borrar del repo `supabase/migrations/20261016190000_vaciar_tabla_clientes.sql`. No aplicarlo.
2. Conservar en el repo `20261016150000`, `20261016160000`, `20261016170000` y `20261016180000`.
3. Marcar como ya aplicadas, sin ejecutar su SQL, las versiones locales cuyo esquema ya está en remoto:
   - `20261016170000`
   - `20261016180000`
   Comando: `supabase migration repair --status applied` para cada una, contra ese proyecto. No borrar `20261016203523` ni `20261016205752`.
4. Aplicar la migración nueva de clientes y horarios (`supabase db push` o `apply_migration` con ese SQL). No volver a correr el SQL de barberos, citas ni servidores.
5. No hace falta un segundo push de `20261016150000` y `20261016160000` si la migración nueva ya creó esas tablas. En ese caso, marcar también `20261016150000` y `20261016160000` como applied con `migration repair` para que el historial local no intente crearlas otra vez. El DDL vigente es el de la migración nueva; los dos archivos viejos quedan como copia de referencia y no se editan.

## Código

| Archivo | Cambio |
| --- | --- |
| `lib/supabase/leer-entorno.ts` | `URL_PROYECTO` pasa a `https://krpyyghflgcxhmscvemw.supabase.co`. Si la URL de entorno no es esa, sigue `null` (`entorno_incompleto`). |
| `lib/supabase/comprobar-conexion.ts` | `PROYECTO` pasa a `"krpyyghflgcxhmscvemw"`. |
| `types/supabase-conexion.ts` | `proyecto` del éxito es `"krpyyghflgcxhmscvemw"`. |
| `.env.local` | `NEXT_PUBLIC_SUPABASE_URL=https://krpyyghflgcxhmscvemw.supabase.co` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` de ese proyecto. No se commitea. |

Sin otros cambios de lógica. `app/api/citas/route.ts`, `lib/citas/repositorio-citas-diagrama.ts`, clientes, horarios, desempeño, servidores y servicios ofrecidos siguen llamando a las mismas tablas y columnas.

## Rutas

Ninguna ruta nueva. Ningún método nuevo.

| Ruta | Método | Responsabilidad | Cambio |
| --- | --- | --- | --- |
| `app/api/citas/route.ts` | `GET` | `mes` opcional; `leerDiagramaCitas`; JSON | Sin cambio de archivo. Deja de caer en `503` cuando el proyecto correcto responde. |
| `app/api/supabase/conexion/route.ts` | `GET` | Comprueba entorno y Auth | Sin cambio de archivo. El `200` pasa a `"proyecto": "krpyyghflgcxhmscvemw"` porque el tipo cambió. |
| `app/api/clientes/route.ts` | `GET`, `POST` | Lista y alta de clientes | Sin cambio. Pasan a `200`/`201` cuando exista `public.clientes`. |
| `app/api/clientes/[id]/route.ts` | `GET`, `PATCH`, `DELETE` | Una ficha | Sin cambio. |
| `app/api/horarios/route.ts` | `GET`, `POST` | Lista y alta de horario | Sin cambio. Pasan a `200`/`201` cuando exista `public.horarios_atencion`. |
| `app/api/horarios/[id]/route.ts` | `GET`, `PATCH`, `DELETE` | Un día | Sin cambio. |
| `app/api/desempeno/route.ts` | `GET` | Desempeño del mes | Sin cambio. |
| `app/api/desempeno/[barberoId]/route.ts` | `GET` | Un barbero | Sin cambio. |
| `app/api/servidores/route.ts` y `app/api/servidores/[id]/route.ts` | los que ya tienen | CRUD servidores | Sin cambio. |
| `app/api/servicios-ofrecidos/route.ts` y `app/api/servicios-ofrecidos/[id]/route.ts` | los que ya tienen | CRUD servicios | Sin cambio. |

### Contrato que se mantiene en `GET /api/citas`

Query `mes` opcional (`AAAA-MM`). Sin cuerpo.

| Resultado | Status |
| --- | --- |
| `ok: true` con `mes`, `dias`, `horas`, `horario_pico` | `200` |
| `mes_invalido` | `400` |
| `entorno_incompleto` | `503` |
| `supabase_inalcanzable` | `503` |

Con `citas` vacía el mes actual responde `200`: un elemento de `dias` por cada día, `horas: []`, `horario_pico: null`.

### Contrato que cambia

`GET /api/supabase/conexion` con entorno válido:

```json
{ "ok": true, "proyecto": "krpyyghflgcxhmscvemw" }
```

Errores iguales: `entorno_incompleto`, `credenciales_invalidas`, `supabase_inalcanzable`.

## Criterios de aceptación — migraciones

- En `krpyyghflgcxhmscvemw` existen `public.clientes` y `public.horarios_atencion` con las columnas, checks, índices, triggers, RLS y políticas de arriba.
- `public.citas` conserva columnas, FKs, check, índice y políticas. Sigue en 0 filas si nadie insertó.
- `public.clientes` no se vacía con un `delete` de migración. El archivo `20261016190000_vaciar_tabla_clientes.sql` no está en el repo ni en `schema_migrations`.
- `supabase db push` no intenta crear de nuevo `barberos`, `servicios`, `citas`, `servidores`, `servicios_ofrecidos` ni `servicio_ofrecido_servidor`.
- `20261016203523` y `20261016205752` siguen en el historial remoto.

## Criterios de aceptación — lógica

- `.env.local` usa la URL `https://krpyyghflgcxhmscvemw.supabase.co` y la clave publicable de ese proyecto.
- `GET /api/supabase/conexion` responde `200` y `{ "ok": true, "proyecto": "krpyyghflgcxhmscvemw" }`.
- `GET /api/citas` sin `mes` responde `200` con el mes actual de `America/Lima` y un día por cada día del mes. No responde `503`.
- `GET /api/citas?mes=2026-13` responde `400` y `mes_invalido`.
- `/citas` no muestra «No se pudo contactar el servicio. Inténtalo de nuevo.» cuando la consulta responde `200`.
- `GET /api/clientes` y `GET /api/horarios` responden `200` (lista vacía permitida), no `503` por tabla ausente.
- Una URL distinta de `https://krpyyghflgcxhmscvemw.supabase.co` sigue siendo `entorno_incompleto` y `503`, sin consultar.
