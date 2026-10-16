# Desempeño mensual de barberos en el navegador

## Objetivo

Una pantalla en `/desempeno` para ver, mes a mes, el desempeño de cada barbero: citas completadas, canceladas y programadas, ingresos y ticket promedio. El navegador solo llama a `GET /api/desempeno` y `GET /api/desempeno/[barberoId]`. La presentación no agrega citas ni llama a Supabase.

## Alcance

- Servicio HTTP del navegador sobre esas dos lecturas.
- Ruta `/desempeno` con selector de mes, totales del mes y tabla.
- Ruta `/desempeno/[barberoId]` con el mismo mes y la fila de un barbero.
- Estados de carga, vacío, error y barbero ausente.
- Reutilizar `types/desempeno.ts`. No duplicar `FilaDesempeno`, `MesDesempeno`, `ErrorDesempeno`, `ResultadoDesempeno` ni `ResultadoDesempenoBarbero`.

## Fuera de alcance

- Cambiar `app/api/desempeno`, `lib/desempeno/repositorio-desempeno.ts`, `lib/desempeno/validar-mes.ts`, la migración o `types/desempeno.ts`.
- CRUD de barberos, servicios o citas. Gráficas, metas, comisiones, ranking editable y series por día.
- Auth y cambios a `/`, `/clientes`, `app/layout.tsx`, `app/globals.css`, la landing o el formulario de reservas.
- Instalar dependencias. No hay librería de íconos en `package.json`: no se instala ninguna y no se escribe SVG ni CSS propio.
- Commit o despliegue.

## Suposiciones

- La página de Notion solo trae el título. La interfaz es operativa: selector de mes, resumen y tabla. Sin dashboard de gráficos.
- No hay enlace desde la landing. Se entra por `/desempeno`.
- El mes visible es el `mes` que devuelve la API. La primera carga de `/desempeno` llama `GET /api/desempeno` sin query. El servidor resuelve el mes actual de `America/Lima`.
- Cambiar el mes actualiza la URL con `?mes=AAAA-MM` y vuelve a pedir el listado. En el detalle, el mismo query se conserva.
- `<input type="month">` manda el valor. Botones de texto «Mes anterior» y «Mes siguiente» calculan el `AAAA-MM` vecino en `lib/desempeno/`. El tope `9999-12` no tiene siguiente: ese botón queda deshabilitado. `0001-01` no tiene anterior.
- Montos en céntimos se muestran en soles con `Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" })`, dividiendo entre 100. El cálculo vive en `lib/desempeno/presentar-montos.ts`, no en el JSX.
- Los totales del listado se suman en el cliente a partir de `filas`. El ticket del local es división entera `ingresos / completadas`, o `0` si no hay completadas. No es un tercer endpoint.
- Un barbero `activo: false` se etiqueta «Inactivo». Uno activo no lleva etiqueta.
- La fila de la tabla enlaza a `/desempeno/[barberoId]?mes=`. Esa página usa solo el endpoint de un barbero, no recorta la fila del listado.
- `404 no_encontrado` en el detalle muestra «Ese barbero no tiene desempeño en este mes.» y un enlace de vuelta al listado del mismo mes.
- Red caída o JSON irreconocible se tratan como `supabase_inalcanzable`.
- Orden de filas: el que ya trae la API. La tabla no reordena.

## Contrato que se consume

`GET` sin cuerpo. `cache: "no-store"`.

| Ruta | Éxito |
| --- | --- |
| `/api/desempeno` | `200` `{ ok: true, mes, filas }` |
| `/api/desempeno?mes=AAAA-MM` | igual |
| `/api/desempeno/[barberoId]?mes=AAAA-MM` | `200` `{ ok: true, mes, fila }` |

