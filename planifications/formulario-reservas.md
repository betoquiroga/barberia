# Formulario de reservas en la landing

## Objetivo

Sustituir el texto estático de «Reserva en el local» por un formulario de cita en la misma sección `#reserva` de `/`. El visitante elige servicio, fecha y hora y deja sus datos. El envío válido solo confirma en pantalla. No hay API de reservas ni se guarda nada.

## Alcance

- Formulario en español, tema oscuro, solo clases de Tailwind, dentro de `#reserva`.
- Campos: nombre, teléfono, servicio, fecha, hora y nota.
- Validación en `lib/`, tipos en `types/`. La presentación no decide reglas.
- Estados: edición, error de campo, envío bloqueado un instante y confirmación.
- Reutilizar `Servicio` y `serviciosLanding`. Pasar los servicios desde `Landing` hasta el formulario.

## Fuera de alcance

- Rutas `app/api/reservas`, tablas, migraciones, Supabase o `fetch`.
- Listar, editar o cancelar reservas.
- Elegir barbero, precio, duración o cupos.
- Comprobar que la hora caiga dentro del horario publicado.
- Cambiar `/clientes`, `CampoCliente`, el hero, los servicios, los horarios o `app/layout.tsx`.
- Instalar dependencias, íconos, CSS propio o SVG.
- Commit o despliegue.

## Suposiciones

- La página de Notion está en blanco. El título es el requerimiento: un formulario de reservas, no un CRUD.
- El formulario vive en `/`, ancla `#reserva`. No hay ruta `/reservas`.
- Como no existe contrato de API, el envío no llama a la red. Un envío válido muestra la confirmación y vacía los campos. El texto deja claro que la cita no quedó guardada en el sistema.
- Servicios del selector: los tres de `serviciosLanding` (Corte clásico, Arreglo de barba, Corte y barba). El valor es `Servicio.id`.
- Campos obligatorios: nombre, teléfono, servicio, fecha y hora. La nota es opcional.
- Nombre: al recortar, entre 1 y 120 caracteres.
- Teléfono: al recortar, entre 7 y 20 caracteres. Se aceptan dígitos, espacios, `+` y `-`.
- Fecha: `AAAA-MM-DD`, desde hoy en la zona local del navegador. No se aceptan fechas pasadas.
- Hora: `HH:MM` en 24 horas, cualquier minuto. No se limita a la hora de apertura ni de cierre.
- Nota: al recortar, como máximo 300 caracteres. Vacía es válida.
- El enlace «Ver horario» se mantiene debajo del formulario.
- El encabezado y el hero siguen apuntando a `#reserva`.
- No se reutiliza `CampoCliente`: ese control no cubre `date`, `time` ni `select`, y pertenece al CRUD de clientes.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/reserva.ts` | `ValoresReserva`, `ErroresReserva` y `ResultadoValidacionReserva`. Sin JSX ni red. |
| `lib/reservas/validar-reserva.ts` | Única validación. Recibe valores y la lista de servicios. Devuelve el resultado. Sin JSX. |
| `components/reservas/formulario-reserva.tsx` | Client Component. Estado, submit y mensajes. Importa la validación. |
| `components/reservas/campo-reserva.tsx` | Label más input de texto, teléfono, fecha, hora o textarea. |
| `components/reservas/selector-servicio.tsx` | Label más `select` de servicios. |
| `components/reservas/mensaje-reserva.tsx` | Un párrafo de error global o de confirmación. |
| `components/landing/seccion-reserva.tsx` | Sección `#reserva`. Título, formulario y enlace al horario. Sigue siendo Server Component. |
| `components/landing/landing.tsx` | Pasa `servicios` a `SeccionReserva`. |

No crear hooks. El estado vive en `formulario-reserva.tsx`. No crear servicio HTTP.

## Tipos

`types/reserva.ts`:

```ts
type ValoresReserva = {
  nombre: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
};

type ErroresReserva = Partial<
  Record<"nombre" | "telefono" | "servicioId" | "fecha" | "hora" | "nota", string>
>;

type ResultadoValidacionReserva =
  | { ok: true }
  | { ok: false; errores: ErroresReserva };
```

Los textos de error salen de `validar-reserva.ts` en español. No hace falta un mapa aparte: no hay códigos de API.

## Validación

`validarReserva(valores, servicios)`:

1. Recorta nombre, teléfono y nota. Fecha, hora y `servicioId` se comparan tal cual.
2. Nombre vacío o de más de 120 caracteres → error en `nombre`.
3. Teléfono que no cumpla longitud o el patrón de dígitos, espacios, `+` y `-` → error en `telefono`.
4. `servicioId` que no esté en `servicios` → error en `servicioId`.
5. Fecha que no sea `AAAA-MM-DD` o anterior a hoy → error en `fecha`. Hoy es válido.
6. Hora que no sea `HH:MM` de 00:00 a 23:59 → error en `hora`.
7. Nota de más de 300 caracteres → error en `nota`.
8. Si hay algún error, `{ ok: false, errores }` solo con los campos fallidos. Si no, `{ ok: true }`.

## Comportamiento visible

Sección `#reserva`:

- `h2`: «Reservar cita».
- Párrafo: la cita se anota en esta pantalla y todavía no se guarda.
- Formulario.
- Enlace «Ver horario» hacia `#horario`.

Valores iniciales: cadenas vacías. El `select` muestra «Elige un servicio» con valor `""`.

Cada campo muestra su error debajo del control, en `text-sm text-red-300`, solo después de un intento de envío. Al corregir el campo, se vuelve a validar y ese error desaparece si ya pasa.

Botón «Reservar». Al enviar:

1. `preventDefault`.
2. Validar.
3. Si falla, mostrar los errores y no cambiar el resto del texto.
4. Si pasa, deshabilitar el botón con el texto «Reservando…» durante el mismo turno de render en el que se confirma. No hay espera de red ni `setTimeout`.
5. Mostrar «Listo. Anotamos tu cita en esta pantalla. Aún no queda guardada.» con el nombre del servicio, la fecha y la hora elegidas.
6. Vaciar el formulario y quitar los errores.

No hay `window.confirm`. No hay estado de carga de datos: los servicios ya vienen por props.

## Presentación

Clases alineadas con el formulario de clientes: `flex flex-col gap-4`, inputs `w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50`, botón `rounded bg-zinc-50 px-4 py-2 text-sm text-zinc-950 disabled:opacity-50`.

`CampoReserva` cubre `text`, `tel`, `date`, `time` y `textarea`. `maxLength` en nombre (120), teléfono (20) y nota (300). Nombre, teléfono, fecha y hora llevan `required`. La nota no.

`SelectorServicio` lista `servicios` con `id` como value y `nombre` como texto. `required`.

`FormularioReserva` recibe `servicios: Servicio[]` y no importa `serviciosLanding` directo: el dato entra por `Landing` → `SeccionReserva`.

`app/page.tsx` no cambia: ya pasa `serviciosLanding` a `Landing`.

## Criterios de aceptación

- En `/`, `#reserva` muestra el formulario con nombre, teléfono, servicio, fecha, hora y nota, más «Ver horario».
- Enviar vacío deja los cinco obligatorios en error y no muestra la confirmación.
- Un teléfono de menos de 7 caracteres, una fecha de ayer, una hora ilegible o un servicio sin elegir muestran su error.
- Un envío con los cinco obligatorios válidos y nota vacía muestra la confirmación con el servicio, la fecha y la hora, y deja los campos vacíos.
- Recargar la página no recupera la cita.
- No aparece ninguna petición de red al enviar. No se crean archivos en `app/api`.
- `/clientes` sigue igual.
- El encabezado «Reservar» y «Ver cómo reservar» siguen bajando a `#reserva`.
