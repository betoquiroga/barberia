# Desempeño mensual de barberos

## Objetivo

Exponer, por `app/api`, el desempeño de cada barbero en un mes calendario: citas atendidas, citas canceladas, ingresos y ticket promedio. Los números salen de citas ya guardadas y del precio del servicio. El frontend queda para otro equipo.

## Alcance

- Tres tablas nuevas: `barberos`, `servicios` y `citas`. Sin ellas no hay hechos que agregar: hoy el catálogo vive en `lib/landing/servicios.ts` (sin precio) y el formulario de reserva no persiste.
- Semilla de los tres servicios que ya usa la landing, con precio en céntimos.
- Tipos, validación del mes y consulta de agregación fuera del handler HTTP.
- Dos lecturas: el mes de todos los barberos y el mes de un barbero.

## Fuera de alcance

- Pantallas, hooks y llamadas desde el navegador.
- CRUD de barberos, servicios o citas. Este módulo solo lee.
- Auth, comisiones, propinas, metas, ranking escrito en tabla y series por día.
- Cambios a `public.clientes`, `public.horarios_atencion`, `/api/clientes`, `/api/horarios` y `GET /api/supabase/conexion`.
- Cambios a `lib/landing/servicios.ts` ni al formulario de reservas.
- `service_role`, cookies, `@supabase/ssr` y dependencias nuevas.

## Estado actual

- El servidor crea el cliente de Supabase con `leerEntorno` y `crearCliente` (`lib/supabase/`). Reutilizarlos. No crear otro cliente.
- Tablas existentes: `clientes` y `horarios_atencion`. RLS de `anon` en ambas. No hay `barberos`, `servicios` ni `citas`.
- `@supabase/supabase-js` ya está instalado. No instalar nada.
- Migraciones actuales: `20261016150000_crear_tabla_clientes.sql` y `20261016160000_crear_tabla_horarios_atencion.sql`. No editarlas.

## Suposiciones

- La página de Notion solo trae el título. El desempeño es operativo del mes, no un dashboard de UI.
- Un mes es `AAAA-MM` en la zona `America/Lima`. El intervalo es `[inicio, inicio del mes siguiente)` en esa zona, comparado contra `citas.inicia_en`.
- Si falta el query `mes`, se usa el mes calendario actual en `America/Lima`.
- Cuenta como atendida la cita con `estado = 'completada'`. Cuenta como cancelada `estado = 'cancelada'`. `programada` no entra en ingresos ni en ticket.
- El ingreso de una cita completada es `servicios.precio_centavos` en el momento de la lectura (no hay historial de precio).
- El ticket promedio es `ingresos_centavos / citas_completadas`, división entera. Si no hay completadas, el ticket es `0`.
- Barbero sin citas en el mes aparece igual, con ceros, si `activo = true`. Un barbero inactivo aparece solo si tuvo al menos una cita (cualquier estado) en ese mes.
- El orden del listado es `ingresos_centavos` descendente y, a igualdad, `nombre` ascendente.
- No hay login. Las políticas nuevas permiten a `anon` leer las tres tablas e insertar y actualizar `barberos` y `citas`, para que otro módulo o SQL de ejercicio pueda cargar datos. `servicios` solo se lee por `anon` después de la semilla. Queda anotado como decisión de este ejercicio.
- El borrado de barbero o servicio con citas lo impide la FK. No hay borrado en este módulo.
- Precios de semilla, en soles enteros: Corte clásico 25, Arreglo de barba 15, Corte y barba 35. Se guardan en céntimos: 2500, 1500 y 3500.
- Los `id` de servicio de la semilla son texto fijo, los mismos de `serviciosLanding`: `corte-clasico`, `arreglo-barba`, `corte-y-barba`. No son UUID.
- No se siembran barberos ni citas. Con tablas vacías de barberos la lista del mes es `[]` y es éxito.

## Migración

Un solo archivo nuevo:

`supabase/migrations/20261016170000_crear_desempeno_barberos.sql`

### Tabla `public.barberos`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `nombre` | `text` | `not null` |
| `activo` | `boolean` | `not null`, `default true` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |
| `actualizado_en` | `timestamptz` | `not null`, `default now()` |

Check `barberos_nombre_largo`: `char_length(btrim(nombre)) between 1 and 120`.

Sin índice extra: el PK basta. No hay correo.

