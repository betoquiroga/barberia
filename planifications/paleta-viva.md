# Paleta viva y contrastante

## Objetivo

Sustituir la interfaz monocromática en zinc por una paleta oscura, cálida y con acento dorado, definida una sola vez en el tema de Tailwind v4. El fondo sigue oscuro. El color marca las acciones principales, los estados y las secciones. El texto normal cumple WCAG AA (4.5:1) sobre el fondo de página y sobre el botón de acento.

## Alcance

- Tokens semánticos en `app/globals.css` con `@theme`.
- Un módulo de clases compartidas para controles, mensajes y tarjetas.
- Aplicar esas clases en landing, reservas, citas, servidores (barberos), clientes, servicios ofrecidos y desempeño.
- Actualizar `themeColor` al hex del fondo.
- Validar primero landing y formulario de reserva; después el resto de pantallas.

## Fuera de alcance

- Cambiar copy, layout, rutas, lógica de negocio, API o Supabase.
- Modo claro, interruptor de tema o clases `dark:`.
- Librerías nuevas, íconos, SVG o CSS de componentes (selectores, `@layer` de utilidades propias, archivos `.css` extra).
- Rediseñar diagramas: solo cambia el color de las barras y del riel.

## Suposiciones

- El tema oscuro de `planifications/dark-mode.md` se conserva. Esta tarea cambia la paleta, no vuelve a claro.
- «Módulo administrativo» son `/clientes`, `/servidores`, `/servicios-ofrecidos` y `/desempeno` (lista y ficha).
- «Registro de barberos» es `/servidores`.
- Tailwind v4 ya entra por `@import "tailwindcss"`. `@theme { --color-* }` genera utilidades (`bg-fondo`, `text-tinta`, etc.). No hace falta `tailwind.config`.
- Los hex viven solo en `@theme`. Los componentes usan nombres semánticos, nunca `zinc-*`, `red-*`, `green-*` ni hex.
- Las cadenas de clases que hoy se repiten (campos, botones, mensajes) salen a `lib/ui/clases.ts`. Cada componente importa la constante; no copia la cadena.
- El ancla del hero sigue siendo «Ver cómo reservar» hacia `#reserva`. Es el llamado principal de la landing y usa el acento. El envío del formulario («Reservar») es el llamado principal de la reserva.
- Botones Guardar y Actualizar de los CRUD son principales. Cancelar, Reintentar, Editar y Eliminar son secundarios.
- No hay estados de cita (pendiente, confirmada, cancelada) en la UI. El color de citas distingue volumen por día, hora normal y hora pico.

## Paleta

Contraste calculado con la fórmula WCAG. Texto normal ≥ 4.5:1. Texto grande (títulos `text-2xl` / `text-4xl`) ≥ 3:1.

| Token | Hex | Rol | Contraste |
| --- | --- | --- | --- |
| `fondo` | `#140e0c` | Página y `themeColor` | — |
| `superficie` | `#241812` | Campos, tarjetas | texto `tinta` sobre superficie ≈ 14:1 |
| `borde` | `#5c4336` | Bordes de controles, filas y tarjetas | — |
| `tinta` | `#fff8f1` | Texto principal | ≈ 17:1 sobre `fondo` |
| `suave` | `#e4d0c0` | Texto secundario, inactivo, placeholders visuales | ≈ 12:1 sobre `fondo` |
| `marca` | `#e85d04` | Acento de sección: borde izquierdo de tarjetas, barra de citas por día, enlace activo de nav al hover | No se usa como texto pequeño |
| `acento` | `#f5b942` | Fondo de botones y enlaces principales | — |
| `acento-tinta` | `#1a1208` | Texto sobre `acento` | ≈ 10:1 sobre `#f5b942` |
| `error` | `#ffb4ab` | Mensajes de error | ≈ 11:1 sobre `fondo` |
| `exito` | `#86efac` | Mensajes de confirmación | ≈ 12:1 sobre `fondo` |
| `pico` | `#f5b942` | Barra de la hora con más citas | Mismo hex que `acento`; token aparte para no acoplar el diagrama al botón |
| `riel` | `#3a2922` | Fondo de la barra vacía | — |
| `edicion` | `#f5b942` | Anillo de fila en edición | — |

Hover del botón principal: `hover:bg-acento/90` (el dorado sigue siendo el foco; el texto no cambia).

Enfoque visible: conservar el anillo nativo. Añadir `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento` en botones, enlaces de acción y campos.

Deshabilitado: `disabled:opacity-50`. Sin otro color.

