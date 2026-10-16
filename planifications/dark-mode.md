# Dark mode por defecto

## Objetivo

Dejar toda la interfaz existente en tema oscuro por defecto: el documento, el layout, `/`, `/clientes` y los componentes de clientes y de «Hola EDteam». El fondo de página es zinc-950 y el texto principal es zinc-50. No hay interruptor de tema ni variante clara.

## Alcance

- Declarar el esquema de color oscuro en el documento HTML y en la metadata.
- Confirmar o ajustar las clases Tailwind de cada superficie visible para que coincidan con la paleta de abajo.
- Conservar el comportamiento actual (CRUD de clientes, typewriter, estados de carga, error, éxito, edición y borrado).

## Fuera de alcance

- Toggle, `localStorage`, `prefers-color-scheme` para volver a claro, o clases `dark:` condicionales.
- Nuevas rutas, componentes, tipos, hooks o librerías (incluida cualquier librería de íconos).
- CSS propio, SVG, cambios de copy, de layout o de lógica de negocio.
- Tocar API, Supabase, `types/`, `lib/`, `hooks/` o archivos de validación.

## Suposiciones

- La UI ya usa zinc oscuro en `app/layout.tsx`, `app/page.tsx`, `app/clientes/page.tsx`, `campo-cliente.tsx` y los botones. El trabajo es fijar ese tema como el del documento y alinear cualquier clase que no esté en la paleta. No se rediseña.
- El botón principal (Guardar / Actualizar) sigue invertido: fondo zinc-50 y texto zinc-950. Es el contraste de la acción, no una superficie clara de página.
- `scheme-dark` es la utilidad de Tailwind v4 (`@import "tailwindcss"` ya está en `app/globals.css`). No se añade CSS.
- El color de tema del navegador es `#09090b` (zinc-950).
- No se crean archivos. Solo se modifican los listados abajo si alguna clase no coincide.

## Paleta

| Rol | Clases |
| --- | --- |
| Fondo de página | `bg-zinc-950 text-zinc-50` |
| Borde | `border-zinc-800` en filas; `border-zinc-700` en controles |
| Campo | `bg-zinc-900 text-zinc-50 border border-zinc-700` |
| Campo deshabilitado | `disabled:bg-zinc-800 disabled:opacity-50` en el control; botones solo `disabled:opacity-50` |
| Botón secundario | `rounded border border-zinc-700` más el padding que ya tiene |
| Botón principal | `rounded bg-zinc-50 text-zinc-950` más el padding que ya tiene |
| Fila en edición | `ring-1 ring-zinc-600` |
| Error | `text-sm text-red-400` |
| Éxito | `text-sm text-green-400` |
| Texto secundario de la fila (correo, teléfono, detalle o «Sin detalle») | `text-zinc-400` |
| Título de página y nombre del cliente | heredan `text-zinc-50`; el nombre sigue `font-bold` |

## Archivos a modificar

### `app/layout.tsx`

Responsabilidad: documento y metadata. Sigue sin texto de producto.

- En `<html>`: conservar `lang="es"` y `h-full`. Añadir `scheme-dark`.
- En `<body>`: conservar `min-h-full bg-zinc-950 text-zinc-50 antialiased`.
- En `metadata`, añadir `themeColor: "#09090b"`. Título y descripción se quedan como están.

### `app/globals.css`

Sin cambios. Sigue siendo solo `@import "tailwindcss";`.

### `app/page.tsx`

Responsabilidad: home. Conservar el centrado y `HolaEdteam`.

- En `<main>`: `flex min-h-dvh items-center justify-center bg-zinc-950 text-zinc-50`.

### `components/hola-edteam/hola-edteam.tsx`

Sin lógica nueva. El párrafo hereda `text-zinc-50`. Conservar `text-3xl font-medium tracking-tight`.

### `app/clientes/page.tsx`

- En `<main>`: `min-h-dvh bg-zinc-950 text-zinc-50`.
- El contenedor sigue `mx-auto max-w-xl px-4 py-8`.

### `components/clientes/panel-clientes.tsx`

Sin cambios de estado ni de llamadas. Solo presentación:

- La sección sigue `flex flex-col gap-6`.
- El `h1` sigue `text-2xl font-semibold` (hereda zinc-50).
- «Cargando clientes…» hereda zinc-50. Sin clase de color extra.
- El botón Reintentar: `rounded border border-zinc-700 px-3 py-1 text-sm`.

### `components/clientes/mensaje-cliente.tsx`

- Error: `text-sm text-red-400`.
- Éxito: `text-sm text-green-400`.

### `components/clientes/formulario-cliente.tsx`

- El formulario sigue `flex flex-col gap-4`.
- Submit: `rounded bg-zinc-50 px-4 py-2 text-sm text-zinc-950 disabled:opacity-50`.
- Cancelar: `rounded border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50`.

### `components/clientes/campo-cliente.tsx`

La constante de clase del control queda:

`w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:bg-zinc-800 disabled:opacity-50`

La etiqueta sigue `flex flex-col gap-1 text-sm` y hereda zinc-50.

### `components/clientes/lista-clientes.tsx`

El vacío «Todavía no hay clientes.» hereda zinc-50. Sin clase de color extra. La lista no gana contenedor nuevo.

### `components/clientes/fila-cliente.tsx`

- El `li`: `flex flex-col gap-1 border-b border-zinc-800 py-3`, y si `editando` además `ring-1 ring-zinc-600`.
- Nombre: `font-bold`.
- Correo, teléfono y detalle: `text-zinc-400`.
- Botones Editar y Borrar: `rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50`.

## Comportamiento visible

- Al abrir `/` y `/clientes` el fondo es casi negro y el texto principal es claro, sin flash de tema claro.
- Los controles nativos (inputs, textarea, scrollbar) usan esquema oscuro por `scheme-dark`.
- Cargando, lista vacía, error de carga, éxito, edición (anillo) y borrado (opacidad) se ven sobre el mismo fondo.
- Guardar / Actualizar sigue siendo el único control de fondo claro.

## Criterios de aceptación

1. `<html>` tiene `scheme-dark` y `<body>` tiene `bg-zinc-950 text-zinc-50`.
2. `metadata.themeColor` es `#09090b`.
3. `/` y `/clientes` muestran fondo zinc-950 y texto zinc-50 en el primer pintado.
4. Inputs y textarea tienen fondo zinc-900, borde zinc-700 y texto zinc-50; deshabilitados, fondo zinc-800 y opacidad 50 %.
5. Editar, Borrar, Cancelar y Reintentar tienen borde zinc-700 y fondo transparente. Guardar / Actualizar tiene fondo zinc-50 y texto zinc-950.
6. Mensajes de error son `text-red-400` y los de éxito `text-green-400`.
7. La fila en edición tiene `ring-zinc-600`. Correo, teléfono y detalle son `text-zinc-400`.
8. No hay clases `bg-white`, `bg-zinc-50` en fondos de página, `text-black` ni `text-zinc-950` salvo el botón principal.
9. No hay archivos nuevos, librerías nuevas, CSS añadido ni interruptor de tema.
10. Crear, editar, borrar, reintentar y el typewriter de `/` siguen funcionando igual.
