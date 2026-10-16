# Validación: diagrama de citas por día y por horario

Puntaje: 9
Veredicto: aprobado

El backend `GET /api/citas` queda fuera de esta pasada porque ya está aprobado. No se pintaron barras en local porque Supabase respondió inalcanzable; los estados de error y de mes inválido sí están en la pantalla.

## Evidencia

- `app/citas/page.tsx` es Server Component, lee `searchParams.mes` (string o `undefined`) y envuelve `PanelCitas` en `Suspense` con «Cargando citas…». `main` usa `min-h-dvh bg-zinc-950 text-zinc-50` y el contenedor `mx-auto max-w-3xl px-4 py-8`. No hace fetch.
- `components/citas/panel-citas.tsx` concentra el estado. Al montar y al cambiar `mes` pide `leerDiagramaCitasCliente` y muestra «Cargando citas…» sin las barras anteriores. El error usa `mensajeErrorDesempeno` y un botón «Reintentar» con `rounded border border-zinc-700 px-3 py-1 text-sm`. El vacío exige cantidades de días en cero y `horario_pico` null, deja el selector y muestra «No hay citas en este mes.» sin barras. El listo muestra selector, días y horas. `SelectorMes` recibe `mesConfirmado`, `mesConsulta` y `ruta` hacia `/citas?mes=`.
- `diagrama-dias.tsx` titula «Citas por día», etiqueta con `presentarFecha` y el ancho con `claseBarra` contra el máximo de los días. La barra es `h-2 rounded bg-zinc-200` sobre un riel `h-2 w-full rounded bg-zinc-800`.
- `diagrama-horas.tsx` titula «Horario con más citas», escribe «Más citas a las 09:00 (4).» vía `presentarHora` y pinta la hora pico en `bg-zinc-50` y el resto en `bg-zinc-400`. El máximo es el de `horas`.
- `fila-barra.tsx` y `mensaje-citas.tsx` no hacen fetch. No hay SVG, `style` en línea ni CSS propio.
- `lib/citas/servicio-citas-diagrama.ts` es el único fetch del módulo: `cache: "no-store"`, omite el query si `mes` falta o es solo espacios, y acepta el contrato `ok: true` / los tres errores. JSON irreconocible, red caída u otra forma devuelven `supabase_inalcanzable`.
- `clase-barra.ts` mapea el ratio a `w-0` … `w-11/12` y `w-full`. Cero es `w-0` y el máximo es `w-full`.
- `presentar-eje.ts` convierte `AAAA-MM-DD` a «3 oct» y `HH` a «09:00».
- `types/citas-diagrama.ts` define `DiaCitas`, `HoraCitas`, `HorarioPico`, `ErrorCitasDiagrama` y `ResultadoCitasDiagrama` sin JSX ni red.
- `SelectorMes` no se modificó. `/desempeno` sigue con `ruta` hacia `/desempeno?mes=`.

## Observación menor

Si `mes` trae texto y espacios, el query se arma con `encodeURIComponent` del valor original. Un mes `AAAA-MM` sale igual que enviarlo tal cual.
