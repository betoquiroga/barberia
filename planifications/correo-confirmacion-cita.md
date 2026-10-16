# Correo de confirmación al agendar una cita

## Objetivo

Cuando alguien agenda una cita, persistirla en `public.citas` y enviarle un correo de confirmación con los datos de esa cita. El envío ocurre en el servidor, en el mismo `POST` que crea la cita. El navegador no habla con el proveedor de correo ni con Supabase.

## Alcance

- Columnas de quien reserva en `public.citas` y `barbero_id` opcional.
- `POST /api/citas` que valida, inserta y envía el correo.
- Tipos, validación, repositorio y envío fuera del handler HTTP.
- `GET /api/citas` se queda igual.

## Fuera de alcance

- Cambiar el formulario de `#reserva`, `validarReserva` ni ningún componente. Hoy ese formulario no llama a la red y no pide correo.
- Elegir barbero, cupos, solapes, horario de atención o precio.
- Alta en `public.clientes`, login, cola de reintentos y plantillas HTML.
- `GET /api/desempeno` y el diagrama. Siguen leyendo `inicia_en` y `estado`.
- Instalar dependencias. El envío usa `fetch` contra la API HTTP de Resend.

## Estado actual

- `public.citas` (`supabase/migrations/20261016170000_crear_desempeno_barberos.sql`): `id`, `barbero_id` obligatorio, `servicio_id`, `inicia_en`, `estado` (`programada`, `completada`, `cancelada`), `creado_en`. RLS activo. `anon` ya puede `select`, `insert` y `update`.
- `public.servicios` tiene `corte-clasico`, `arreglo-barba` y `corte-y-barba`.
- `public.barberos` puede estar vacía. Un `barbero_id` obligatorio impediría agendar.
- `app/api/citas/route.ts` solo tiene `GET`.
- `public.clientes.correo` es el correo del CRUD, no el de quien reserva en la landing.
- No hay librería de correo. `@supabase/supabase-js` ya está; no se agrega otra.

## Suposiciones

- La página de Notion solo tiene el título. «El usuario que agendó» es quien envía el `POST`, y su dirección llega en `correo`.
- No se reutiliza `clientes`: la reserva no exige que esa persona ya exista ahí.
- `barbero_id` pasa a ser nulo. La cita pública no elige barbero. El diagrama no usa esa columna.
- `fecha` (`AAAA-MM-DD`) y `hora` (`HH:MM`) son hora civil de `America/Lima`. Se guardan en `inicia_en` como timestamptz de ese instante. No se usa la zona del servidor.
- La fecha puede ser hoy o futura en `America/Lima`. La hora es cualquier `00:00`–`23:59`.
- El estado inicial es `programada`.
- El proveedor es Resend (`POST https://api.resend.com/emails`). Variables nuevas, solo en servidor: `RESEND_API_KEY` y `CORREO_REMITENTE` (dirección ya verificada en Resend). No van al cliente ni a `leerEntorno`.
- Si Resend no acepta el mensaje, la cita ya insertada se conserva. La respuesta dice que el correo no salió.
- Un mismo correo puede tener varias citas. No hay idempotencia.
- La nota vacía se guarda como `''` y no se imprime en el correo.

## Migración

Un archivo nuevo, sin tocar las migraciones ya aplicadas:

`supabase/migrations/20261016223000_citas_datos_de_quien_reserva.sql`

```sql
alter table public.citas
  alter column barbero_id drop not null;

alter table public.citas
  add column nombre text not null,
  add column correo text not null,
  add column telefono text not null,
  add column nota text not null default '';

alter table public.citas
  add constraint citas_nombre_largo check (char_length(btrim(nombre)) between 1 and 120),
  add constraint citas_telefono_largo check (char_length(btrim(telefono)) between 7 and 20),
  add constraint citas_nota_larga check (char_length(nota) <= 300),
  add constraint citas_correo_minusculas check (correo = lower(correo)),
  add constraint citas_correo_forma check (correo ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');

create index citas_correo on public.citas (correo);
```

No se crean políticas nuevas: `citas_anon_insert` ya tiene `with check (true)`. No se cambia `citas_estado_valido` ni `citas_barbero_inicia`. El índice `citas_correo` no es único.

