# CRUD de servidores y servicios con precio y costo

## Objetivo

Persistir personas que prestan un servicio (`servidores`) y servicios con precio y costo en pesos, y permitir que un servicio quede asociado a uno o varios servidores. Exponer alta, listado, lectura, actualización y baja por `app/api`.

## Alcance

- Tabla `public.servidores`.
- Tabla `public.servicios_ofrecidos` con precio y costo en pesos enteros.
- Tabla puente `public.servicio_ofrecido_servidor`.
- Semilla «Corte de cabello»: costo 5000, precio 15000.
- Tipos, validación y acceso a datos fuera del handler HTTP.
- Diez operaciones HTTP: cinco en `/api/servidores` y cinco en `/api/servicios-ofrecidos`.

## Fuera de alcance

- Pantallas, hooks y llamadas desde el navegador.
- Auth, `service_role`, cookies, `@supabase/ssr` y dependencias nuevas.
- Cambios a `public.barberos`, `public.servicios`, `public.citas`, `public.clientes`, `public.horarios_atencion` y a sus rutas.
- `lib/landing/servicios.ts` y `types/servicio.ts` (catálogo fijo de la landing).
- `GET /api/supabase/conexion` y el módulo de desempeño.

## Estado actual

- Cliente Supabase: `lib/supabase/leer-entorno.ts` y `lib/supabase/crear-cliente.ts`. Clave publicable, sin sesión. `@supabase/supabase-js` ya está instalado.
- `public.servicios` (`supabase/migrations/20261016170000_crear_desempeno_barberos.sql`) es el catálogo de citas: `id` texto limitado a `corte-clasico`, `arreglo-barba` y `corte-y-barba`, `precio_centavos`, solo política `select` para `anon`. `public.citas.servicio_id` apunta a esa tabla.
- `public.barberos` es el personal del desempeño y de las citas. No es el módulo de servidores de este requerimiento.
- No existen rutas `app/api/servidores` ni `app/api/servicios-ofrecidos`.
- El CRUD de clientes (`app/api/clientes`, `lib/clientes`, `types/cliente.ts`) es el patrón a copiar: el handler solo lee el cuerpo y traduce el código de error a status.

## Suposiciones

- «Servidor» es una persona, no un proceso ni un host. No se reutiliza `barberos` para no mezclar desempeño y citas con este módulo.
- No se altera `public.servicios`: otro nombre de tabla y de ruta evita romper las citas y el catálogo de la landing.
- Un servicio puede tener cero o varios servidores. Un servidor puede estar en varios servicios. La lista viaja en el cuerpo del servicio; no hay ruta aparte para el puente.
- Precio y costo son pesos enteros (5000 y 15000), no centavos. `precio_pesos` debe ser mayor o igual que `costo_pesos`. Ambos mayores que 0.
- El nombre del servicio es único sin distinguir mayúsculas, ya recortado.
- El borrado es físico. Borrar un servicio o un servidor borra solo las filas del puente. No borra al otro lado.
- No hay login. RLS permite al rol `anon` leer y escribir estas tres tablas, igual que `clientes`.
- `actualizado_en` lo mantiene la base en `UPDATE` de servidores y de servicios. El puente no tiene esa columna.
- El `PATCH` reemplaza el recurso completo, incluida la lista de servidores.
- La semilla inserta el corte sin servidores, porque aún no hay personas.

## Migración

Un solo archivo:

`supabase/migrations/20261016180000_crear_servidores_y_servicios_ofrecidos.sql`

### Tabla `public.servidores`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `nombre` | `text` | `not null`, `char_length(btrim(nombre)) between 1 and 120` |
| `telefono` | `text` | `not null`, `default ''`, `char_length(telefono) <= 20` |
| `activo` | `boolean` | `not null`, `default true` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |
| `actualizado_en` | `timestamptz` | `not null`, `default now()` |

Checks: `servidores_nombre_largo`, `servidores_telefono_largo`.

Sin índice único. Dos personas pueden llamarse igual.

### Tabla `public.servicios_ofrecidos`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `nombre` | `text` | `not null`, `char_length(btrim(nombre)) between 1 and 80` |
| `precio_pesos` | `integer` | `not null`, `> 0` |
| `costo_pesos` | `integer` | `not null`, `> 0` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |
| `actualizado_en` | `timestamptz` | `not null`, `default now()` |

Checks: `servicios_ofrecidos_nombre_largo`, `servicios_ofrecidos_precio_positivo`, `servicios_ofrecidos_costo_positivo`, `servicios_ofrecidos_precio_cubre_costo` (`precio_pesos >= costo_pesos`).

