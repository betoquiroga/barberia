# Módulo administrativo: barberos y precios

## Objetivo

Permitir, por `app/api`, dar de alta barberos en `public.barberos` y cambiar el precio en céntimos de cada servicio que ya existe en `public.servicios`. El catálogo de estilos sigue siendo los tres ids fijos. No se crean tablas nuevas.

## Alcance

- Política `update` de `anon` sobre `public.servicios`.
- Alta y listado de barberos.
- Lectura del catálogo (la ruta `GET /api/servicios` ya existe) y actualización de `precio_centavos` de un servicio.
- Tipos, validación y acceso a datos fuera del handler HTTP.

## Fuera de alcance

- Pantallas, hooks y llamadas desde el navegador.
- Auth, `service_role`, cookies, `@supabase/ssr` y dependencias nuevas.
- Crear, renombrar o borrar servicios. Los ids siguen limitados a `corte-clasico`, `arreglo-barba` y `corte-y-barba`.
- Editar `nombre` o `descripcion` del servicio.
- Borrar o editar barberos. `public.citas.barbero_id` es `on delete restrict`.
- Tocar `public.servidores`, `public.servicios_ofrecidos`, `public.servicio_ofrecido_servidor` ni sus rutas. Ese CRUD es otro módulo y usa pesos, no céntimos.
- Cambiar `lib/landing/servicios.ts`, citas, pagos, horarios, clientes, desempeño ni `GET /api/supabase/conexion`.
- Reescribir migraciones ya aplicadas.

## Estado actual

- `public.barberos` (`supabase/migrations/20261016170000_crear_desempeno_barberos.sql`): `id` uuid, `nombre` (1–120 tras `btrim`), `activo` default `true`, `creado_en`, `actualizado_en`. Trigger `barberos_antes_de_actualizar`. RLS de `anon`: `select`, `insert` y `update`. Sin `delete`. No hay ruta `app/api/barberos`.
- `public.servicios`: `id` texto, `nombre`, `precio_centavos` `> 0`, `descripcion` (`20261016240000_catalogo_cliente_y_pagos.sql`, hasta 240). Check `servicios_id_valido`. Semilla: 2500, 1500 y 3500 céntimos. RLS de `anon`: solo `select`.
- `GET /api/servicios` llama a `leerCatalogoServicios` en `lib/servicios/repositorio-catalogo.ts` y responde `{ ok: true, servicios: EstiloPublico[] }` con `id`, `nombre`, `descripcion`, `precio_centavos` y `moneda: "PEN"`, en el orden fijo de `ORDEN`. Errores del catálogo: `entorno_incompleto` y `supabase_inalcanzable`, ambos HTTP 503.
- Cliente: `leerEntorno` y `crearCliente`. `@supabase/supabase-js` ya está instalado.
- El patrón de handler es `app/api/servidores/route.ts`: el route lee el cuerpo y traduce el código de error a status. La validación vive en `lib/` y los tipos en `types/`.

## Suposiciones

- La página de Notion no tiene cuerpo. El título es el requerimiento: agregar barberos y fijar el precio de cada servicio de la barbería.
- «Barbero» es una fila de `public.barberos`, la misma que usan citas y desempeño. No se reutiliza `servidores`.
- «Precio de cada servicio» es `public.servicios.precio_centavos` (soles peruanos en céntimos, moneda `PEN`). No se usa `servicios_ofrecidos.precio_pesos`.
- No hay login. La política nueva de `update` en `servicios` es para `anon`, igual que el `insert` que ya tiene `barberos`.
- Dos barberos pueden llamarse igual. No hay índice único de nombre.
- El alta deja `activo` en `true` si el cuerpo no lo trae. `activo: false` es válido.
- El listado devuelve activos e inactivos, orden `nombre` ascendente y, a igualdad, `creado_en` ascendente.
- Un precio nuevo aplica a las lecturas posteriores del catálogo y del desempeño. No hay historial. Las citas ya guardadas no copian el precio.
- `PATCH` solo acepta `precio_centavos`. Cualquier otra clave en el cuerpo es entrada inválida.
- El precio es un entero `> 0`. No hay tope superior en la API; el tipo `integer` de Postgres es el límite.
- `GET /api/servicios` no cambia de contrato. El administrador lo usa para leer los tres precios antes de editarlos.

