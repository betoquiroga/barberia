# Validación: paleta viva

Puntaje: 9
Veredicto: aprobado

## Qué cumple

- `app/globals.css` tiene solo `@import "tailwindcss"` y los 13 tokens `@theme` con los hex del plan.
- `lib/ui/clases.ts` exporta las cadenas pedidas, sin JSX.
- `themeColor` es `#140e0c` en metadata y viewport. `html` conserva `scheme-dark`. `body` usa `bg-fondo text-tinta`.
- Las páginas `/`, `/citas`, `/servidores`, `/clientes`, `/servicios-ofrecidos`, `/desempeno` y `/desempeno/[barberoId]` ponen `clasePagina` en `<main>` y dejan el layout sin colores zinc.
- Landing, reserva, citas, CRUD y desempeño usan las constantes: botón principal en «Ver cómo reservar», Reservar del nav y envíos; secundario y secundario grande en Cancelar, Editar, Eliminar y Reintentar; error y éxito; tarjetas con `border-l-marca`; precio `text-acento`; barras `claseBarraDia`, `claseBarraHora` y `claseBarraPico` sobre `claseRiel`.
- No hay `zinc-`, `red-`, `green-`, `dark:` ni otro archivo CSS. Los hex de color quedan en `@theme` y en `themeColor`.

## Qué baja el puntaje

- El plan pide anillo `focus-visible:outline-acento` en enlaces de acción. `claseEnlace` y los enlaces de texto del nav (Servicios, Horario) no lo traen. Botones y campos sí.