Índice único `servicios_ofrecidos_nombre_unico` sobre `(lower(btrim(nombre)))`.

### Tabla `public.servicio_ofrecido_servidor`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `servicio_ofrecido_id` | `uuid` | `not null`, FK a `public.servicios_ofrecidos (id)` `on delete cascade` |
| `servidor_id` | `uuid` | `not null`, FK a `public.servidores (id)` `on delete cascade` |

PK compuesta `(servicio_ofrecido_id, servidor_id)`.

Índice `servicio_ofrecido_servidor_servidor` sobre `(servidor_id)`.

### Semilla

```sql
insert into public.servicios_ofrecidos (nombre, precio_pesos, costo_pesos)
values ('Corte de cabello', 15000, 5000);
```

### Triggers

Reutilizar el mismo cuerpo que `clientes_marcar_actualizado`: `before update`, `new.actualizado_en = pg_catalog.now()`, `search_path = ''`.

- Función `public.servidores_marcar_actualizado`, trigger `servidores_antes_de_actualizar` en `public.servidores`.
- Función `public.servicios_ofrecidos_marcar_actualizado`, trigger `servicios_ofrecidos_antes_de_actualizar` en `public.servicios_ofrecidos`.

### RLS

`enable row level security` en las tres tablas. Políticas `anon`, `using (true)` / `with check (true)`:

| Tabla | Políticas |
| --- | --- |
| `servidores` | `servidores_anon_select`, `servidores_anon_insert`, `servidores_anon_update`, `servidores_anon_delete` |
| `servicios_ofrecidos` | `servicios_ofrecidos_anon_select`, `servicios_ofrecidos_anon_insert`, `servicios_ofrecidos_anon_update`, `servicios_ofrecidos_anon_delete` |
| `servicio_ofrecido_servidor` | `servicio_ofrecido_servidor_anon_select`, `servicio_ofrecido_servidor_anon_insert`, `servicio_ofrecido_servidor_anon_update`, `servicio_ofrecido_servidor_anon_delete` |

No crear políticas para `authenticated`. No desactivar RLS. No tocar políticas de `barberos`, `servicios` ni `citas`.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `types/servidor.ts` | Tipos de fila, entrada, errores y respuestas. Sin funciones. |
| `lib/servidores/validar-servidor.ts` | Normaliza y valida el cuerpo. No toca la red. |
| `lib/servidores/repositorio-servidores.ts` | Único acceso a `servidores`: listar, obtener, insertar, actualizar, borrar. Usa `leerEntorno` y `crearCliente`. |
| `app/api/servidores/route.ts` | `GET` lista y `POST` crea. Solo mapea status. |
| `app/api/servidores/[id]/route.ts` | `GET`, `PATCH` y `DELETE` de un id. Solo mapea status. |
| `types/servicio-ofrecido.ts` | Tipos del servicio, de la lista de servidores embebida y de los errores. Sin funciones. |
| `lib/servicios-ofrecidos/validar-servicio-ofrecido.ts` | Normaliza y valida el cuerpo, incluida `servidor_ids`. No toca la red. |
| `lib/servicios-ofrecidos/repositorio-servicios-ofrecidos.ts` | Único acceso a `servicios_ofrecidos` y al puente. |
| `app/api/servicios-ofrecidos/route.ts` | `GET` lista y `POST` crea. Solo mapea status. |
| `app/api/servicios-ofrecidos/[id]/route.ts` | `GET`, `PATCH` y `DELETE` de un id. Solo mapea status. |

El handler no valida ni arma el cliente de Supabase. No hay lógica en componentes.

## Tipos

En `types/servidor.ts`:

- `Servidor`: `id`, `nombre`, `telefono`, `activo`, `creado_en`, `actualizado_en` (fechas en string ISO).
- `EntradaServidor`: `nombre`, `telefono?`, `activo?`.
- `ErrorServidor`: `"entorno_incompleto"` | `"entrada_invalida"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoServidores`: `{ ok: true; servidores: Servidor[] }` o `{ ok: false; error: ErrorServidor }`.
- `ResultadoServidor`: `{ ok: true; servidor: Servidor }` o el mismo fallo.
- `ResultadoBorradoServidor`: `{ ok: true }` o el mismo fallo.

En `types/servicio-ofrecido.ts`:

