# Validación: landing pública de la barbería

- Puntaje: 10
- Veredicto: aprobado

## Evidencia

- `app/page.tsx` es un Server Component: llama a `listarHorarios()`, pasa `serviciosLanding` y el resultado a `Landing`, y no formatea horas ni elige textos de estado.
- `app/layout.tsx` usa título `Barbería`, la descripción pedida, `lang="es"`, `scheme-dark`, `bg-zinc-950` y `text-zinc-50`.
- Existen `types/servicio.ts`, `lib/landing/servicios.ts` (Corte clásico, Arreglo de barba, Corte y barba) y `lib/landing/presentar-horarios.ts` (orden lunes–domingo, `Cerrado` o `abre a cierra`, sin inventar días ausentes, sin React).
- `components/landing/` tiene un archivo por pieza, en el orden Encabezado, Hero, ListaServicios, SeccionHorarios y SeccionReserva. Anclas `#servicios`, `#horario` y `#reserva`. Enlaces del encabezado, del hero (`#reserva`) y de reserva (`#horario`).
- Horarios: error → «No pudimos cargar el horario»; lista vacía → «Horario por confirmar»; filas vía `presentarHorarios` y `FilaHorario`.
- Layout: `px-4` y `max-w-3xl`; servicios en `md:grid-cols-3`. Solo clases Tailwind. Sin formulario, POST ni clientes. `components/hola-edteam/` y `hooks/use-typewriter.ts` siguen en el repo y la home no los monta.
