# Diagrama de citas por día y por horario — backend

## Objetivo

Exponer `GET /api/citas?mes=AAAA-MM` para que el diagrama de `/citas` reciba, ya agregados, los conteos por día del mes y por hora en `America/Lima`, más la hora con más citas. La agregación vive en el servidor. El navegador no lee Supabase.

## Alcance

- Un solo método: `GET` en `app/api/citas/route.ts`.
- Reutilizar `validarMes` (`lib/desempeno/validar-mes.ts`), `leerEntorno` y `crearCliente`.
- Leer `public.citas` (`inicia_en`, `estado`) en el intervalo `[desde, hasta)` que ya arma `validarMes`.
- Contar solo `programada` y `completada`. Agrupar en memoria por fecha civil y por hora de Lima.
- Tipos y reglas fuera de la ruta HTTP.

## Fuera de alcance

- Pantalla `/citas`, `SelectorMes`, barras, textos de eje y el `fetch` del navegador. Eso está en `planifications/diagrama-citas-dia-horario.md`.
- `GET /api/desempeno` y `lib/desempeno/repositorio-desempeno.ts`. No traen día ni hora; no se modifican.
- CRUD de citas, filtro por barbero, semilla de filas, ingresos y ticket.
- Mover `validarMes` de `lib/desempeno`.
- Librerías nuevas.

## Esquema

No hay migración. `public.citas` ya existe en `supabase/migrations/20261016170000_crear_desempeno_barberos.sql`.

Columnas que esta lectura usa, ya presentes:

- `inicia_en timestamptz not null`
- `estado text not null` con check `citas_estado_valido` (`programada`, `completada`, `cancelada`)

RLS ya está activo y `citas_anon_select` permite `select` a `anon` con `using (true)`. El índice existente `citas_barbero_inicia` sobre `(barbero_id, inicia_en)` se deja igual. No se agregan columnas, índices, vistas, funciones ni políticas.

## Suposiciones

- La página de Notion solo tiene el título. El contrato es el del plan de frontend.
- `mes` ausente, `null` o solo espacios es el mes actual de `America/Lima`, porque `validarMes` ya lo resuelve así. `9999-12` y un mes que no cumpla `AAAA-MM` son `mes_invalido`.
- El día es la fecha civil de `inicia_en` en `America/Lima`. La hora es la hora en punto de esa zona: `09` agrupa 09:00–09:59. No se parte la cadena UTC del timestamptz.
- Empate de cantidad: gana la hora más temprana (`00` antes que `01`).
- Mes sin citas contables: todos los días en `0`, `horas` vacío y `horario_pico` `null`.
- `cancelada` se descarta en memoria después del `select`. No se filtra en la consulta.
- Una fila con `estado` distinto de los tres valores del check no cuenta.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/citas-diagrama.ts` | `DiaCitas`, `HoraCitas`, `HorarioPico`, `ErrorCitasDiagrama`, `ResultadoCitasDiagrama`. Sin JSX y sin red. |
| `lib/citas/agrupar-citas.ts` | Fecha y hora de Lima, serie de días, horas con conteo y horario pico. Sin JSX y sin red. |
| `lib/citas/repositorio-citas-diagrama.ts` | Valida el mes, lee `citas` y llama a la agrupación. Sin JSX. |
| `app/api/citas/route.ts` | `GET`. JSON y status. Sin reglas de negocio. |

No se crean `lib/citas/servicio-citas-diagrama.ts`, `clase-barra.ts`, `presentar-eje.ts` ni componentes.

## Tipos

En `types/citas-diagrama.ts`:

```ts
export type DiaCitas = { fecha: string; cantidad: number };
export type HoraCitas = { hora: string; cantidad: number };
export type HorarioPico = { hora: string; cantidad: number };

export type ErrorCitasDiagrama =
  | "mes_invalido"
  | "entorno_incompleto"
  | "supabase_inalcanzable";

export type ResultadoCitasDiagrama =
  | {
      ok: true;
      mes: string;
      dias: DiaCitas[];
      horas: HoraCitas[];
      horario_pico: HorarioPico | null;
    }
  | { ok: false; error: ErrorCitasDiagrama };