- `ServicioOfrecido`: `id`, `nombre`, `precio_pesos`, `costo_pesos`, `servidores` (`Servidor[]`), `creado_en`, `actualizado_en`.
- `EntradaServicioOfrecido`: `nombre`, `precio_pesos`, `costo_pesos`, `servidor_ids?` (`string[]`).
- `ErrorServicioOfrecido`: `"entorno_incompleto"` | `"entrada_invalida"` | `"nombre_duplicado"` | `"servidor_inexistente"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoServiciosOfrecidos`: `{ ok: true; servicios: ServicioOfrecido[] }` o fallo.
- `ResultadoServicioOfrecido`: `{ ok: true; servicio: ServicioOfrecido }` o fallo.
- `ResultadoBorradoServicioOfrecido`: `{ ok: true }` o fallo.

Importar `Servidor` desde `types/servidor.ts`. No extender `types/servicio.ts`.

## Reglas de negocio

### Servidores

`validar-servidor.ts`, para crear y para actualizar:

1. El cuerpo es un objeto. Si no, `entrada_invalida`.
2. `nombre`: string, trim, longitud 1–120.
3. `telefono`: si falta o es `""`, queda `""`. Si viene, string con trim, longitud 1–20, solo dígitos, espacios, `+` y `-`, y al menos 7 dígitos.
4. `activo`: si falta, `true`. Si viene, debe ser boolean.
5. Cualquier otro campo se ignora. Cualquier fallo de 2–4 es `entrada_invalida`.

`repositorio-servidores.ts`:

1. Si `leerEntorno()` es `null`, `entorno_incompleto` sin red.
2. El `id` de ruta debe ser UUID. Si no, `no_encontrado` sin consultar.
3. Listar: todas las columnas, orden `creado_en` descendente. Lista vacía es éxito.
4. Obtener: una fila por `id`. Cero filas es `no_encontrado`.
5. Insertar y actualizar: columnas ya normalizadas. Cero filas al actualizar es `no_encontrado`.
6. Borrar: por `id`. Cero filas es `no_encontrado`. El `on delete cascade` del puente quita los vínculos. Éxito sin cuerpo.
7. Cualquier otro error del SDK es `supabase_inalcanzable`. No devolver el mensaje de Postgres ni la clave.

### Servicios ofrecidos

`validar-servicio-ofrecido.ts`:

1. El cuerpo es un objeto. Si no, `entrada_invalida`.
2. `nombre`: string, trim, longitud 1–80.
3. `precio_pesos` y `costo_pesos`: enteros (no string, no float), `> 0`, y `precio_pesos >= costo_pesos`. Tope de cada uno: 100000000.
4. `servidor_ids`: si falta, `[]`. Si viene, array de strings UUID, sin duplicados. Array vacío es válido.
5. Cualquier otro campo se ignora. Cualquier fallo es `entrada_invalida`.

`repositorio-servicios-ofrecidos.ts`:

1. Si `leerEntorno()` es `null`, `entorno_incompleto` sin red.
2. El `id` de ruta debe ser UUID. Si no, `no_encontrado` sin consultar.
3. Listar y obtener arman `servidores` con un `select` del servicio y el puente hacia `servidores` (todas las columnas del servidor). Orden de servicios: `creado_en` descendente. Orden de servidores dentro de cada servicio: `nombre` ascendente. Lista vacía de servicios o de servidores es éxito.
4. Insertar: fila en `servicios_ofrecidos` y, si hay ids, filas en el puente. Si algún `servidor_id` no existe, no dejar el servicio a medias: borrar el servicio recién creado y responder `servidor_inexistente`. Código Postgres `23505` del nombre es `nombre_duplicado`.
5. Actualizar: reemplaza `nombre`, `precio_pesos` y `costo_pesos`. Borra los vínculos de ese servicio e inserta la lista nueva. Cero filas del servicio es `no_encontrado`. Id de servidor ausente es `servidor_inexistente` y se restauran los vínculos anteriores (volver a insertar los que había antes del borrado). `23505` es `nombre_duplicado`.
6. Borrar: por `id`. Cero filas es `no_encontrado`. El cascade limpia el puente. Éxito sin cuerpo.
7. Cualquier otro error del SDK es `supabase_inalcanzable`.

## Contrato HTTP

JSON en request y response. Sin query string.

Cuerpo de error: `{ "ok": false, "error": "<codigo>" }`.

### `GET /api/servidores`

- `200`: `{ "ok": true, "servidores": [ Servidor, ... ] }`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `POST /api/servidores`

```json
{ "nombre": "Ana Ruiz", "telefono": "+57 300 111 2233", "activo": true }
```

`telefono` y `activo` pueden omitirse.

- `201`: `{ "ok": true, "servidor": Servidor }`
- `400`: `entrada_invalida`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `GET /api/servidores/[id]`

