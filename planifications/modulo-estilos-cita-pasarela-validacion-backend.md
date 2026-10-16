# Validación backend — estilos, cita y pasarela

Plan: `planifications/modulo-estilos-cita-pasarela.md`

## Migraciones

Puntaje: **10**

Veredicto: **aprobado**

Evidencia:

- `supabase/migrations/20261016240000_catalogo_cliente_y_pagos.sql` es el archivo nuevo del plan y el SQL coincide: `descripcion` en `public.servicios` (not null, default `''`, check de 240, textos de los tres estilos, drop default), tabla `public.pagos` con `cita_id` único y `on delete restrict`, monto positivo, moneda `PEN`, estados `pendiente`/`pagado`/`fallido`, referencia 1–120 o null, índice `pagos_estado`, trigger `pagos_antes_de_actualizar` y función `pagos_marcar_actualizado` con `search_path = ''`.
- RLS de `pagos` habilita `anon` en select, insert y update. No hay política de delete.
- No se altera `precio_centavos`, no se crea otra tabla de estilos y no se toca `servicios_ofrecidos`. El archivo no modifica migraciones anteriores.

## Lógica de negocio

Puntaje: **9**

Veredicto: **aprobado**

Evidencia:

- `GET /api/servicios` (`app/api/servicios/route.ts`, `lib/servicios/repositorio-catalogo.ts`, `types/catalogo-servicio.ts`) lee `id, nombre, descripcion, precio_centavos`, fija el orden `corte-clasico`, `arreglo-barba`, `corte-y-barba`, pone `moneda: "PEN"` y responde `503` con `entorno_incompleto` o `supabase_inalcanzable` si falta el entorno o alguna de las tres filas.
- `POST /api/citas` sigue siendo el alta. `crearCita` exige `PASARELA_URL_BASE` junto con Supabase, `RESEND_API_KEY` y `CORREO_REMITENTE` antes de insertar. Lee `precio_centavos` en la misma consulta del servicio e inserta el pago (`cita_id`, monto, `PEN`, `pendiente`, `referencia_pasarela` null) antes del correo.
- Si el insert del pago falla, no se envía el correo y la ruta responde `502` con `pago_no_creado` y `cita_id`. El `201` incluye `pago.estado = pendiente`, el monto y `url_pasarela` armada como `${PASARELA_URL_BASE}?pago=<uuid>` sin persistirla. `correo_no_enviado` sigue en `502` y añade `pago_id`.
- `GET /api/pagos/[id]` devuelve el pago y pone `url_pasarela` solo si el estado es `pendiente`; en otro estado el campo es `null`. UUID inválido o fila ausente → `404` `no_encontrado`. Entorno o Supabase → `503`.
- `POST /api/pagos/webhook` compara el header `x-pasarela-secreto` con `PASARELA_SECRETO` (`401` `no_autorizado` si falta o no coincide). El cuerpo exige uuid, estado `pagado` o `fallido` y referencia recortada de 1 a 120 (`400` `entrada_invalida`). Pago ausente → `404`. Mismo estado → `200` sin update. `pagado` y pedido `fallido` → `409` `pago_ya_cerrado`. `fallido` y pedido `pagado`, o `pendiente`, actualizan estado y referencia. No cambia `citas.estado`.
- `GET` de `app/api/citas/route.ts` conserva el diagrama. No hay ruta `reservas` ni `estilos`, ni dependencia nueva de pasarela.

El punto que no llega a 10: `insertarPagoCita` usa `urlPasarela(citaId)` solo como prueba de que existe `PASARELA_URL_BASE`. El alta ya rechaza ese caso con `entorno_incompleto` antes de insertar la cita, así que el contrato del plan se cumple.
