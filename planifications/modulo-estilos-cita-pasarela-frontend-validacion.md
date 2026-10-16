# Validación: módulo de estilos, cita y pasarela (frontend)

- **Plan:** `planifications/modulo-estilos-cita-pasarela-frontend.md`
- **Puntaje:** 10
- **Veredicto:** aprobado
- **Aprueba:** sí (umbral 7)

## Alcance

La landing `/` carga el catálogo con `GET /api/servicios`, muestra precios en soles y, tras un alta válida, navega en la misma pestaña a `url_pasarela`. El correo es obligatorio. `correo_no_enviado` recupera la URL con `GET /api/pagos/[id]`. `pago_no_creado`, `400` y `503` dejan el formulario en `#reserva` sin un segundo `POST`.

No hay ruta nueva, dependencia, ícono, SVG ni CSS propio. `lib/landing/servicios.ts`, `presentarPesos` y `PrecioServicio` siguen en el repo y ya no alimentan `/`.

## Evidencia

| Criterio | Dónde |
| --- | --- |
| Único fetch del catálogo, `cache: "no-store"`, JSON inválido o red como `supabase_inalcanzable` | `lib/servicios/servicio-catalogo.ts` |
| `presentarSoles` con `Intl.NumberFormat("es-PE", PEN, 2 decimales)` sobre `centavos / 100` | `lib/servicios/presentar-soles.ts` |
| Ambos errores de catálogo: «No pudimos cargar los estilos. Recarga la página.» | `lib/servicios/mensajes-error-catalogo.ts` |
| `POST /api/citas` con `EntradaAltaCita` y estrechado de `201` / `400` / `502` / `503` | `lib/citas/servicio-alta-cita.ts` |
| Textos de alta de la tabla del plan | `lib/citas/mensajes-error-alta.ts` |
| `GET /api/pagos/[id]` | `lib/pagos/servicio-pago.ts` |
| Correo 1–254, regex del plan, minúsculas, fecha mínima `America/Lima` + `en-CA` | `lib/reservas/validar-reserva.ts`, `types/reserva.ts` |
| Catálogo una vez; error sin formulario; horarios entre lista y reserva | `components/estilos/experiencia-cliente.tsx` |
| Precio en soles; tarjetas `EstiloPublico` en el orden del JSON | `components/estilos/precio-estilo.tsx`, `components/landing/tarjeta-servicio.tsx`, `components/landing/lista-servicios.tsx` |
| `/` sin `serviciosLanding` | `app/page.tsx`, `components/landing/landing.tsx` |
| Texto de pasarela; Server Component | `components/landing/seccion-reserva.tsx` |
| Correo, «Agendar y pagar» / «Agendando…», `window.location.assign`, GET solo tras `correo_no_enviado` | `components/reservas/formulario-reserva.tsx` |
| `type: "email"` y selector `{ id, nombre }` | `components/reservas/campo-reserva.tsx`, `components/reservas/selector-servicio.tsx` |

## Criterios de aceptación

Todos se cumplen en el código revisado: precios de la API (no 18000/12000/28000), sin botón de agendar si el catálogo falla, validación local antes del fetch, navegación en `201` con URL absoluta, recuperación de pasarela en `correo_no_enviado`, y permanencia en `#reserva` con el mensaje del código en el resto de fallos.
