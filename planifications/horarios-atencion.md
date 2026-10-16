# Horarios de atención

## Objetivo

Persistir el horario semanal de la barbería en Supabase y exponer su alta, listado, lectura, actualización y baja por `app/api`. Una fila es un día de la semana con hora de apertura, hora de cierre y si ese día está cerrado. El frontend queda para otro equipo.

## Alcance

- Una tabla `public.horarios_atencion` con día, hora de apertura, hora de cierre y marca de día cerrado.
- Tipos, validación y acceso a datos fuera del handler HTTP.
- Cinco operaciones HTTP sobre `/api/horarios`.

## Fuera de alcance

- Pantallas, hooks, componentes y llamadas desde el cliente del navegador.
- Auth, citas, barberos, servicios, excepciones por fecha y cualquier otra tabla.
- Cambios a `public.clientes` ni a `/api/clientes`.
- Cambios a `GET /api/supabase/conexion`.
- `service_role`, cookies, `@supabase/ssr` y dependencias nuevas.
- Sembrar las siete filas. La tabla nace vacía; cada día se crea con `POST`.

## Estado actual

- El servidor ya crea el cliente de Supabase con `leerEntorno` y `crearCliente` (`lib/supabase/`). Clave publicable, sin sesión. Reutilizarlos. No crear otro cliente.
- Existe `supabase/migrations/20261016150000_crear_tabla_clientes.sql` y el CRUD de `/api/clientes`. Este plan no los modifica.
- `@supabase/supabase-js` ya está instalado. No instalar nada.

## Suposiciones

- El título de la tarea es el único requerimiento. No hay cuerpo en Notion.
- El horario es de la barbería, no de un barbero. No hay FK.
- Hay como máximo una fila por día. El día se guarda en minúsculas y en español: `lunes`, `martes`, `miercoles`, `jueves`, `viernes`, `sabado`, `domingo`. Sin tilde, para que el valor coincida con el check.
- Las horas son reloj de 24 h, `HH:MM`, sin segundos ni zona. Se guardan como `time`.
- Si el día está abierto, `abre` es anterior a `cierra`. No hay turno partido ni cruce de medianoche.
- Si el día está cerrado, `abre` y `cierra` se guardan `null`.
- No hay login. Las políticas permiten al rol `anon` leer y escribir esta tabla, igual que `clientes`. Queda anotado como decisión de este ejercicio.
- `actualizado_en` lo mantiene la base en cada `UPDATE`.
- El borrado es físico.
- El `PATCH` reemplaza el recurso completo.

## Migración

Un solo archivo nuevo:

`supabase/migrations/20261016160000_crear_tabla_horarios_atencion.sql`

No editar la migración de clientes.

### Tabla `public.horarios_atencion`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `dia` | `text` | `not null`, uno de los siete días, único |
| `abre` | `time` | nullable |
| `cierra` | `time` | nullable |
| `cerrado` | `boolean` | `not null`, `default false` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |
| `actualizado_en` | `timestamptz` | `not null`, `default now()` |

Sin FKs.

Checks con nombre:

- `horarios_atencion_dia_valido`: `dia in ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')`.
- `horarios_atencion_horas_coherentes`:
  - `cerrado = true` y `abre is null` y `cierra is null`, o
  - `cerrado = false` y `abre is not null` y `cierra is not null` y `abre < cierra`.

Índice único `horarios_atencion_dia_unico` sobre `dia`.

### Trigger

Función `public.horarios_atencion_marcar_actualizado()`: `language plpgsql`, `set search_path = ''`, `before update`, asigna `new.actualizado_en = pg_catalog.now()` y retorna `new`. Trigger `horarios_atencion_antes_de_actualizar` en `public.horarios_atencion`, `for each row`, `execute function public.horarios_atencion_marcar_actualizado()`.

### RLS

`alter table public.horarios_atencion enable row level security`.

Cuatro políticas para `anon`, `using (true)` / `with check (true)` según el comando:

| Política | Comando |
| --- | --- |
| `horarios_atencion_anon_select` | `select` |
| `horarios_atencion_anon_insert` | `insert` |
| `horarios_atencion_anon_update` | `update` |
| `horarios_atencion_anon_delete` | `delete` |

No crear políticas para `authenticated`. No desactivar RLS.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `types/horario.ts` | Tipos de fila, entrada, errores y respuestas. Sin funciones. |
| `lib/horarios/validar-horario.ts` | Normaliza y valida el cuerpo. No toca la red. |
| `lib/horarios/repositorio-horarios.ts` | Único acceso a `horarios_atencion`: listar, obtener, insertar, actualizar, borrar. Usa `leerEntorno` y `crearCliente`. |
| `app/api/horarios/route.ts` | `GET` lista y `POST` crea. Solo lee el JSON y mapea status. |
| `app/api/horarios/[id]/route.ts` | `GET`, `PATCH` y `DELETE` de un id. Solo lee el JSON y mapea status. |

El handler no valida ni arma el cliente de Supabase. No reutilizar `types/cliente.ts` ni `lib/clientes`.

## Tipos

En `types/horario.ts`:

- `DiaSemana`: unión de los siete literales en minúsculas y sin tilde.
- `Horario`: `id`, `dia`, `abre` (`string` `HH:MM` o `null`), `cierra` (`string` `HH:MM` o `null`), `cerrado` (`boolean`), `creado_en`, `actualizado_en` (strings ISO).
- `EntradaHorario`: `dia`, `cerrado`, `abre?`, `cierra?`. Si `cerrado` es `true`, `abre` y `cierra` no forman parte del objeto normalizado. Si es `false`, ambos son `string` `HH:MM`.
- `ErrorHorario`: `"entorno_incompleto"` | `"entrada_invalida"` | `"dia_duplicado"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoHorarios`: `{ ok: true; horarios: Horario[] }` o `{ ok: false; error: ErrorHorario }`.
- `ResultadoHorario`: `{ ok: true; horario: Horario }` o el mismo fallo.
- `ResultadoBorradoHorario`: `{ ok: true }` o el mismo fallo.

## Reglas de negocio

`validar-horario.ts`, para crear y para actualizar:

1. El cuerpo es un objeto no array. Si no, la función devuelve `null` y el repositorio responde `entrada_invalida`.
2. `dia`: string, trim, a minúsculas. Debe ser uno de los siete días. `miércoles` y `sábado` se aceptan y se normalizan a `miercoles` y `sabado`. Cualquier otro valor falla.
3. `cerrado`: boolean. Si falta o no es boolean, falla. No se infiere.
4. Si `cerrado` es `true`, `abre` y `cierra` se ignoran. La entrada normalizada no los incluye.
5. Si `cerrado` es `false`, `abre` y `cierra` son strings que cumplen `/^([01]\d|2[0-3]):[0-5]\d$/`. Comparadas como `HH:MM`, `abre` es estrictamente anterior a `cierra`.
6. Cualquier otro campo se ignora. Cualquier fallo es `entrada_invalida`, sin detallar el campo.

`repositorio-horarios.ts`:

1. Si `leerEntorno()` es `null`, devolver `entorno_incompleto` sin llamar a la red.
2. El `id` de ruta debe ser UUID (`/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`). Si no, `no_encontrado` sin consultar.
3. Listar: `select` de `id, dia, abre, cierra, cerrado, creado_en, actualizado_en`, orden fijo `lunes` … `domingo`. Lista vacía es éxito. Postgres no ordena por ese enum de texto; ordenar en memoria con ese arreglo después del `select`.
4. Al mapear la fila, `abre` y `cierra` salen como `HH:MM` (cinco caracteres). Si el driver devuelve `HH:MM:SS`, recortar a cinco. `null` sigue `null`.
5. Obtener: una fila por `id`. Cero filas es `no_encontrado`.
6. Insertar: si `cerrado` es `true`, persistir `abre: null` y `cierra: null`. Si es `false`, persistir las horas `HH:MM`. Código Postgres `23505` es `dia_duplicado`.
7. Actualizar: mismas columnas más el filtro por `id`. Cero filas es `no_encontrado`. `23505` es `dia_duplicado`.
8. Borrar: borrar por `id` y `select` de `id`. Cero filas es `no_encontrado`. Éxito sin cuerpo de horario.
9. Cualquier otro error del SDK es `supabase_inalcanzable`. No devolver el mensaje de Postgres ni la clave.

