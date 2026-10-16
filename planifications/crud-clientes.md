# CRUD de clientes

## Objetivo

Persistir clientes de la barbería en Supabase y exponer su alta, listado, lectura, actualización y baja por `app/api`. El frontend queda para otro equipo.

## Alcance

- Una tabla `public.clientes` con nombre, correo, teléfono y un detalle libre.
- Tipos, validación y acceso a datos fuera del handler HTTP.
- Cinco operaciones HTTP sobre `/api/clientes`.

## Fuera de alcance

- Pantallas, hooks, componentes y llamadas desde el cliente del navegador.
- Auth, citas, barberos, servicios de corte y cualquier otra tabla.
- `service_role`, cookies, `@supabase/ssr` y dependencias nuevas.
- Cambios a `GET /api/supabase/conexion`.

## Estado actual

- El servidor ya crea el cliente con `leerEntorno` y `crearCliente` (`lib/supabase/`). Clave publicable, sin sesión.
- Proyecto: `https://gtzbxiiunbehowfayelc.supabase.co`.
- No existe `supabase/migrations` ni tabla de clientes.
- `@supabase/supabase-js` ya está instalado. No instalar nada.

## Suposiciones

- Un cliente es una persona. No hay relación con otras tablas.
- El correo identifica al cliente y es único en minúsculas.
- El detalle es texto libre opcional (notas de corte, preferencias). Vacío si no se envía.
- No hay login. Las políticas permiten al rol `anon` (la clave publicable) leer y escribir esta tabla. Queda anotado como decisión de este ejercicio, no como modelo para datos sensibles.
- `actualizado_en` lo mantiene la base en cada `UPDATE`.
- El borrado es físico.

## Migración

Un solo archivo:

`supabase/migrations/20261016150000_crear_tabla_clientes.sql`

### Tabla `public.clientes`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `nombre` | `text` | `not null`, `char_length(btrim(nombre)) between 1 and 120` |
| `correo` | `text` | `not null`, guardado en minúsculas, único |
| `telefono` | `text` | `not null`, `char_length(btrim(telefono)) between 7 and 20` |
| `detalle` | `text` | `not null`, `default ''`, `char_length(detalle) <= 500` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |
| `actualizado_en` | `timestamptz` | `not null`, `default now()` |

Sin FKs.

Checks con nombre: `clientes_nombre_largo`, `clientes_telefono_largo`, `clientes_detalle_largo`.

Índice único `clientes_correo_unico` sobre `correo`.

### Trigger

Función `public.clientes_marcar_actualizado()`: `before update`, asigna `new.actualizado_en = now()`. Trigger `clientes_antes_de_actualizar` en `public.clientes`.

### RLS

`alter table public.clientes enable row level security`.

Cuatro políticas para `anon`, `using (true)` / `with check (true)` según el comando:

| Política | Comando |
| --- | --- |
| `clientes_anon_select` | `select` |
| `clientes_anon_insert` | `insert` |
| `clientes_anon_update` | `update` |
| `clientes_anon_delete` | `delete` |

No crear políticas para `authenticated`. No desactivar RLS.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `types/cliente.ts` | Tipos de fila, entrada, errores y respuestas. Sin funciones. |
| `lib/clientes/validar-cliente.ts` | Normaliza y valida el cuerpo. No toca la red. |
| `lib/clientes/repositorio-clientes.ts` | Único acceso a `clientes`: listar, obtener, insertar, actualizar, borrar. Usa `leerEntorno` y `crearCliente`. |
| `app/api/clientes/route.ts` | `GET` lista y `POST` crea. Solo mapea status. |
| `app/api/clientes/[id]/route.ts` | `GET`, `PATCH` y `DELETE` de un id. Solo mapea status. |

El handler no valida ni arma el cliente de Supabase.

## Tipos

En `types/cliente.ts`:

- `Cliente`: `id`, `nombre`, `correo`, `telefono`, `detalle`, `creado_en`, `actualizado_en` (strings ISO en las fechas).
- `EntradaCliente`: `nombre`, `correo`, `telefono`, `detalle?`.
- `ErrorCliente`: `"entorno_incompleto"` | `"entrada_invalida"` | `"correo_duplicado"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoClientes`: `{ ok: true; clientes: Cliente[] }` o `{ ok: false; error: ErrorCliente }`.
- `ResultadoCliente`: `{ ok: true; cliente: Cliente }` o el mismo fallo.
- `ResultadoBorrado`: `{ ok: true }` o el mismo fallo.

