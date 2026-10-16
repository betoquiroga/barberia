# Módulo de estilos, cita y pasarela de pago

## Objetivo

Que el cliente obtenga por API los estilos de corte con su valor, agende una cita y reciba una URL de pasarela de pago asociada a esa cita. La pasarela externa no se implementa: el backend persiste el pago y entrega el contrato para redirigir y confirmar.

## Alcance

- Lectura del catálogo que ya usa la cita: `public.servicios`.
- Descripción de cada estilo en esa tabla.
- Un pago por cita, con monto tomado del precio del servicio, estado y URL de pasarela.
- `GET` del catálogo, extensión de `POST /api/citas`, consulta del pago y webhook de confirmación.

## Fuera de alcance

- Pantallas, redirección en el navegador y el formulario de `#reserva`.
- Integrar un SDK (Wompi, Mercado Pago, Stripe). No se instala ninguna librería. La URL sale de la variable `PASARELA_URL_BASE`.
- `public.servicios_ofrecidos`, `public.servidores` y `/api/servicios-ofrecidos`. Ese CRUD es de costos y personal, con otros identificadores.
- Cambiar `precio_centavos`, el cálculo de `GET /api/desempeno` ni el diagrama de `GET /api/citas`.
- Elegir barbero, cupos, solapes o horario de atención.
- Reembolsos, varios intentos de pago por cita y cobro parcial.

## Ya cubierto

- `POST /api/citas` valida, inserta en `public.citas` con estado `programada` y envía el correo. No se crea otra ruta de agenda.
- `public.servicios` ya tiene los tres estilos y su precio: `corte-clasico` (2500), `arreglo-barba` (1500), `corte-y-barba` (3500), en centavos. `citas.servicio_id` apunta ahí.
- `lib/landing/servicios.ts` muestra otros números (18000, 12000, 28000) solo en la landing. No es la fuente del agendado. Este plan no los copia a la base.
- El correo de confirmación sigue igual. No incluye el enlace de pago.

## Suposiciones

- La página de Notion está en blanco. El título es el requerimiento.
- «Estilos y valores» son las filas de `public.servicios`. El valor que ve el cliente es `precio_centavos` (entero, moneda `PEN`, sin dividir en la API).
- La pasarela es un sitio externo. `PASARELA_URL_BASE` es una URL absoluta sin query. La URL entregada es `${PASARELA_URL_BASE}?pago=<uuid>`.
- `PASARELA_SECRETO` autentica el webhook. Comparación de strings en el servidor. No se guarda el secreto.
- Un pago por cita. Si la cita se creó y el pago no, la cita permanece y la respuesta indica el fallo, igual que cuando el correo no sale.
- El webhook puede repetirse. Un pago ya `pagado` no vuelve a `pendiente` ni a `fallido`.
- La descripción de cada estilo es la de la landing, solo como texto en la base.

## Migración

Archivo nuevo: `supabase/migrations/20261016240000_catalogo_cliente_y_pagos.sql`.

No se altera ninguna migración ya escrita.

```sql
alter table public.servicios
  add column descripcion text not null default '';

alter table public.servicios
  add constraint servicios_descripcion_larga check (char_length(descripcion) <= 240);

update public.servicios
set descripcion = case id
  when 'corte-clasico' then 'Corte de cabello con tijera o máquina.'
  when 'arreglo-barba' then 'Perfilado y arreglo de barba.'
  when 'corte-y-barba' then 'Corte de cabello y arreglo de barba en la misma visita.'
end
where id in ('corte-clasico', 'arreglo-barba', 'corte-y-barba');

alter table public.servicios
  alter column descripcion drop default;

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  cita_id uuid not null unique references public.citas (id) on delete restrict,
  monto_centavos integer not null,
  moneda text not null default 'PEN',
  estado text not null default 'pendiente',
  referencia_pasarela text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint pagos_monto_positivo check (monto_centavos > 0),
  constraint pagos_moneda_pen check (moneda = 'PEN'),
  constraint pagos_estado_valido check (estado in ('pendiente', 'pagado', 'fallido')),
  constraint pagos_referencia_larga check (
    referencia_pasarela is null or char_length(btrim(referencia_pasarela)) between 1 and 120
  )
);

create index pagos_estado on public.pagos (estado);

create or replace function public.pagos_marcar_actualizado()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado_en = pg_catalog.now();
  return new;
end;
$$;

create trigger pagos_antes_de_actualizar
before update on public.pagos
for each row
execute function public.pagos_marcar_actualizado();

alter table public.pagos enable row level security;

create policy pagos_anon_select
on public.pagos
for select
to anon
using (true);

create policy pagos_anon_insert
on public.pagos
for insert
to anon
with check (true);

create policy pagos_anon_update
on public.pagos
for update
to anon
using (true)
with check (true);
```