## Contrato HTTP

JSON en request y response. Sin query string.

### `GET /api/horarios`

- `200`: `{ "ok": true, "horarios": [ Horario, ... ] }`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `POST /api/horarios`

Día abierto:

```json
{ "dia": "Lunes", "cerrado": false, "abre": "09:00", "cierra": "19:00" }
```

Día cerrado. `abre` y `cierra` pueden omitirse:

```json
{ "dia": "domingo", "cerrado": true }
```

- `201`: `{ "ok": true, "horario": Horario }`
- `400`: `entrada_invalida`
- `409`: `dia_duplicado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `GET /api/horarios/[id]`

- `200`: `{ "ok": true, "horario": Horario }`
- `404`: `no_encontrado` (id mal formado o inexistente)
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `PATCH /api/horarios/[id]`

Mismo cuerpo que el `POST`. Reemplaza día, cerrado y horas.

- `200`: `{ "ok": true, "horario": Horario }`
- `400`: `entrada_invalida`
- `404`: `no_encontrado`
- `409`: `dia_duplicado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `DELETE /api/horarios/[id]`

- `200`: `{ "ok": true }`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

Cuerpo de error en todos: `{ "ok": false, "error": "<codigo>" }`.

Métodos no listados: no implementarlos. Next responde 405.

Mapeo de status en cada `route.ts`:

| Error | Status |
| --- | --- |
| `entrada_invalida` | 400 |
| `no_encontrado` | 404 |
| `dia_duplicado` | 409 |
| `entorno_incompleto`, `supabase_inalcanzable` | 503 |

`GET /api/horarios` no usa 404. Un JSON ilegible en `POST` o `PATCH` es `entrada_invalida`.

## Criterios de aceptación — migraciones

- Existe `supabase/migrations/20261016160000_crear_tabla_horarios_atencion.sql` y la migración de clientes sigue intacta.
- La tabla tiene las siete columnas, los dos checks, el índice único de `dia` y el trigger de `actualizado_en`.
- RLS está activo y las cuatro políticas de `anon` existen.
- No hay otras tablas ni políticas en ese archivo.

## Criterios de aceptación — lógica de negocio

- No hay dependencias nuevas. Se reutilizan `leerEntorno` y `crearCliente`.
- `GET /api/horarios` responde `200` y `horarios: []` con la tabla vacía.
- `POST` de lunes abierto `09:00`–`19:00` responde `201`, persiste `dia` `lunes` y devuelve horas `HH:MM`.
- `POST` de domingo con `cerrado: true` responde `201` y `abre` y `cierra` son `null`.
- Un segundo `POST` del mismo día responde `409` y `dia_duplicado`.
- `POST` sin `cerrado`, con día desconocido, con `abre` posterior o igual a `cierra`, o con hora `9:00` responde `400`.
- `GET /api/horarios` con varias filas las devuelve de lunes a domingo.
- `GET /api/horarios/[id]` del creado responde `200` con esa fila.
- `PATCH` del mismo id a `cerrado: true` deja las horas en `null` y la base refresca `actualizado_en`.
- `DELETE` responde `200` y un `GET` posterior de ese id responde `404`.
- Un id que no es UUID responde `404` sin error de Postgres en el JSON.
- Sin variables de entorno, cualquier método responde `503` y `entorno_incompleto`.
- Los handlers delegan en `lib/horarios`. Los tipos están solo en `types/horario.ts`.
