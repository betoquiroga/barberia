# Validación backend: módulo administrativo de barberos y precios

Plan: `planifications/modulo-administrativo-barberos-precios.md`

## Puntajes

| Parte | Puntaje | Veredicto |
| --- | --- | --- |
| Plan | 10 | aprobado |
| Migraciones | 10 | aprobado |
| Lógica de `app/api` | 10 | aprobado |

## Plan

El plan fija una sola política nueva, los archivos, los tipos, las reglas de alta y de precio, y los contratos HTTP. No pide tablas, grants ni cambios al `GET` del catálogo. Es verificable contra el SQL y contra el código.

## Migraciones

Evidencia:

- Existe `supabase/migrations/20261016250000_servicios_anon_actualiza_precio.sql`.
- El archivo solo crea `servicios_anon_update` sobre `public.servicios`, `for update`, `to anon`, `using (true)` y `with check (true)`.
- No altera columnas, checks, índices ni funciones, y no crea políticas de `insert` o `delete`.
- `servicios_anon_select`, `servicios_id_valido`, `servicios_precio_positivo` y la semilla siguen en `20261016170000_crear_desempeno_barberos.sql`.
- Las políticas de `barberos` (`select`, `insert`, `update` para `anon`) no se tocaron.

## Lógica de `app/api`

Evidencia:

- `types/barbero.ts` y `types/precio-servicio.ts` declaran los tipos pedidos, sin funciones.
- `validarBarbero` exige objeto plano, recorta `nombre` a 1–120, deja `activo` en `true` si falta, rechaza un `activo` que no sea boolean e ignora claves extra.
- `listarBarberos` e `insertarBarbero` usan `leerEntorno` y `crearCliente`, seleccionan `id, nombre, activo, creado_en, actualizado_en`, ordenan por `nombre` y desempatan por `creado_en` en memoria. Entorno ausente es `entorno_incompleto` antes del cliente. Lista vacía es éxito.
- `GET` y `POST` de `app/api/barberos/route.ts` solo leen el cuerpo y mapean 200, 201, 400 y 503.
- `validarPrecio` acepta solo `corte-clasico`, `arreglo-barba` y `corte-y-barba`, exige exactamente la clave `precio_centavos` y un entero `> 0`. Un id ajeno queda en `entrada_invalida` (400), no en 404.
- `actualizarPrecioServicio` actualiza solo `precio_centavos`, relee la fila, arma `moneda: "PEN"`, traduce 0 filas a `no_encontrado` y el check `servicios_precio_positivo` a `entrada_invalida`.
- `PATCH` de `app/api/servicios/[id]/route.ts` mapea 200, 400, 404 y 503. `GET /api/servicios` no cambió.
- No hay inserción en `servicios` ni borrado de `barberos` en este módulo, ni dependencia nueva.

Nada queda por debajo de 7. No se reabre ninguna parte.