Errores `{ ok: false, error }`: `400 mes_invalido`, `404 no_encontrado`, `503 entorno_incompleto` o `supabase_inalcanzable`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/desempeno.ts` | Ya existe. No se modifica. |
| `lib/desempeno/servicio-desempeno.ts` | Únicas llamadas `fetch` de este módulo. Sin JSX. |
| `lib/desempeno/mensajes-error-desempeno.ts` | Mapa `ErrorDesempeno` → texto en español. Sin red ni JSX. |
| `lib/desempeno/presentar-montos.ts` | Céntimos a texto en soles. Sin red ni JSX. |
| `lib/desempeno/mover-mes.ts` | `AAAA-MM` anterior y siguiente, o `null` en los topes. Sin red ni JSX. |
| `lib/desempeno/resumir-filas.ts` | Suma conteos e ingresos y calcula el ticket del local. Sin red ni JSX. |
| `app/desempeno/page.tsx` | Server Component. Lee `searchParams.mes` y renderiza el panel. Sin fetch. |
| `app/desempeno/[barberoId]/page.tsx` | Server Component. Pasa `barberoId` y `mes` al panel de detalle. Sin fetch. |
| `components/desempeno/panel-desempeno.tsx` | Client Component. Carga el listado, mes, error y reintento. |
| `components/desempeno/selector-mes.tsx` | Input `month` y botones de mes. Sin fetch. |
| `components/desempeno/resumen-mes.tsx` | Cuatro cifras del local. Sin fetch. |
| `components/desempeno/tabla-desempeno.tsx` | Tabla o estado vacío. Sin fetch. |
| `components/desempeno/fila-desempeno.tsx` | Una fila y el enlace al detalle. |
| `components/desempeno/panel-barbero.tsx` | Client Component. Carga una fila. |
| `components/desempeno/ficha-barbero.tsx` | Nombre, estado y las cinco métricas. Sin fetch. |
| `components/desempeno/mensaje-desempeno.tsx` | Un párrafo de error. |

No crear hooks. El estado vive en los dos paneles. No reutilizar `components/clientes/*`: sus textos y props son de clientes. No crear componentes de íconos.

## Servicio

`lib/desempeno/servicio-desempeno.ts` exporta:

- `listarDesempeno(mes?: string): Promise<ResultadoDesempeno>`
- `leerDesempenoBarbero(barberoId: string, mes?: string): Promise<ResultadoDesempenoBarbero>`

`mes` ausente, vacío o solo espacios omite el query. Si viene, se envía tal cual, sin revalidar el formato en el cliente: el `400` lo resuelve la API.

Cada función:

1. `fetch` con `cache: "no-store"`.
2. Si `response.json()` falla, `{ ok: false, error: "supabase_inalcanzable" }`.
3. Si `ok: true` y `mes` es string, y `filas` es un array de filas válidas o `fila` es una fila válida, devolver ese resultado.
4. Una fila válida tiene los ocho campos de `FilaDesempeno` con los tipos del tipo existente (`barbero_id` y `nombre` string, `activo` boolean, el resto number).
5. Si `ok: false` y `error` es uno de los cuatro códigos, devolverlo.
6. Cualquier otra forma: `{ ok: false, error: "supabase_inalcanzable" }`.

## Mensajes

| Código | Texto |
| --- | --- |
| `mes_invalido` | El mes no es válido. Usa el formato año y mes. |
| `no_encontrado` | Ese barbero no tiene desempeño en este mes. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

## Pantallas

### Listado `/desempeno`

Fondo y ancho como `/clientes`: `main` `min-h-dvh bg-zinc-950 text-zinc-50`, contenedor `mx-auto max-w-3xl px-4 py-8`. El panel es `flex flex-col gap-6`. Título `h1`: «Desempeño».

`page.tsx` lee `searchParams.mes`. Si es string, lo pasa a `PanelDesempeno`. Si no existe, pasa `undefined`.

Estados del panel:

1. **Cargando.** Al montar y al cambiar el mes: párrafo «Cargando desempeño…». No se muestra la tabla anterior.
2. **Error.** `MensajeDesempeno` con el texto del código y botón «Reintentar» que repite la misma petición.
3. **Vacío.** Petición correcta y `filas` vacío: el selector sigue visible. `TablaDesempeno` muestra «No hay barberos en este mes.» `ResumenMes` muestra las cuatro cifras en cero.
4. **Listo.** Selector, resumen y tabla.

El selector:

- Label «Mes» e `input type="month"` con el `mes` de la respuesta cuando ya hay datos. Antes de la primera respuesta, el valor es el query de la URL o cadena vacía.
- Al cambiar el input, `router.replace("/desempeno?mes=" + valor)` si el valor cumple `/^\d{4}-(0[1-9]|1[0-2])$/`. Si el control entrega otra cosa, no se navega.
- «Mes anterior» y «Mes siguiente» usan `mover-mes.ts` sobre el mes ya confirmado por la API. Si todavía no hay mes confirmado, ambos botones están deshabilitados.
- Clases de controles: `rounded border border-zinc-700 px-3 py-1 text-sm`, igual que el reintento de clientes.

`ResumenMes` recibe el resultado de `resumir-filas` y muestra cuatro textos:

- Citas completadas
- Citas canceladas
- Citas programadas
- Ingresos y, en la misma línea, «Ticket promedio» con el monto formateado

`TablaDesempeno` es `<table className="w-full text-left text-sm">`. Cabeceras: Barbero, Completadas, Canceladas, Programadas, Ingresos, Ticket. `FilaDesempeno` pone el nombre en un `<a href={"/desempeno/" + barbero_id + "?mes=" + mes}>` con `hover:text-zinc-300`. Si `activo` es false, junto al nombre un `span` «Inactivo» con `text-zinc-400`. Montos pasan por `presentar-montos`.

### Detalle `/desempeno/[barberoId]`

Misma envoltura de página. Título `h1`: «Desempeño del barbero».

`page.tsx` pasa `barberoId` de la ruta y `mes` del query (string o `undefined`).

Estados de `PanelBarbero`:

1. **Cargando.** «Cargando desempeño…».
2. **Error.** Mensaje y «Reintentar». Incluye `no_encontrado` y `mes_invalido`.
3. **Listo.** `SelectorMes` (navega a `/desempeno/[barberoId]?mes=`) y `FichaBarbero`.

`FichaBarbero` muestra nombre, «Inactivo» si aplica, y las cinco métricas con los mismos rótulos de la tabla. Enlace «Volver al mes»: `/desempeno?mes=` más el `mes` de la respuesta. Si aún no hay mes confirmado, el enlace es `/desempeno`.

## Criterios de aceptación

- `/desempeno` sin query pide `GET /api/desempeno` sin `mes` y muestra el `mes` devuelto en el selector.
- Elegir `2026-10` deja la URL en `/desempeno?mes=2026-10` y la tabla muestra las filas de esa respuesta, en ese orden.
- Con `filas: []` se lee «No hay barberos en este mes.» y el resumen está en cero.
- Una fila con `ingresos_centavos` 6000 y `ticket_promedio_centavos` 3000 se ve como S/ 60.00 y S/ 30.00.
- Dos filas de 6000 y 2500 en completadas muestran ingresos del local S/ 85.00. El ticket del local es la división entera de la suma.
- Un barbero con `activo: false` muestra «Inactivo».
- El nombre abre `/desempeno/{barbero_id}?mes=` del mes visible y esa página pide `GET /api/desempeno/{barbero_id}`.
- UUID inexistente muestra el texto de `no_encontrado` y el enlace vuelve al listado del mismo mes.
- `503` muestra el texto de `entorno_incompleto` o `supabase_inalcanzable` y «Reintentar» repite la petición.
- No se añaden dependencias, archivos CSS, SVG ni cambios en `/`, `/clientes` o las rutas de API.
