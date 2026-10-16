# Validación: Dark mode por defecto

- Plan: `planifications/dark-mode.md`
- Puntaje: **10**
- Veredicto: **aprobado**

## Hallazgos

El documento, las páginas `/` y `/clientes` y los componentes de clientes y de «Hola EDteam» usan la paleta del plan. No hay interruptor de tema, clases `dark:`, CSS añadido ni archivos nuevos. El CRUD y el typewriter no cambiaron de comportamiento.

`app/layout.tsx` declara `themeColor: "#09090b"` en `metadata` y también en `viewport`. El segundo export cubre el color de tema del navegador en esta versión de Next.js y no abre alcance nuevo.

## Evidencia

| Criterio | Resultado |
| --- | --- |
| `<html>` con `lang="es"`, `h-full` y `scheme-dark`; `<body>` con `min-h-full bg-zinc-950 text-zinc-50 antialiased` | Cumple |
| `metadata.themeColor` es `#09090b` | Cumple |
| `/` y `/clientes` pintan `bg-zinc-950 text-zinc-50` en `<main>` | Cumple |
| Inputs y textarea: `bg-zinc-900`, `border-zinc-700`, `text-zinc-50`, `disabled:bg-zinc-800 disabled:opacity-50` | Cumple |
| Editar, Borrar, Cancelar y Reintentar: borde `border-zinc-700` y fondo transparente. Guardar / Actualizar: `bg-zinc-50 text-zinc-950` | Cumple |
| Error `text-sm text-red-400`; éxito `text-sm text-green-400` | Cumple |
| Fila en edición: `ring-1 ring-zinc-600`. Correo, teléfono y detalle: `text-zinc-400`. Nombre: `font-bold` | Cumple |
| `bg-zinc-50` y `text-zinc-950` solo en el botón principal. Sin `bg-white`, `text-black` ni `dark:` | Cumple |
| `globals.css` sigue en `@import "tailwindcss";`. Sin archivos, librerías ni interruptor nuevos | Cumple |
| Carga, vacío, error, éxito, edición, borrado y typewriter conservan su flujo | Cumple |