## Migración

Un solo archivo nuevo, creado con `supabase migration new servicios_anon_actualiza_precio` y dejado con este nombre:

`supabase/migrations/20261016250000_servicios_anon_actualiza_precio.sql`

Contenido: una política. No se alteran columnas, checks, índices ni funciones.

```sql
create policy servicios_anon_update
on public.servicios
for update
to anon
using (true)
with check (true);
```

No crear política de `insert` ni de `delete` en `servicios`. No crear políticas para `authenticated`. No desactivar RLS. No tocar políticas de `barberos` ni de `citas`.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `types/barbero.ts` | Tipos de fila, entrada, errores y respuestas. Sin funciones. |
| `lib/barberos/validar-barbero.ts` | Normaliza y valida el cuerpo del alta. No toca la red. |
| `lib/barberos/repositorio-barberos.ts` | Único acceso de este módulo a `barberos`: listar e insertar. Usa `leerEntorno` y `crearCliente`. |
| `app/api/barberos/route.ts` | `GET` lista y `POST` crea. Solo mapea status. |
| `types/precio-servicio.ts` | Entrada, error y respuesta del cambio de precio. Sin funciones. |
| `lib/servicios/validar-precio.ts` | Valida `{ precio_centavos }` y el id de ruta. No toca la red. |
| `lib/servicios/repositorio-precio.ts` | Único `update` de `precio_centavos` en `servicios`. |
| `app/api/servicios/[id]/route.ts` | `PATCH` de un id. Solo mapea status. |

No modificar `app/api/servicios/route.ts`, `lib/servicios/repositorio-catalogo.ts` ni `types/catalogo-servicio.ts`. El `GET` del catálogo sigue igual.

El handler no valida ni arma el cliente de Supabase.

## Tipos

En `types/barbero.ts`:

- `Barbero`: `id`, `nombre`, `activo`, `creado_en`, `actualizado_en` (fechas en string ISO).
- `EntradaBarbero`: `nombre`, `activo`.
- `ErrorBarbero`: `"entorno_incompleto"` | `"entrada_invalida"` | `"supabase_inalcanzable"`.
- `ResultadoBarberos`: `{ ok: true; barberos: Barbero[] }` o `{ ok: false; error: ErrorBarbero }`.
- `ResultadoBarbero`: `{ ok: true; barbero: Barbero }` o el mismo fallo.

En `types/precio-servicio.ts`:

- `EntradaPrecioServicio`: `precio_centavos: number`.
- `ServicioConPrecio`: el mismo shape que `EstiloPublico` (`id`, `nombre`, `descripcion`, `precio_centavos`, `moneda: "PEN"`).
- `ErrorPrecioServicio`: `"entorno_incompleto"` | `"entrada_invalida"` | `"no_encontrado"` | `"supabase_inalcanzable"`.
- `ResultadoPrecioServicio`: `{ ok: true; servicio: ServicioConPrecio }` o `{ ok: false; error: ErrorPrecioServicio }`.

## Reglas de negocio

### Alta de barbero

`validarBarbero(cuerpo: unknown): EntradaBarbero | null`.

- El cuerpo es un objeto plano. Si no lo es, `null`.
- `nombre`: string; se guarda `trim`. Largo entre 1 y 120. Si no es string o queda vacío, `null`.
- `activo`: si falta, `true`. Si viene, tiene que ser boolean. Otro tipo es `null`.
- Claves extra se ignoran.

El repositorio inserta `{ nombre, activo }` y hace `select` de la fila insertada (`id, nombre, activo, creado_en, actualizado_en`). Un solo elemento. Si la inserción o el `select` fallan, `supabase_inalcanzable`. Si `leerEntorno()` es `null`, `entorno_incompleto` antes de crear el cliente.

