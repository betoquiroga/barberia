# Página única: Hola EDteam

## Objetivo

Dejar el repo de Next.js (App Router) sin el contenido de la plantilla `create-next-app` y con una sola ruta `/` cuyo único contenido visible es el texto `Hola EDteam`, centrado en el viewport. En el primer montaje de esa vista el texto aparece carácter a carácter. No hay logo, enlaces, botones, cursor, subtítulo ni segundo bloque.

## Alcance

- Borrar los assets y el texto de la plantilla que la página ya no usa.
- Sustituir `package-lock.json` por `yarn.lock` sin agregar dependencias.
- Reescribir la home y el layout mínimo que la sostiene.
- Implementar la simulación de escritura en un hook, con el tipo en su archivo y la presentación en un componente cliente.

## Fuera de alcance

- Nuevas rutas, API, base de datos, autenticación o estilos de marca de la barbería.
- Instalar librerías (incluida cualquier librería de íconos o de typewriter).
- Tocar `.cursor/`, `AGENTS.md`, `eslint.config.mjs`, `tsconfig.json`, `next.config.ts` o `.gitignore`.
- Commit o despliegue.

## Suposiciones

- “Archivos que no necesitamos” son los de la demo de Next.js (SVG de `public/`, fuentes Geist, CSS de la plantilla y el README de arranque). La toolchain del proyecto se conserva.
- “Primera aparición” es el primer montaje del componente en esa carga de la página. Al recargar, la animación vuelve a correr. No se persiste en `sessionStorage`.
- El intervalo entre caracteres es 70 ms. Con `prefers-reduced-motion: reduce` el texto completo se muestra de inmediato, sin animación.
- El texto usa la fuente del sistema. No se carga `next/font`.
- El idioma del documento es `es`. El título del documento es `Hola EDteam`.
- Tras borrar los SVG, `public/` puede quedar vacío.

## Archivos a eliminar

| Archivo | Motivo |
| --- | --- |
| `public/vercel.svg` | Logo de la plantilla. La página no muestra imágenes. |
| `public/window.svg` | Ícono de la plantilla. |
| `public/file.svg` | Ícono de la plantilla. |
| `public/next.svg` | Solo si existe. `app/page.tsx` lo referencia hoy. |
| `package-lock.json` | El proyecto usa Yarn. |

## Archivos a modificar

### `package.json`

Sin cambios de dependencias ni de scripts. Los scripts actuales (`dev`, `build`, `start`, `lint`) se mantienen.

Después de borrar `package-lock.json`, ejecutar `yarn install` en la raíz del repo para generar `yarn.lock`. No usar npm.

### `README.md`

Reemplazar el README de `create-next-app` por este contenido, en español, y nada más:

```md
# Barbería

Aplicación Next.js. La página de inicio muestra el texto «Hola EDteam».

## Desarrollo

```bash
yarn dev
```

Abre http://localhost:3000.
```

El bloque interior de bash queda como un solo fence. No mencionar Geist, npm, pnpm ni bun.

### `app/globals.css`

Dejar únicamente:

```css
@import "tailwindcss";
```

Quitar `:root`, `@theme`, el `media` de color scheme y las reglas de `body`. El centrado, el color y la tipografía van en clases de Tailwind.

### `app/layout.tsx`

Responsabilidad: documento HTML y metadata. No renderiza texto de producto.

- Quitar `Geist`, `Geist_Mono` y `next/font/google`.
- Mantener el import de `./globals.css`.
- `metadata.title`: `Hola EDteam`.
- `metadata.description`: `Hola EDteam`.
- `<html lang="es" className="h-full">`.
- `<body className="min-h-full antialiased">{children}</body>`.
- Conservar el tipado `LayoutProps<"/">` que ya usa el archivo.

### `app/page.tsx`

Responsabilidad: página de servidor de `/`. No lleva `"use client"`, ni `next/image`, ni enlaces.

Renderiza un único `<main>` con las clases Tailwind `flex min-h-dvh items-center justify-center bg-white text-zinc-950` y, dentro, `<HolaEdteam text="Hola EDteam" />`.

## Archivos a crear

Cada unidad va en su propio archivo. La presentación no contiene el temporizador.

### `types/typewriter.ts`

Exporta:

```ts
export type TypewriterProps = {
  text: string;
};
```

Solo esa prop. El intervalo y la consulta de movimiento reducido viven en el hook, no en la API del componente.

### `hooks/use-typewriter.ts`

Firma: `useTypewriter(text: string): string`.

Comportamiento:

1. Estado inicial: cadena vacía.
2. En el efecto de montaje, leer `window.matchMedia("(prefers-reduced-motion: reduce)")`.
3. Si `matches` es true, fijar el estado al `text` completo y no programar intervalos.
4. Si no, arrancar un `setInterval` de 70 ms. En cada tick, avanzar un índice y guardar `text.slice(0, index)`.
5. Al llegar a `text.length`, llamar `clearInterval`.
6. El cleanup del efecto limpia el intervalo si el componente se desmonta a mitad de la animación.
7. Dependencia del efecto: `text`.

No usar librerías. No escribir en `document` más allá de `matchMedia`.

### `components/hola-edteam/hola-edteam.tsx`

Componente cliente (`"use client"`).

- Importa `useTypewriter` desde `@/hooks/use-typewriter` y `TypewriterProps` desde `@/types/typewriter`.
- Props: `TypewriterProps`.
- Renderiza un solo `<p>` con el string que devuelve el hook.
- Clases del párrafo: `text-3xl font-medium tracking-tight`.
- Sin `aria-live` extra, sin cursor, sin `span` de caret, sin contenedores adicionales.

El alias `@/*` ya apunta a la raíz en `tsconfig.json`.

## Comportamiento visible

- Fondo blanco, texto zinc casi negro, una sola línea centrada en horizontal y vertical.
- Secuencia exacta, de a un carácter, con 70 ms entre cada uno: `H` `o` `l` `a` ` ` `E` `D` `t` `e` `a` `m`.
- Al terminar, el párrafo queda estático en `Hola EDteam`.
- No hay header, footer, favicon custom, modo oscuro ni cambio de layout al completar la frase.
- Quien tenga reducción de movimiento ve el texto completo en el primer paint del cliente, sin pasos intermedios.

## Criterios de aceptación

1. `yarn dev` arranca y `http://localhost:3000` muestra únicamente `Hola EDteam`, centrado en el viewport.
2. En una carga con movimiento permitido, el texto crece de vacío hasta `Hola EDteam` y no se repite hasta recargar.
3. No quedan referencias en `app/` a `/vercel.svg`, `/window.svg`, `/file.svg`, `/next.svg` ni a `next/image`.
4. Esos SVG no están en `public/`.
5. `package-lock.json` no existe y `yarn.lock` sí.
6. `app/globals.css` solo contiene `@import "tailwindcss";`.
7. No se añadió ninguna dependencia en `package.json`.
8. El título de la pestaña es `Hola EDteam` y `<html lang>` es `es`.