### Tabla `public.servicios`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `text` | PK, sin default |
| `nombre` | `text` | `not null` |
| `precio_centavos` | `integer` | `not null` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |

Checks:

- `servicios_id_valido`: `id in ('corte-clasico', 'arreglo-barba', 'corte-y-barba')`.
- `servicios_nombre_largo`: `char_length(btrim(nombre)) between 1 and 80`.
- `servicios_precio_positivo`: `precio_centavos > 0`.

Semilla en el mismo archivo, tres `insert`:

| `id` | `nombre` | `precio_centavos` |
| --- | --- | --- |
| `corte-clasico` | `Corte clásico` | `2500` |
| `arreglo-barba` | `Arreglo de barba` | `1500` |
| `corte-y-barba` | `Corte y barba` | `3500` |

### Tabla `public.citas`

| Columna | Tipo | Regla |
| --- | --- | --- |
| `id` | `uuid` | PK, `default gen_random_uuid()` |
| `barbero_id` | `uuid` | `not null`, FK a `public.barberos(id)` `on delete restrict` |
| `servicio_id` | `text` | `not null`, FK a `public.servicios(id)` `on delete restrict` |
| `inicia_en` | `timestamptz` | `not null` |
| `estado` | `text` | `not null`, `default 'programada'` |
| `creado_en` | `timestamptz` | `not null`, `default now()` |

Check `citas_estado_valido`: `estado in ('programada', 'completada', 'cancelada')`.

Índice `citas_barbero_inicia` sobre `(barbero_id, inicia_en)`.

No hay FK a `clientes`: la cita de desempeño no exige ficha de cliente.

### Trigger

Solo en `barberos`. Función `public.barberos_marcar_actualizado()`: `language plpgsql`, `set search_path = ''`, asigna `new.actualizado_en = pg_catalog.now()` y retorna `new`. Trigger `barberos_antes_de_actualizar`, `before update`, `for each row`.

`servicios` y `citas` no tienen `actualizado_en`.

### RLS

`enable row level security` en las tres tablas.

`barberos` y `citas`, rol `anon`: `select`, `insert` y `update`, `using (true)` / `with check (true)`. Sin política de `delete`.

`servicios`, rol `anon`: solo `select`, `using (true)`.

## Archivos de aplicación

| Archivo | Responsabilidad |
| --- | --- |
| `types/desempeno.ts` | Tipos del mes, de la fila agregada, errores y respuestas. Sin funciones. |
| `lib/desempeno/validar-mes.ts` | Interpreta `mes` y devuelve el intervalo `[desde, hasta)`. Sin red ni JSX. |
| `lib/desempeno/repositorio-desempeno.ts` | Única lectura a Supabase de este módulo. Arma los totales. Usa `leerEntorno` y `crearCliente`. |
| `app/api/desempeno/route.ts` | `GET` del mes para todos los barberos. Solo mapea status. |
| `app/api/desempeno/[barberoId]/route.ts` | `GET` del mes de un barbero. Solo mapea status. |

El handler no calcula totales ni crea el cliente de Supabase. No hay `POST`, `PATCH` ni `DELETE`.

## Tipos

En `types/desempeno.ts`:

- `MesDesempeno`: `string` con forma `AAAA-MM`.
- `FilaDesempeno`: `barbero_id`, `nombre`, `activo`, `citas_completadas`, `citas_canceladas`, `citas_programadas`, `ingresos_centavos`, `ticket_promedio_centavos`. Los conteos y los montos son `number`.
- `ErrorDesempeno`: `"entorno_incompleto"` | `"mes_invalido"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoDesempeno`: `{ ok: true; mes: MesDesempeno; filas: FilaDesempeno[] }` o `{ ok: false; error: ErrorDesempeno }`.
- `ResultadoDesempenoBarbero`: `{ ok: true; mes: MesDesempeno; fila: FilaDesempeno }` o el mismo fallo.

## Reglas de negocio

`validar-mes.ts`:

1. Sin valor, o cadena vacía tras trim: mes actual en `America/Lima`.
2. Con valor: debe coincidir con `/^\d{4}-(0[1-9]|1[0-2])$/`. Si no, `mes_invalido`.
3. `desde` es el día 1 de ese mes a las 00:00 en `America/Lima`, en ISO. `hasta` es el día 1 del mes siguiente a las 00:00 en la misma zona. Año 9999-12 es `mes_invalido` (no hay mes siguiente representable para el tope).
4. No acepta día, hora ni zona en el query.