## Reglas de negocio

`validar-cliente.ts`, para crear y para actualizar (el cuerpo del `PATCH` es el recurso completo, no un parcial):

1. El cuerpo es un objeto. Si no, `entrada_invalida`.
2. `nombre`: string, trim, longitud 1–120.
3. `correo`: string, trim, a minúsculas, debe cumplir `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` y tener como máximo 254 caracteres.
4. `telefono`: string, trim, longitud 7–20, solo dígitos, espacios, `+` y `-`. Al menos 7 dígitos.
5. `detalle`: si falta o es `""`, queda `""`. Si viene, string con trim y longitud 0–500.
6. Cualquier otro campo se ignora. Cualquier fallo de los puntos 2–5 es `entrada_invalida`, sin detallar el campo.

`repositorio-clientes.ts`:

1. Si `leerEntorno()` es `null`, devolver `entorno_incompleto` sin llamar a la red.
2. El `id` de ruta debe ser UUID. Si no, `no_encontrado` sin consultar.
3. Listar: `select` de todas las columnas, orden `creado_en` descendente. Lista vacía es éxito.
4. Obtener: una fila por `id`. Cero filas es `no_encontrado`.
5. Insertar: columnas ya normalizadas. Código Postgres `23505` es `correo_duplicado`.
6. Actualizar: mismas columnas más el filtro por `id`. Cero filas es `no_encontrado`. `23505` es `correo_duplicado`.
7. Borrar: borrar por `id`. Cero filas es `no_encontrado`. Éxito sin cuerpo de cliente.
8. Cualquier otro error del SDK es `supabase_inalcanzable`. No devolver el mensaje de Postgres ni la clave.

## Contrato HTTP

JSON en request y response. Sin query string.

### `GET /api/clientes`

- `200`: `{ "ok": true, "clientes": [ Cliente, ... ] }`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `POST /api/clientes`

Entrada:

```json
{ "nombre": "Ana Ruiz", "correo": "ana@correo.com", "telefono": "+51 999 111 222", "detalle": "Prefiere degradado" }
```

`detalle` puede omitirse.

- `201`: `{ "ok": true, "cliente": Cliente }`
- `400`: `entrada_invalida`
- `409`: `correo_duplicado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `GET /api/clientes/[id]`

- `200`: `{ "ok": true, "cliente": Cliente }`
- `404`: `no_encontrado` (id mal formado o inexistente)
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `PATCH /api/clientes/[id]`

Mismo cuerpo que el `POST`. Reemplaza nombre, correo, teléfono y detalle.

- `200`: `{ "ok": true, "cliente": Cliente }`
- `400`: `entrada_invalida`
- `404`: `no_encontrado`
- `409`: `correo_duplicado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `DELETE /api/clientes/[id]`

- `200`: `{ "ok": true }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

Cuerpo de error en todos: `{ "ok": false, "error": "<codigo>" }`.

Métodos no listados: no implementarlos. Next responde 405.

## Criterios de aceptación — migraciones

- Existe solo `supabase/migrations/20261016150000_crear_tabla_clientes.sql`.
- La tabla tiene las siete columnas, los tres checks, el índice único de correo y el trigger de `actualizado_en`.
- RLS está activo y las cuatro políticas de `anon` existen.
- No hay otras tablas ni políticas.

## Criterios de aceptación — lógica de negocio

- No hay dependencias nuevas.
- `GET /api/clientes` responde `200` y `clientes: []` con la tabla vacía.
- `POST` válido responde `201` y persiste correo en minúsculas y `detalle` `""` si se omitió.
- Un segundo `POST` con el mismo correo responde `409` y `correo_duplicado`.
- `POST` sin nombre, con correo inválido o con teléfono corto responde `400`.
- `GET /api/clientes/[id]` del creado responde `200` con esa fila.
- `PATCH` del mismo id cambia nombre y teléfono y la base refresca `actualizado_en`.
- `DELETE` responde `200` y un `GET` posterior de ese id responde `404`.
- Un id que no es UUID responde `404` sin error de Postgres en el JSON.
- Sin variables de entorno, cualquier método responde `503` y `entorno_incompleto`.
- Los handlers delegan en `lib/clientes`. Los tipos están solo en `types/cliente.ts`.
