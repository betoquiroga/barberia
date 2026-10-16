# Diagrama de citas por día y por horario

## Objetivo

Una pantalla en `/citas` para que el barbero vea, en un mes, cuántas citas caen en cada día y en qué hora del día se concentran. El diagrama son barras hechas con `div` y clases de Tailwind. El navegador no llama a Supabase ni agrega filas.

## Alcance

- Lectura `GET /api/citas?mes=AAAA-MM` que reutiliza `validarMes`, `crearCliente`, `leerEntorno` y la tabla `citas` (`inicia_en`, `estado`).
- Agregación en el servidor, en `America/Lima`, de días del mes y de horas `00`–`23`.
- Ruta `/citas` con el `SelectorMes` ya existente, dos diagramas y el horario pico.
- Estados de carga, error, mes sin citas y listo.
- Reutilizar `SelectorMes`, `mesAnterior` / `mesSiguiente` y `mensajeErrorDesempeno`. Los errores de esta lectura son los mismos códigos salvo `no_encontrado`, que esta ruta no emite.

## Fuera de alcance

- Cambiar `GET /api/desempeno`, el repositorio de desempeño, el formulario de reserva, la landing, `/clientes` y `/desempeno`.
- CRUD de citas, filtro por barbero, cancelar, y sembrar filas.
- Instalar librerías. `package.json` no tiene gráficas ni íconos: no se instala ninguna, no hay SVG y no hay CSS propio ni `style` en línea.
- Enlace nuevo en la landing. Se entra por `/citas`.
- Commit o despliegue.

## Suposiciones

- La página de Notion solo trae el título. La vista es operativa, en `/citas`, tema oscuro igual que `/desempeno`.
- `GET /api/desempeno` no sirve: sus filas no traen día ni hora. Hace falta esta lectura. No se duplica la agregación de ingresos.
- Cuenta una cita si `estado` es `programada` o `completada`. `cancelada` no entra.
- El mes vacío o ausente es el mes actual de `America/Lima`, igual que desempeño. `9999-12` sigue siendo `mes_invalido`.
- El día es la fecha civil de `inicia_en` en `America/Lima`. La hora es la hora en punto de esa zona (`08` agrupa 08:00–08:59).
- El diagrama de días lista todos los días del mes, también los de cero, para que se vea el hueco. El de horas lista solo horas con al menos una cita, ordenadas de `00` a `23`.
- El horario con más citas es la hora de mayor conteo. Si hay empate, gana la hora más temprana. Si el mes no tiene citas contables, no hay horario pico.
- La primera carga llama `GET /api/citas` sin query si la URL no trae `mes`. Cambiar el mes hace `router.replace` a `/citas?mes=AAAA-MM` mediante `SelectorMes` y `ruta={(mes) => "/citas?mes=" + mes}`.
- Red caída o JSON irreconocible se tratan como `supabase_inalcanzable`.
- El ancho de cada barra es una de doce clases Tailwind (`w-0`, `w-1/12` … `w-11/12`, `w-full`), calculada en `lib/citas/clase-barra.ts` con el conteo partido el máximo de esa serie. Cero es `w-0`. El máximo es `w-full`.

## Contrato

`GET` sin cuerpo. `cache: "no-store"`.

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

`dias` tiene un elemento por cada día del mes, de `01` al último, en orden. `fecha` es `AAAA-MM-DD`. `horas` omite cantidad `0`. `horario_pico` es `null` si no hay citas contables.

Errores `{ ok: false, error }`: `400 mes_invalido`, `503 entorno_incompleto` o `supabase_inalcanzable`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/citas-diagrama.ts` | `DiaCitas`, `HoraCitas`, `HorarioPico`, `ErrorCitasDiagrama`, `ResultadoCitasDiagrama`. Sin JSX ni red. |
| `lib/citas/agrupar-citas.ts` | Parte `inicia_en` en fecha y hora de Lima, arma `dias`, `horas` y `horario_pico`. Sin JSX ni red. |
| `lib/citas/repositorio-citas-diagrama.ts` | Lee `citas` del intervalo de `validarMes` y llama a la agrupación. Sin JSX. |
| `lib/citas/servicio-citas-diagrama.ts` | Único `fetch` del módulo en el navegador. Sin JSX. |
| `lib/citas/clase-barra.ts` | Ratio a clase Tailwind de ancho. Sin JSX ni red. |
| `lib/citas/presentar-eje.ts` | Fecha `AAAA-MM-DD` a «1 oct» y hora `HH` a «09:00». Sin JSX ni red. |
| `app/api/citas/route.ts` | `GET`. Traduce el resultado a JSON y status. |
| `app/citas/page.tsx` | Server Component. Lee `searchParams.mes` y renderiza el panel. Sin fetch. |
| `components/citas/panel-citas.tsx` | Client Component. Carga, mes, error y reintento. |
| `components/citas/diagrama-dias.tsx` | Título y lista de días, o el vacío. Sin fetch. |
| `components/citas/diagrama-horas.tsx` | Título, horario pico y lista de horas. Sin fetch. |
| `components/citas/fila-barra.tsx` | Etiqueta, número y barra. Sin fetch. |
| `components/citas/mensaje-citas.tsx` | Un párrafo de error. |

No crear hooks. El estado vive en `panel-citas.tsx`. No modificar `SelectorMes`. No crear componentes de íconos.

## Repositorio

`leerDiagramaCitas(mes: string | null): Promise<ResultadoCitasDiagrama>`.

1. `validarMes(mes)`. Si falla, `{ ok: false, error: "mes_invalido" }`.
2. `leerEntorno()`. Si falla, `{ ok: false, error: "entorno_incompleto" }`.
3. `crearCliente` y `from("citas").select("inicia_en, estado").gte("inicia_en", desde).lt("inicia_en", hasta)`.
4. Error del SDK: `{ ok: false, error: "supabase_inalcanzable" }`.
5. Pasar las filas y el `mes` a `agruparCitas`. Devolver `{ ok: true, mes, dias, horas, horario_pico }`.

`agruparCitas` descarta `cancelada`. Para la fecha y la hora usa `Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", ... })` con `year`, `month`, `day` y, aparte, `hour` en `hourCycle: "h23"`. No usa la cadena UTC del timestamptz como día local.