`repositorio-desempeno.ts`:

1. Si `leerEntorno()` es `null`, devolver `entorno_incompleto` sin llamar a la red.
2. Listar barberos (`id`, `nombre`, `activo`) y citas del intervalo (`barbero_id`, `servicio_id`, `estado`) con `inicia_en >= desde` y `inicia_en < hasta`, más el catálogo `servicios` (`id`, `precio_centavos`).
3. Agrupar en memoria. No hay vista ni función SQL.
4. Por barbero: contar cada estado; sumar `precio_centavos` solo de citas `completada` cuyo `servicio_id` exista en el catálogo. Una completada con servicio ausente no suma ingreso y sí cuenta en `citas_completadas` (la FK lo hace imposible si la semilla está aplicada; la regla cubre el caso).
5. Incluir barberos según la suposición de activos e inactivos. Excluir el resto.
6. Ordenar como se indicó.
7. Detalle de un barbero: `barberoId` que no sea UUID es `no_encontrado` sin consultar. UUID sin fila de barbero es `no_encontrado`. Barbero inactivo sin citas en el mes es `no_encontrado`. Barbero que sí entra en el listado devuelve su fila, aunque los conteos sean cero.
8. Cualquier error del SDK es `supabase_inalcanzable`. No devolver el mensaje de Postgres ni la clave.

## Contrato HTTP

JSON en la respuesta. Query `mes` opcional. Sin cuerpo.

### `GET /api/desempeno?mes=2026-10`

- `200`: `{ "ok": true, "mes": "2026-10", "filas": [ FilaDesempeno, ... ] }`. `filas` puede ser `[]`.
- `400`: `mes_invalido`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

### `GET /api/desempeno/[barberoId]?mes=2026-10`

- `200`: `{ "ok": true, "mes": "2026-10", "fila": FilaDesempeno }`
- `400`: `mes_invalido`
- `404`: `no_encontrado`
- `503`: `entorno_incompleto` o `supabase_inalcanzable`

Cuerpo de error: `{ "ok": false, "error": "<codigo>" }`.

Ejemplo de fila:

```json
{
  "barbero_id": "00000000-0000-4000-8000-000000000001",
  "nombre": "Luis",
  "activo": true,
  "citas_completadas": 2,
  "citas_canceladas": 1,
  "citas_programadas": 0,
  "ingresos_centavos": 6000,
  "ticket_promedio_centavos": 3000
}
```

Esos 6000 son dos completadas: Corte clásico (2500) y Corte y barba (3500). Una cancelada no suma.

Métodos no listados: no implementarlos. Next responde 405.

## Criterios de aceptación — migraciones

- Existe `supabase/migrations/20261016170000_crear_desempeno_barberos.sql` y no se editan las migraciones anteriores.
- `barberos` tiene las cinco columnas, el check de nombre y el trigger de `actualizado_en`.
- `servicios` tiene las cuatro columnas, los tres checks y las tres filas de semilla con esos `id` y precios.
- `citas` tiene las seis columnas, el check de estado, las dos FK `on delete restrict` y el índice `(barbero_id, inicia_en)`.
- RLS está activo. `anon` puede select/insert/update en `barberos` y `citas`, y solo select en `servicios`. No hay política de delete.
- No se crean vistas, funciones de agregación ni filas de barberos o citas.

## Criterios de aceptación — lógica de negocio

- `GET /api/desempeno` sin `mes` responde 200 con el mes actual de `America/Lima`.
- `mes=2026-13`, `mes=2026-1` y `mes=2026-10-01` responden 400 `mes_invalido`.
- Con un barbero activo y cero citas, el listado trae una fila en ceros.
- Dos citas completadas de 2500 y 3500 en el mes, y una cancelada, producen `citas_completadas` 2, `citas_canceladas` 1, `ingresos_centavos` 6000 y `ticket_promedio_centavos` 3000.
- Una cita completada del mes anterior no entra en ese mes.
- `GET /api/desempeno/[barberoId]` con UUID inexistente responde 404 `no_encontrado`.
- Sin variables de entorno de Supabase, ambas rutas responden 503 `entorno_incompleto`.
- `/api/clientes` y `/api/horarios` siguen con el mismo contrato.