`supabase db push` (o `apply_migration` con ese SQL) deja la migración lista en el proyecto remoto. No se vuelve a aplicar `20261016170000`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/cita-alta.ts` | Entrada, cita creada, errores y resultado. Sin JSX y sin red. |
| `lib/citas/validar-alta-cita.ts` | Única validación del cuerpo. Sin JSX y sin red. |
| `lib/citas/repositorio-alta-cita.ts` | Entorno, servicio, instante de Lima, insert y llamada al correo. Sin JSX. |
| `lib/correos/enviar-confirmacion-cita.ts` | `fetch` a Resend y texto del mensaje. Sin Supabase y sin JSX. |
| `app/api/citas/route.ts` | Suma `POST`. JSON y status. Sin reglas de negocio. |

No se crea `app/api/reservas`. No se modifica `lib/reservas/validar-reserva.ts` ni `lib/citas/repositorio-citas-diagrama.ts`.

## Tipos

En `types/cita-alta.ts`:

```ts
export type EntradaAltaCita = {
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
};

export type CitaCreada = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicio_id: string;
  servicio_nombre: string;
  fecha: string;
  hora: string;
  nota: string;
  estado: "programada";
  correo_enviado: boolean;
};

export type ErrorAltaCita =
  | "entrada_invalida"
  | "servicio_desconocido"
  | "entorno_incompleto"
  | "supabase_inalcanzable"
  | "correo_no_enviado";

export type ResultadoAltaCita =
  | { ok: true; cita: CitaCreada }
  | { ok: false; error: ErrorAltaCita; cita_id?: string };
```

`cita_id` solo acompaña a `correo_no_enviado`.

## Ruta

`app/api/citas/route.ts`

`POST`. Lee el JSON con el mismo `try/catch` de `app/api/clientes/route.ts` (cuerpo inválido → `null`). Llama a `crearCita(cuerpo)`.

| Resultado | Status |
| --- | --- |
| `ok: true` | `201` |
| `entrada_invalida` | `400` |
| `servicio_desconocido` | `400` |
| `correo_no_enviado` | `502` |
| `entorno_incompleto` | `503` |
| `supabase_inalcanzable` | `503` |

`GET` no cambia: mismos query, cuerpos y `200` / `400` / `503`.

## Validación

`validarAltaCita(cuerpo: unknown): EntradaAltaCita | null` en `lib/citas/validar-alta-cita.ts`.

El cuerpo es un objeto plano. Tras `trim`:

| Campo | Regla |
| --- | --- |
| `nombre` | 1 a 120 caracteres |
| `correo` | minúsculas, 1 a 254, misma forma que `CORREO` en `lib/clientes/validar-cliente.ts` |
| `telefono` | 7 a 20, solo dígitos, espacios, `+` y `-` |
| `servicioId` | `corte-clasico`, `arreglo-barba` o `corte-y-barba` |
| `fecha` | `AAAA-MM-DD` real y mayor o igual que hoy en `America/Lima` |
| `hora` | `HH:MM` de `00:00` a `23:59` |
| `nota` | ausente, `null` o string; tras recortar, como máximo 300. Vacía queda `''` |

Cualquier otro fallo devuelve `null`. El handler lo traduce a `entrada_invalida`.

Hoy en Lima se calcula con `Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" })`.

## Repositorio

`crearCita(cuerpo: unknown): Promise<ResultadoAltaCita>` en `lib/citas/repositorio-alta-cita.ts`.

1. `validarAltaCita`. Si es `null`, `{ ok: false, error: "entrada_invalida" }`.
2. `leerEntorno()`. Si es `null`, o faltan `RESEND_API_KEY` o `CORREO_REMITENTE` tras `trim`, `{ ok: false, error: "entorno_incompleto" }` sin insertar y sin llamar a Resend.
3. `crearCliente(entorno)` y `from("servicios").select("id, nombre").eq("id", servicioId).maybeSingle()`.
4. Error del SDK o fila nula: si el error existe, `supabase_inalcanzable`; si no hay fila, `servicio_desconocido`.
5. Armar `inicia_en`: interpretar `fecha` y `hora` como reloj de Lima y pasar a ISO UTC. Lima no tiene horario de verano; el desfase fijo es `-05:00`. Ejemplo: `2026-10-20` y `15:30` → `2026-10-20T20:30:00.000Z`.
6. `insert` en `citas` con `nombre`, `correo`, `telefono`, `nota`, `servicio_id`, `inicia_en` y `estado: "programada"`. No enviar `barbero_id`. Pedir `id` de vuelta.
7. Si el insert falla, `{ ok: false, error: "supabase_inalcanzable" }`. No incluir el mensaje de Postgres.
8. Llamar a `enviarConfirmacionCita` con la cita y el nombre del servicio.
9. Si el envío responde `ok: true`, `{ ok: true, cita }` con `correo_enviado: true`.
10. Si responde `ok: false`, `{ ok: false, error: "correo_no_enviado", cita_id }` con el `id` ya guardado. No borrar la fila y no reintentar.