No hay política de `delete` sobre `pagos`. `servicios_anon_select` ya existe; no se agregan insert ni update de servicios para el cliente.

`supabase db push` sube solo este archivo.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/catalogo-servicio.ts` | Estilo público y resultado de la lectura. |
| `lib/servicios/repositorio-catalogo.ts` | Lee `public.servicios`. Sin JSX. |
| `app/api/servicios/route.ts` | Solo `GET`. JSON y status. |
| `types/pago.ts` | Pago, webhook y errores. |
| `lib/pagos/validar-webhook-pago.ts` | Valida el cuerpo del webhook. Sin red. |
| `lib/pagos/repositorio-pago.ts` | Inserta el pago de una cita, arma la URL, lee un pago y aplica el webhook. |
| `app/api/pagos/[id]/route.ts` | `GET` de un pago. |
| `app/api/pagos/webhook/route.ts` | `POST` de confirmación. |
| `types/cita-alta.ts` | Suma el pago a la cita creada y el error `pago_no_creado`. |
| `lib/citas/repositorio-alta-cita.ts` | Tras insertar la cita y antes del correo, crea el pago y adjunta la URL. |
| `app/api/citas/route.ts` | Mapea `pago_no_creado` a 502. El `POST` sigue siendo el alta. |

No se crea `app/api/reservas` ni `app/api/estilos`. No se toca `validar-alta-cita.ts`: los tres `id` de servicio siguen igual.

## Catálogo

`GET /api/servicios`

Sin cuerpo ni query.

`200`:

```json
{
  "ok": true,
  "servicios": [
    {
      "id": "corte-clasico",
      "nombre": "Corte clásico",
      "descripcion": "Corte de cabello con tijera o máquina.",
      "precio_centavos": 2500,
      "moneda": "PEN"
    }
  ]
}
```

Orden fijo: `corte-clasico`, `arreglo-barba`, `corte-y-barba`.

Errores: `entorno_incompleto` y `supabase_inalcanzable` → `503`, cuerpo `{ "ok": false, "error": "..." }`.

La lista vacía no es un caso válido: la migración ya insertó las tres filas. Si faltara alguna, se responde `503` con `supabase_inalcanzable`.

## Agendar y llevar a la pasarela

`POST /api/citas` conserva el cuerpo actual (`nombre`, `correo`, `telefono`, `servicioId`, `fecha`, `hora`, `nota`) y los errores ya definidos.

Después de insertar la cita, el repositorio lee `precio_centavos` del servicio (en la misma consulta que hoy pide `id, nombre`) e inserta en `pagos`:

- `cita_id`: id de la cita
- `monto_centavos`: ese precio
- `moneda`: `PEN`
- `estado`: `pendiente`
- `referencia_pasarela`: null

Si falta `PASARELA_URL_BASE` (tras recortar), la respuesta es `entorno_incompleto` y no se inserta la cita. Se comprueba junto con Supabase, `RESEND_API_KEY` y `CORREO_REMITENTE`.

Si el insert del pago falla, no se envía el correo. `502` y `{ "ok": false, "error": "pago_no_creado", "cita_id": "<uuid>" }`.

Si el pago queda creado, se envía el correo como hoy. `201`:

```json
{
  "ok": true,
  "cita": {
    "id": "<uuid>",
    "nombre": "...",
    "correo": "...",
    "telefono": "...",
    "servicio_id": "corte-clasico",
    "servicio_nombre": "Corte clásico",
    "fecha": "2026-10-20",
    "hora": "15:30",
    "nota": "",
    "estado": "programada",
    "correo_enviado": true,
    "pago": {
      "id": "<uuid>",
      "monto_centavos": 2500,
      "moneda": "PEN",
      "estado": "pendiente",
      "url_pasarela": "https://pasarela.ejemplo/cobro?pago=<uuid>"
    }
  }
}
```

`url_pasarela` no se guarda. Se arma al responder y al hacer `GET` del pago mientras siga `pendiente`.

`correo_no_enviado` sigue en `502` e incluye `cita_id`. En ese caso el pago ya existe; el cuerpo añade `pago_id`.

## Consulta y confirmación

`GET /api/pagos/[id]`

`200`: `{ "ok": true, "pago": { "id", "cita_id", "monto_centavos", "moneda", "estado", "url_pasarela" } }`.

`url_pasarela` va solo si `estado` es `pendiente`. En `pagado` o `fallido` el campo es `null`.

`404` si el id no es un uuid o no hay fila: `{ "ok": false, "error": "no_encontrado" }`.

`503` para `entorno_incompleto` y `supabase_inalcanzable`.

`POST /api/pagos/webhook`

Header `x-pasarela-secreto` igual a `PASARELA_SECRETO`. Si falta o no coincide: `401`, `{ "ok": false, "error": "no_autorizado" }`.

Cuerpo:

```json
{
  "pagoId": "<uuid>",
  "estado": "pagado",
  "referencia": "ref-externa"
}
```

`estado` solo `pagado` o `fallido`. `referencia` es texto recortado de 1 a 120 caracteres.

Reglas:

- Pago inexistente → `404`, `no_encontrado`.
- Cuerpo inválido → `400`, `entrada_invalida`.
- Estado actual `pendiente` → se guarda el estado nuevo y `referencia_pasarela`. `200`, `{ "ok": true, "pago_id", "estado" }`.
- Estado actual ya igual al pedido → `200` con el mismo cuerpo, sin otro update.
- Estado actual `pagado` y el pedido es `fallido` → `409`, `{ "ok": false, "error": "pago_ya_cerrado" }`.
- Estado actual `fallido` y el pedido es `pagado` → se actualiza a `pagado` (un reintento exitoso cierra el cobro).

No se cambia `citas.estado` al pagar. La cita sigue `programada` hasta el flujo de desempeño.

## Criterios de aceptación — migración

- `public.servicios` gana `descripcion` y las tres filas tienen el texto de la tabla de suposiciones. `precio_centavos` no cambia.
- Existe `public.pagos` con un `cita_id` único, montos positivos, moneda `PEN` y estados `pendiente`, `pagado`, `fallido`.
- RLS de `pagos` permite a `anon` select, insert y update. No hay delete.
- No se creó otra tabla de estilos ni se modificó `servicios_ofrecidos`.

## Criterios de aceptación — lógica

- `GET /api/servicios` devuelve los tres estilos con nombre, descripción, `precio_centavos` y `moneda`.
- `POST /api/citas` sigue creando la cita. Con entorno completo, la respuesta `201` trae `pago.estado = pendiente`, el monto del servicio y `url_pasarela` con el id del pago.
- Sin `PASARELA_URL_BASE` no se inserta la cita y el error es `entorno_incompleto`.
- Si el pago no se inserta, no sale el correo y el error es `pago_no_creado` con `cita_id`.
- `GET /api/pagos/[id]` devuelve el pago. La URL solo aparece en `pendiente`.
- El webhook sin secreto responde `401`. Con secreto, pasa de `pendiente` a `pagado` o `fallido` y guarda la referencia. Un segundo aviso idéntico responde `200` sin cambiar el cierre. `fallido` después de `pagado` responde `409`.
- `GET /api/citas` y `GET /api/desempeno` no cambian de contrato.
- No hay dependencias nuevas. Yarn no hace falta para este cambio.
