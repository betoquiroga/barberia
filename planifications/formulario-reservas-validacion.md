# Validación: formulario de reservas

- Puntaje: 9
- Veredicto: aprobado

## Evidencia

- `types/reserva.ts` define `ValoresReserva`, `ErroresReserva` y `ResultadoValidacionReserva` como pide el plan.
- `lib/reservas/validar-reserva.ts` recorta nombre, teléfono y nota; valida servicio contra la lista, fecha local `AAAA-MM-DD` desde hoy y hora `HH:MM` de 00:00 a 23:59; la nota vacía es válida y el tope es 300.
- `components/reservas/formulario-reserva.tsx` es client component, recibe `servicios` por props, hace `preventDefault`, muestra errores solo tras un intento y, si pasa, confirma con el texto pedido más nombre del servicio, fecha y hora, y vacía los campos. No hay `fetch`, `setTimeout` ni `window.confirm`.
- `CampoReserva` cubre texto, teléfono, fecha, hora y nota. `required` en los obligatorios, `maxLength` en nombre, teléfono y nota, error en `text-sm text-red-300`.
- `SelectorServicio` usa `id` como value, «Elige un servicio» con valor vacío y `required`.
- `SeccionReserva` sigue sin `"use client"`, con `h2` «Reservar cita», el párrafo de que la cita no se guarda, el formulario y «Ver horario» hacia `#horario`.
- `Landing` pasa `servicios` a `SeccionReserva`. `app/page.tsx` sigue pasando `serviciosLanding`. Encabezado y hero apuntan a `#reserva`.
- No existe `app/api/reservas`.

## Hallazgos que bajan el puntaje

- Tras un envío válido el botón queda deshabilitado con «Reservando…» hasta que el visitante edita un campo. El plan pide ese estado en el mismo render de la confirmación y sin `setTimeout`, así que no hay espera artificial, pero el bloqueo no dura un instante: impide un segundo envío sin tocar el formulario.