## Clases compartidas

Archivo nuevo: `lib/ui/clases.ts`. Solo exporta strings. Sin JSX.

| Export | Clases |
| --- | --- |
| `clasePagina` | `min-h-dvh bg-fondo text-tinta` |
| `claseCampo` | `w-full rounded border border-borde bg-superficie px-3 py-2 text-sm text-tinta disabled:bg-superficie disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento` |
| `claseBotonPrincipal` | `rounded bg-acento px-4 py-2 text-sm font-medium text-acento-tinta hover:bg-acento/90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento` |
| `claseBotonSecundario` | `rounded border border-borde px-3 py-1 text-sm text-tinta disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acento` |
| `claseBotonSecundarioGrande` | Igual que el secundario con `px-4 py-2` (Cancelar de formularios) |
| `claseEnlace` | `text-sm text-suave underline-offset-2 hover:text-acento hover:underline` |
| `claseError` | `text-sm text-error` |
| `claseExito` | `text-sm text-exito` |
| `claseTextoSuave` | `text-suave` |
| `claseTarjeta` | `rounded-lg border border-borde border-l-4 border-l-marca bg-superficie p-4` |
| `claseFila` | `flex flex-col gap-1 border-b border-borde py-3` |
| `claseFilaEdicion` | `ring-1 ring-edicion` |
| `claseRiel` | `h-2 w-full rounded bg-riel` |
| `claseBarraDia` | `bg-marca` |
| `claseBarraHora` | `bg-suave` |
| `claseBarraPico` | `bg-pico` |

El padding distinto de Reintentar (`px-3 py-1`) frente a Cancelar (`px-4 py-2`) se conserva eligiendo la constante que ya trae ese padding. No se añaden clases de color en el JSX.

## Archivos

### `app/globals.css`

Responsabilidad: único lugar de los hex.

Sustituir el archivo por:

```css
@import "tailwindcss";

@theme {
  --color-fondo: #140e0c;
  --color-superficie: #241812;
  --color-borde: #5c4336;
  --color-tinta: #fff8f1;
  --color-suave: #e4d0c0;
  --color-marca: #e85d04;
  --color-acento: #f5b942;
  --color-acento-tinta: #1a1208;
  --color-error: #ffb4ab;
  --color-exito: #86efac;
  --color-pico: #f5b942;
  --color-riel: #3a2922;
  --color-edicion: #f5b942;
}
```

### `app/layout.tsx`

- `themeColor` en `metadata` y en `viewport`: `#140e0c`.
- `body`: `min-h-full bg-fondo text-tinta antialiased`.
- Conservar `scheme-dark` en `<html>`.

### Páginas

En el `<main>` de estas páginas, usar `clasePagina` (y las utilidades de layout que ya tienen, sin colores zinc):

- `app/page.tsx`
- `app/citas/page.tsx`
- `app/servidores/page.tsx`
- `app/clientes/page.tsx`
- `app/servicios-ofrecidos/page.tsx`
- `app/desempeno/page.tsx`
- `app/desempeno/[barberoId]/page.tsx`

### Landing

- `components/landing/encabezado-landing.tsx`: borde `border-borde`. Nav: `text-suave`; hover `hover:text-acento`. El enlace Reservar (`#reserva`) usa `claseBotonPrincipal` en línea (`inline-block`), sin el margen del hero.
- `components/landing/hero-landing.tsx`: el párrafo usa `claseTextoSuave`. El enlace «Ver cómo reservar» usa `claseBotonPrincipal` más `mt-8 inline-block`.
- `components/landing/tarjeta-servicio.tsx`: el `article` usa `claseTarjeta`. La descripción usa `claseTextoSuave`.
- `components/landing/precio-servicio.tsx`: el precio usa `text-base font-semibold text-acento`.
- `components/landing/fila-horario.tsx`: separador `border-borde`. La franja usa `claseTextoSuave`.
- `components/landing/seccion-reserva.tsx`, `seccion-horarios.tsx`, `horario-pendiente.tsx`: textos de apoyo `claseTextoSuave`. El enlace a horario usa `claseEnlace`.
- `components/landing/lista-servicios.tsx`: sin color nuevo; el título hereda `tinta`.

### Reservas

- `components/reservas/campo-reserva.tsx` y `selector-servicio.tsx`: el control usa `claseCampo`. El error de campo usa `claseError`. Quitar las constantes locales de clase.
- `components/reservas/formulario-reserva.tsx`: el botón de envío usa `claseBotonPrincipal`.
- `components/reservas/mensaje-reserva.tsx`: error `claseError`, éxito `claseExito`.