```

`fecha` es `AAAA-MM-DD`. `hora` es `00`–`23`, dos dígitos. No existe el código `no_encontrado`.

## Ruta

`app/api/citas/route.ts`

`GET`. Lee `mes` con `new URL(request.url).searchParams.get("mes")` y llama a `leerDiagramaCitas(mes)`.

Respuesta: `Response.json(resultado, { status })`.

| Resultado | Status |
| --- | --- |
| `ok: true` | `200` |
| `mes_invalido` | `400` |
| `entorno_incompleto` | `503` |
| `supabase_inalcanzable` | `503` |

Sin cuerpo de entrada. Sin otros métodos.

## Repositorio

`leerDiagramaCitas(mes: string | null): Promise<ResultadoCitasDiagrama>` en `lib/citas/repositorio-citas-diagrama.ts`.

1. `validarMes(mes)`. Si `ok` es false, devolver `{ ok: false, error: "mes_invalido" }`.
2. `leerEntorno()`. Si es `null`, devolver `{ ok: false, error: "entorno_incompleto" }` sin consultar.
3. `crearCliente(entorno)` y `from("citas").select("inicia_en, estado").gte("inicia_en", intervalo.desde).lt("inicia_en", intervalo.hasta)`.
4. Si `error` del SDK no es `null`, devolver `{ ok: false, error: "supabase_inalcanzable" }`. No incluir el mensaje de Postgres.
5. `agruparCitas(filas, intervalo.mes)` y devolver `{ ok: true, mes: intervalo.mes, dias, horas, horario_pico }`.

`mes` de la respuesta es el mes ya normalizado por `validarMes`, no el query crudo.

## Agrupación

`agruparCitas(filas, mes): { dias, horas, horario_pico }` en `lib/citas/agrupar-citas.ts`.

Entrada de cada fila: `inicia_en: string` y `estado: string`.

1. Quedarse con `estado === "programada"` o `estado === "completada"`.
2. Partir `inicia_en` con `Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" })` para `fecha` (`en-CA` entrega `AAAA-MM-DD`).
3. Partir la hora con otro `Intl.DateTimeFormat("en-US", { timeZone: "America/Lima", hour: "2-digit", hourCycle: "h23" })` y rellenar a dos dígitos. Medianoche es `00`.
4. Ignorar una fila cuya `fecha` no empiece por `mes` (`AAAA-MM-`). El filtro `gte`/`lt` ya acota el intervalo; esta comprobación cubre un borde de zona.
5. Días: un elemento por cada día civil del mes, de `01` al último, en orden, aunque `cantidad` sea `0`. El último día sale del calendario gregoriano de ese `AAAA-MM` (febrero 28 o 29). `fecha` es `${mes}-${dd}`.
6. Horas: solo horas con `cantidad > 0`, orden `00` … `23`.
7. `horario_pico`: la hora de mayor `cantidad`. Si empatan, la menor en orden lexicográfico de `hora`. Si no hay horas, `null`.

## Contrato

Éxito `200`:

```json
{
  "ok": true,
  "mes": "2026-10",
  "dias": [{ "fecha": "2026-10-01", "cantidad": 0 }],
  "horas": [{ "hora": "09", "cantidad": 4 }],
  "horario_pico": { "hora": "09", "cantidad": 4 }
}
```

`dias.length` es 28, 29, 30 o 31 según el mes. `horas` no incluye ceros. `horario_pico` es `null` cuando no hay citas contables.

Errores:

```json
{ "ok": false, "error": "mes_invalido" }
```

Mismos cuerpos para `entorno_incompleto` y `supabase_inalcanzable`.

## Criterios de aceptación — migraciones

- No se crea archivo en `supabase/migrations`.
- `citas` conserva las columnas, el check, las FK, el índice y las políticas actuales.

## Criterios de aceptación — lógica

- `GET /api/citas` sin `mes` responde `200` con el mes actual de Lima y un `dias` por cada día de ese mes.
- `GET /api/citas?mes=2026-13` y `?mes=9999-12` responden `400` con `mes_invalido`.
- Dos citas el día 3 a las 09:10 y 09:40 (Lima) y una el día 3 a las 15:00, estados `programada` o `completada`, producen cantidad `3` en `2026-10-03` (si el mes es octubre 2026), `horas` `09` con `2` y `15` con `1`, y `horario_pico` `{ "hora": "09", "cantidad": 2 }`.
- Una `cancelada` en ese mismo tramo no suma. Una cita con `inicia_en` fuera de `[desde, hasta)` no entra.
- Dos horas con la misma cantidad máxima: `horario_pico` es la más temprana.
- Cero citas contables: cada día en `0`, `horas` `[]`, `horario_pico` `null`, `ok: true`.
- Entorno Supabase incompleto: `503` y `entorno_incompleto`, sin consultar.
- Error del SDK: `503` y `supabase_inalcanzable`, sin texto de Postgres.
- La ruta no emite `no_encontrado`.