El listado selecciona las mismas columnas, `order` por `nombre` ascendente. El desempate `creado_en` ascendente se aplica en memoria si PostgREST no admite dos `order` en la versión del cliente; el resultado tiene que quedar así. Lista vacía es `{ ok: true, barberos: [] }`.

### Precio

`validarPrecio(id: string, cuerpo: unknown): { id: string; precio_centavos: number } | null`.

- `id` tiene que ser exactamente `corte-clasico`, `arreglo-barba` o `corte-y-barba`. Cualquier otro string, incluido UUID, es `null` (el route lo traduce a `entrada_invalida`, no a 404).
- El cuerpo es un objeto con exactamente la clave `precio_centavos`.
- `precio_centavos` es `number`, entero (`Number.isInteger`), `> 0`. `1.5`, `0`, negativos, strings numéricos y `NaN` son `null`.

El repositorio hace `update` de `public.servicios` filtrando por `id`, asigna solo `precio_centavos`, y vuelve a leer `id, nombre, descripcion, precio_centavos`. Si la lectura devuelve 0 filas, `no_encontrado`. Si el update viola el check `servicios_precio_positivo`, `entrada_invalida`. El resto de fallos de red o de Supabase son `supabase_inalcanzable`. `entorno_incompleto` se resuelve antes de llamar a Supabase.

La respuesta arma `moneda: "PEN"` en código, igual que el catálogo. No hay columna `moneda`.

## Contratos HTTP

### `GET /api/barberos`

Sin query ni cuerpo.

- 200: `{ ok: true, barberos: Barbero[] }`.
- 503: `{ ok: false, error: "entorno_incompleto" | "supabase_inalcanzable" }`.

### `POST /api/barberos`

Cuerpo JSON: `{ "nombre": string, "activo"?: boolean }`.

- 201: `{ ok: true, barbero: Barbero }`.
- 400: `{ ok: false, error: "entrada_invalida" }` (JSON ausente o inválido, nombre vacío o de más de 120, `activo` no boolean).
- 503: entorno o Supabase.

### `GET /api/servicios`

Sin cambios. 200 con los tres estilos o 503.

### `PATCH /api/servicios/[id]`

Cuerpo JSON: `{ "precio_centavos": number }`.

- 200: `{ ok: true, servicio: ServicioConPrecio }` con el precio ya guardado.
- 400: `{ ok: false, error: "entrada_invalida" }`.
- 404: `{ ok: false, error: "no_encontrado" }` solo si el id es uno de los tres y la fila no está.
- 503: entorno o Supabase.

No hay `POST`, `PUT` ni `DELETE` en `/api/servicios`.

## Criterios de aceptación

### Migración

- Existe `supabase/migrations/20261016250000_servicios_anon_actualiza_precio.sql` y no se editó ninguna migración anterior.
- `public.servicios` tiene la política `servicios_anon_update` para `anon`, `for update`, `using (true)` y `with check (true)`.
- Siguen sin existir políticas de `insert` o `delete` de `anon` sobre `servicios`.
- El check `servicios_precio_positivo` y `servicios_id_valido` siguen igual. La semilla no se vuelve a insertar.
- RLS de `barberos` no cambia: `anon` ya puede `insert`.

### Lógica de negocio

- `POST /api/barberos` con `{ "nombre": "  Luis  " }` responde 201, guarda `nombre` igual a `Luis` y `activo` igual a `true`.
- `POST` con nombre vacío, nombre de 121 caracteres, `activo` string o cuerpo no JSON responde 400 `entrada_invalida`.
- `GET /api/barberos` incluye al barbero creado, activos e inactivos, ordenados por nombre.
- `PATCH /api/servicios/corte-clasico` con `{ "precio_centavos": 3000 }` responde 200 y el siguiente `GET /api/servicios` muestra `3000` en `corte-clasico` y deja los otros dos precios como estaban.
- `PATCH` con `0`, negativo, decimal, string, clave extra o id `corte-premium` responde 400 `entrada_invalida`.
- No aparece ruta ni código que inserte en `servicios` o borre barberos.
- No se instaló ningún paquete. Yarn sigue siendo el gestor; este plan no añade dependencias.