### Citas

- `components/citas/panel-citas.tsx`: Reintentar usa `claseBotonSecundario`.
- `components/citas/mensaje-citas.tsx`: `claseError`.
- `components/citas/fila-barra.tsx`: el riel usa `claseRiel`.
- `components/citas/diagrama-dias.tsx`: `color={claseBarraDia}`.
- `components/citas/diagrama-horas.tsx`: hora normal `claseBarraHora`; hora pico `claseBarraPico`.

### Servidores, clientes, servicios y desempeño

En cada formulario (`formulario-servidor.tsx`, `formulario-cliente.tsx`, `formulario-servicio.tsx`):

- Enviar (Guardar / Actualizar): `claseBotonPrincipal`.
- Cancelar: `claseBotonSecundarioGrande`.

En cada campo (`campo-servidor.tsx`, `campo-cliente.tsx`, `campo-servicio.tsx`): `claseCampo`.

En cada fila (`fila-servidor.tsx`, `fila-cliente.tsx`, `fila-servicio.tsx`):

- Contenedor: `claseFila` y, si está editando, también `claseFilaEdicion`.
- Texto secundario (teléfono, correo, precio, costo, activo/inactivo, «Sin servidores»): `claseTextoSuave`.
- Editar y Eliminar: `claseBotonSecundario`.

En cada mensaje (`mensaje-servidor.tsx`, `mensaje-cliente.tsx`, `mensaje-servicio.tsx`, `mensaje-desempeno.tsx`): error `claseError`, éxito `claseExito`.

En cada panel (`panel-servidores.tsx`, `panel-clientes.tsx`, `panel-servicios.tsx`, `panel-desempeno.tsx`, `panel-barbero.tsx`): botones de recarga o acción secundaria con `claseBotonSecundario`. Enlaces de vuelta y enlaces entre módulos (`enlace-servidores.tsx`, `enlace-servicios.tsx`, vuelta de la ficha) con `claseEnlace`.

- `components/desempeno/selector-mes.tsx`: controles con `claseBotonSecundario` o `claseCampo` según sea botón o input. Quitar `CLASE_CONTROL` local.
- `components/desempeno/fila-desempeno.tsx`: borde `border-borde`. «Inactivo» con `claseTextoSuave`. El enlace del nombre con `claseEnlace`.
- `components/desempeno/tabla-desempeno.tsx`: cabecera `border-borde`.
- `components/desempeno/ficha-barbero.tsx`: «Inactivo» con `claseTextoSuave`. Enlace de vuelta con `claseEnlace`.
- `components/servicios-ofrecidos/nombres-servidores.tsx`: `claseTextoSuave`.
- `components/hola-edteam/hola-edteam.tsx`: hereda `tinta`. Sin clase de color.

## Orden de trabajo

1. Tokens en `globals.css` y `lib/ui/clases.ts`.
2. `layout.tsx` y la landing completa, incluido el formulario de reserva en la home.
3. Parar y comprobar esa pantalla en escritorio y en un ancho móvil (390px) antes de seguir.
4. Citas, servidores, clientes, servicios ofrecidos y desempeño, reutilizando las mismas constantes.

## Criterios de aceptación

- Ningún componente usa `zinc-`, `red-`, `green-` ni un hex de color. Los hex están solo en `@theme`.
- En la landing, «Ver cómo reservar» y el botón de enviar la reserva son fondo `#f5b942` con texto `#1a1208`. El resto de la página no usa ese fondo.
- Guardar y Actualizar usan el mismo botón principal. Cancelar, Editar, Eliminar y Reintentar usan borde `borde` y texto `tinta`.
- Error y éxito se leen en `#ffb4ab` y `#86efac` sobre `#140e0c`.
- Las tarjetas de servicio tienen borde izquierdo `#e85d04`. El precio está en `#f5b942`.
- Las barras de citas por día son `#e85d04`. La hora pico es `#f5b942`. El resto de horas es `#e4d0c0` sobre riel `#3a2922`.
- Texto principal `#fff8f1` y secundario `#e4d0c0` sobre `#140e0c` superan 4.5:1. El texto del botón principal supera 4.5:1 sobre `#f5b942`.
- Las mismas clases se ven en `/`, `/citas`, `/servidores`, `/clientes`, `/servicios-ofrecidos`, `/desempeno` y `/desempeno/[barberoId]`, en escritorio y en 390px, sin desbordes nuevos.
- `themeColor` es `#140e0c`.
