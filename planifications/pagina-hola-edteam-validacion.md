# Validación: Página única Hola EDteam

- Plan: `planifications/pagina-hola-edteam.md`
- Puntaje: **9**
- Veredicto: **aprobado**

## Hallazgos

1. `public/globe.svg` sigue en el repo. El plan pide quitar los SVG de la plantilla de `public/`. Los listados (`vercel.svg`, `window.svg`, `file.svg`, `next.svg`) ya no están. `globe.svg` no se usa en `app/`, pero es un asset de la demo.

El resto del alcance coincide con el plan.

## Evidencia

| Criterio | Resultado |
| --- | --- |
| `app/page.tsx` es servidor, un `main` con las clases pedidas y `<HolaEdteam text="Hola EDteam" />` | Cumple |
| `app/layout.tsx`: sin `next/font`, `lang="es"`, título y descripción `Hola EDteam`, clases de `html`/`body`, `LayoutProps<"/">` | Cumple |
| `app/globals.css` solo `@import "tailwindcss";` | Cumple |
| `types/typewriter.ts` exporta solo `TypewriterProps` | Cumple |
| `hooks/use-typewriter.ts`: estado vacío, `matchMedia`, intervalo 70 ms, `slice`, cleanup, dependencia `text` | Cumple |
| `components/hola-edteam/hola-edteam.tsx`: cliente, un `<p>` con las clases pedidas, sin cursor ni `aria-live` | Cumple |
| `README.md` en español, un fence `bash`, sin Geist/npm/pnpm/bun | Cumple |
| `package.json` conserva scripts y no agrega dependencias | Cumple |
| `package-lock.json` ausente y `yarn.lock` presente | Cumple |
| Sin referencias en `app/` a los SVG de la plantilla ni a `next/image` | Cumple |
| SVG nombrados en el plan ausentes de `public/` | Cumple |
| `public/globe.svg` residual | No cumple el supuesto de vaciar los SVG de la demo |