## Servicio del navegador

`leerDiagramaCitasCliente(mes?: string): Promise<ResultadoCitasDiagrama>`.

`mes` ausente, vacío o solo espacios omite el query. Si viene, se envía tal cual.

1. `fetch("/api/citas", { cache: "no-store" })`.
2. Si `response.json()` falla, `{ ok: false, error: "supabase_inalcanzable" }`.
3. Si `ok: true`, `mes` es string, `dias` es un array de `{ fecha: string, cantidad: number }`, `horas` es un array de `{ hora: string, cantidad: number }` y `horario_pico` es `null` o `{ hora, cantidad }` con cantidad number, devolverlo.
4. Si `ok: false` y `error` es `mes_invalido`, `entorno_incompleto` o `supabase_inalcanzable`, devolverlo.
5. Cualquier otra forma: `{ ok: false, error: "supabase_inalcanzable" }`.

## Pantalla `/citas`

`main` `min-h-dvh bg-zinc-950 text-zinc-50`, contenedor `mx-auto max-w-3xl px-4 py-8`. El panel es `flex flex-col gap-6`. `h1`: «Citas».

`page.tsx` envuelve el panel en `Suspense` con fallback «Cargando citas…», igual que desempeño. Pasa `mes` string o `undefined`.

Estados del panel:

1. **Cargando.** Al montar y al cambiar el mes: «Cargando citas…». No se muestran las barras anteriores.
2. **Error.** `MensajeCitas` con `mensajeErrorDesempeno` y botón «Reintentar» (`rounded border border-zinc-700 px-3 py-1 text-sm`) que repite la misma petición.
3. **Vacío.** Petición correcta, todas las cantidades de `dias` en cero y `horario_pico` null. El selector sigue. Debajo: «No hay citas en este mes.» No se dibujan barras.
4. **Listo.** Selector, diagrama de días y diagrama de horas.

`SelectorMes` recibe `mesConfirmado` cuando ya hay respuesta, `mesConsulta` con el query de la URL y `ruta` hacia `/citas`.

### Días

`h2` «Citas por día». Cada `FilaBarra` muestra la etiqueta de `presentar-eje`, la cantidad y una barra `h-2 rounded bg-zinc-200` dentro de un riel `h-2 w-full rounded bg-zinc-800`. La clase de ancho sale de `claseBarra(cantidad, maximoDelMes)`.

### Horas

`h2` «Horario con más citas». Si hay pico, un párrafo «Más citas a las 09:00 (4).» usando `presentar-eje` para la hora. Luego las `FilaBarra` de `horas`, con el mismo riel. La hora pico usa `bg-zinc-50` en la barra; el resto `bg-zinc-400`. El máximo de esta serie es el de `horas`, no el de los días.

## Criterios de aceptación

- `/citas` muestra el selector de mes, las citas por día y el horario de mayor concentración, sin librerías nuevas, sin SVG y sin CSS fuera de Tailwind.
- Un mes con dos citas el día 3 a las 09:10 y 09:40 (Lima) y una el día 3 a las 15:00 cuenta `3` el día 3, `2` en `09`, `1` en `15`, y el pico es `09`.
- Una cita `cancelada` no suma. Una cita de otro mes no entra.
- El día 3 se etiqueta en español corto y la hora como `09:00` y `15:00`.
- Un mes sin citas contables muestra «No hay citas en este mes.» y no muestra horario pico.
- `?mes=2026-13` muestra el texto de `mes_invalido` y «Reintentar».
- Cambiar el mes actualiza `?mes=` y vuelve a pedir `/api/citas`.
- `SelectorMes` en `/desempeno` sigue navegando a `/desempeno`.
- Tipos en `types/citas-diagrama.ts`. Agregación y textos de eje fuera de los componentes. Cada componente en su archivo.
