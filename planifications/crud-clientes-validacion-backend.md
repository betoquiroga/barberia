# Validación backend — CRUD de clientes

Plan: `planifications/crud-clientes.md`

## Migraciones

**Puntaje: 10**

**Veredicto: aprobado**

Evidencia:

- Solo existe `supabase/migrations/20261016150000_crear_tabla_clientes.sql`.
- `public.clientes` tiene `id`, `nombre`, `correo`, `telefono`, `detalle`, `creado_en` y `actualizado_en`, con los defaults y `not null` del plan.
- Checks `clientes_nombre_largo`, `clientes_telefono_largo` y `clientes_detalle_largo`. El check extra `clientes_correo_minusculas` cumple “correo guardado en minúsculas”.
- Índice único `clientes_correo_unico`. Sin FKs ni otras tablas.
- Función `public.clientes_marcar_actualizado()` y trigger `clientes_antes_de_actualizar` `before update`.
- RLS activo. Políticas `clientes_anon_select`, `clientes_anon_insert`, `clientes_anon_update` y `clientes_anon_delete` para `anon`, con `using (true)` y `with check (true)` según el comando. No hay políticas para `authenticated`.

## Lógica de negocio

**Puntaje: 10**

**Veredicto: aprobado**

Evidencia:

- Sin dependencias nuevas: `package.json` sigue con `@supabase/supabase-js` ya previsto.
- Tipos solo en `types/cliente.ts`: `Cliente`, `EntradaCliente`, `ErrorCliente`, `ResultadoClientes`, `ResultadoCliente`, `ResultadoBorrado`.
- `lib/clientes/validar-cliente.ts` normaliza sin red: objeto, nombre 1–120, correo en minúsculas con el regex y tope 254, teléfono 7–20 con al menos 7 dígitos, detalle vacío u opcional hasta 500. Campos extra se ignoran. Fallo como `null`, que el repositorio traduce a `entrada_invalida`.
- `lib/clientes/repositorio-clientes.ts` usa `leerEntorno` y `crearCliente`. Entorno nulo devuelve `entorno_incompleto` sin red. Id no UUID es `no_encontrado` sin consultar. Listado con todas las columnas y `creado_en` descendente. Alta y actualización mapean `23505` a `correo_duplicado` y el resto del SDK a `supabase_inalcanzable`. Borrado exitoso es `{ ok: true }`.
- `app/api/clientes/route.ts`: `GET` 200 / `POST` 201, y 400, 409, 503.
- `app/api/clientes/[id]/route.ts`: `GET` y `PATCH` 200, `DELETE` 200, y 400, 404, 409, 503. Cuerpo de error `{ ok: false, error }`. Los handlers solo leen el cuerpo y mapean el status.