## Correo

`enviarConfirmacionCita(cita): Promise<{ ok: true } | { ok: false }>` en `lib/correos/enviar-confirmacion-cita.ts`.

`POST https://api.resend.com/emails` con `Authorization: Bearer ${RESEND_API_KEY}`, `Content-Type: application/json` y este cuerpo:

- `from`: `CORREO_REMITENTE`
- `to`: `[cita.correo]`
- `subject`: `Confirmación de tu cita`
- `text`: líneas en español, en este orden: saludo con `nombre`; servicio (`servicio_nombre`); fecha `AAAA-MM-DD`; hora `HH:MM`; zona `America/Lima`; estado `programada`. Si `nota` no está vacía, una línea `Nota: …`.

`ok: true` solo si el status HTTP está entre 200 y 299. Cualquier fallo de red o status distinto es `ok: false`. No se registra la clave ni el cuerpo de error de Resend.

## Contratos

Entrada `POST /api/citas`:

```json
{
  "nombre": "Ana Pérez",
  "correo": "ana@ejemplo.com",
  "telefono": "999888777",
  "servicioId": "corte-clasico",
  "fecha": "2026-10-20",
  "hora": "15:30",
  "nota": "Tijera"
}
```

`nota` puede omitirse.

Éxito `201`:

```json
{
  "ok": true,
  "cita": {
    "id": "uuid",
    "nombre": "Ana Pérez",
    "correo": "ana@ejemplo.com",
    "telefono": "999888777",
    "servicio_id": "corte-clasico",
    "servicio_nombre": "Corte clásico",
    "fecha": "2026-10-20",
    "hora": "15:30",
    "nota": "Tijera",
    "estado": "programada",
    "correo_enviado": true
  }
}
```

Errores:

```json
{ "ok": false, "error": "entrada_invalida" }
```

El mismo sobre para `servicio_desconocido`, `entorno_incompleto` y `supabase_inalcanzable`.

Cuando la cita quedó guardada y Resend falló, `502`:

```json
{ "ok": false, "error": "correo_no_enviado", "cita_id": "uuid" }
```

El mensaje que recibe la persona contiene su nombre, el nombre del servicio, la fecha, la hora, `America/Lima` y `programada`.

## Criterios de aceptación — migraciones

- `public.citas.barbero_id` admite `null` y sigue referenciando `public.barberos`.
- Existen `nombre`, `correo`, `telefono` y `nota`, con los checks de largo, minúsculas y forma del correo.
- El índice `citas_correo` existe y no es único.
- Siguen `citas_estado_valido`, `citas_barbero_inicia` y las tres políticas `citas_anon_*`.
- `GET /api/citas` no exige las columnas nuevas: su `select` sigue siendo `inicia_en, estado`.
- La migración aplicada es `20261016223000` y no se reejecuta `20261016170000`.

## Criterios de aceptación — lógica de negocio

- `POST` con el ejemplo de arriba, entorno completo y Resend en 2xx responde `201`, inserta una fila `programada` con `barbero_id` nulo e `inicia_en` `2026-10-20T20:30:00.000Z`, y el correo llega a `ana@ejemplo.com` con servicio, fecha, hora y zona.
- `correo` `Ana@Ejemplo.com` se guarda `ana@ejemplo.com`.
- Sin `nota`, la columna queda `''` y el texto del correo no lleva línea de nota.
- Fecha de ayer en Lima, hora `24:00`, correo sin `@`, teléfono corto o `servicioId` fuera de los tres ids responden `400` y `entrada_invalida`, sin insert y sin `fetch` a Resend.
- `servicioId` permitido que no esté en `public.servicios` responde `400` y `servicio_desconocido`.
- Sin `RESEND_API_KEY`, sin `CORREO_REMITENTE` o con `leerEntorno()` en `null`, responde `503` y `entorno_incompleto`, sin fila nueva.
- Si el insert falla, `503` y `supabase_inalcanzable`.
- Si el insert funciona y Resend no, `502`, `correo_no_enviado` y `cita_id` de la fila que quedó.
- `GET /api/citas?mes=2026-10` cuenta esa cita en el día y la hora de Lima que corresponden.