- `200`: `{ "ok": true, "servidor": Servidor }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `PATCH /api/servidores/[id]`

Mismo cuerpo que el `POST`. Reemplaza nombre, teléfono y activo.

- `200`: `{ "ok": true, "servidor": Servidor }`
- `400`: `entrada_invalida`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `DELETE /api/servidores/[id]`

- `200`: `{ "ok": true }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `GET /api/servicios-ofrecidos`

- `200`: `{ "ok": true, "servicios": [ ServicioOfrecido, ... ] }`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

Tras aplicar la migración, la lista incluye «Corte de cabello» con `precio_pesos` 15000, `costo_pesos` 5000 y `servidores` `[]`.

### `POST /api/servicios-ofrecidos`

```json
{
  "nombre": "Corte de cabello",
  "precio_pesos": 15000,
  "costo_pesos": 5000,
  "servidor_ids": ["<uuid de un servidor>"]
}
```

`servidor_ids` puede omitirse.

- `201`: `{ "ok": true, "servicio": ServicioOfrecido }`
- `400`: `entrada_invalida`
- `409`: `nombre_duplicado`
- `422`: `servidor_inexistente`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

El nombre de la semilla ya ocupa «Corte de cabello». Un segundo alta con ese nombre, en cualquier capitalización, responde `409`.

### `GET /api/servicios-ofrecidos/[id]`

- `200`: `{ "ok": true, "servicio": ServicioOfrecido }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `PATCH /api/servicios-ofrecidos/[id]`

Mismo cuerpo que el `POST`. Reemplaza nombre, precios y la lista de servidores.

- `200`: `{ "ok": true, "servicio": ServicioOfrecido }`
- `400`: `entrada_invalida`
- `404`: `no_encontrado`
- `409`: `nombre_duplicado`
- `422`: `servidor_inexistente`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `DELETE /api/servicios-ofrecidos/[id]`

- `200`: `{ "ok": true }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

Métodos no listados: no implementarlos. Next responde 405.

Mapa de status en cada `route.ts`: `entrada_invalida` → 400, `no_encontrado` → 404, `nombre_duplicado` → 409, `servidor_inexistente` → 422, el resto de errores → 503.

## Criterios de aceptación — migraciones

- Existe `supabase/migrations/20261016180000_crear_servidores_y_servicios_ofrecidos.sql` y no modifica migraciones anteriores.
- `servidores` tiene las seis columnas, los dos checks y el trigger de `actualizado_en`.
- `servicios_ofrecidos` tiene las seis columnas, los cuatro checks, el índice único de nombre y el trigger de `actualizado_en`.
- `servicio_ofrecido_servidor` tiene la PK compuesta, las dos FK con `on delete cascade` y el índice por `servidor_id`.
- Hay una fila «Corte de cabello» con `precio_pesos` 15000 y `costo_pesos` 5000, sin filas en el puente.
- RLS está activo en las tres tablas y existen las doce políticas `anon`.
- `public.servicios`, `public.barberos` y `public.citas` quedan iguales.

## Criterios de aceptación — lógica de negocio

- No hay dependencias nuevas.
- `GET /api/servidores` responde `200` y `servidores: []` con la tabla vacía.
- `POST /api/servidores` con solo `nombre` responde `201`, `telefono` `""` y `activo` `true`.
- `POST` de servidor sin nombre, con teléfono de menos de 7 dígitos o con `activo` que no es boolean responde `400`.
- `GET` y `PATCH` de ese id responden `200`. El `PATCH` refresca `actualizado_en`.
- `DELETE` del servidor responde `200` y un `GET` posterior responde `404`. Un id que no es UUID responde `404`.
- `GET /api/servicios-ofrecidos` responde `200` e incluye «Corte de cabello» con precio 15000, costo 5000 y `servidores` vacío.
- `POST` de otro servicio con `precio_pesos` 15000, `costo_pesos` 5000 y un `servidor_ids` real responde `201` y el servicio trae ese servidor.
- `POST` con el nombre «corte de cabello» responde `409` y `nombre_duplicado`.
- `POST` con costo 15000 y precio 5000, con precio 0, o con un id de servidor inventado responde `400` o, en el último caso, `422` y no deja una fila nueva.
- `PATCH` que cambia la lista de servidores deja solo los ids enviados.
- `DELETE` del servicio responde `200`, un `GET` posterior responde `404` y el servidor asociado sigue existiendo.
- Sin variables de entorno, cualquier método de estas rutas responde `503` y `entorno_incompleto`.
- Los handlers delegan en `lib/servidores` y `lib/servicios-ofrecidos`. Los tipos están solo en `types/servidor.ts` y `types/servicio-ofrecido.ts`.
