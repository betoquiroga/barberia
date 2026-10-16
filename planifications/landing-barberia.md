# Landing pública de la barbería

## Objetivo

Sustituir el contenido de `/` por una landing pública en español, en el tema oscuro que ya usa el layout. La página tiene encabezado con anclas, hero, servicios, horarios de atención leídos de la base y una sección de cómo reservar con un llamado a la acción. No hay formulario de reserva.

## Alcance

- Reescribir `app/page.tsx` como Server Component que arma la landing.
- Actualizar el título y la descripción del documento en `app/layout.tsx`.
- Tipos de servicio en `types/`. Texto fijo de servicios y formateo de horarios en `lib/landing/`.
- Componentes de presentación en `components/landing/`, uno por archivo.
- Leer horarios con `listarHorarios` de `lib/horarios/repositorio-horarios.ts` y el tipo `Horario` de `types/horario.ts`.

## Fuera de alcance

- Crear, editar o borrar horarios desde la landing. `POST` y `DELETE` de `/api/horarios` no se llaman.
- Tabla, API o formulario de reservas. El llamado a la acción no guarda datos.
- Cambiar `/clientes`, las rutas de API ni las migraciones.
- Borrar `components/hola-edteam/` ni `hooks/use-typewriter.ts`. La home deja de montarlos.
- Instalar dependencias, librerías de íconos, CSS propio, SVG o imágenes.
- Commit o despliegue.

## Suposiciones

- La página de Notion solo trae el título. La landing se decide así: hero, tres servicios, horarios reales y una sección de reserva presencial.
- El nombre visible es «Barbería». El subtítulo del hero es «Corte y arreglo de barba, con hora de atención clara».
- Los servicios son copia fija, porque no hay catálogo en la base: Corte clásico, Arreglo de barba, Corte y barba. Cada uno tiene una frase corta y no tiene precio.
- El orden de los días es lunes a domingo, con las etiquetas Lunes, Martes, Miércoles, Jueves, Viernes, Sábado y Domingo.
- Si `listarHorarios` devuelve `ok: false`, la sección de horarios muestra «No pudimos cargar el horario» y el resto de la página sigue visible.
- Si `ok: true` y el arreglo está vacío, esa sección muestra «Horario por confirmar».
- Un día con `cerrado: true` se muestra como «Cerrado». Un día abierto muestra `abre` y `cierra` tal como vienen (`HH:MM`), unidos por « a ».
- Los días que no vengan en la respuesta no se inventan.
- El botón del hero y el del cierre llevan a `#reserva` en la misma página. No hay otra ruta.
- Cómo reservar: el texto dice que la reserva es presencial, en el local, dentro del horario publicado. No hay teléfono, mapa ni correo, porque el proyecto no los tiene.
- Se mantiene `lang="es"`, `scheme-dark`, fondo `bg-zinc-950` y texto `text-zinc-50`. Solo clases de Tailwind.

## Archivos a modificar

### `app/layout.tsx`

Responsabilidad: documento y metadata. El `title` pasa a `Barbería`. La `description` pasa a `Corte y arreglo de barba. Consulta servicios y horario de atención.` `themeColor` y las clases de `html` y `body` se quedan igual.

### `app/page.tsx`

Responsabilidad: obtener los horarios en el servidor y renderizar un `main` con la landing. Llama a `listarHorarios()`. Pasa a `Landing` el resultado (`horarios` o el fallo) y la lista fija de servicios. No formatea horas ni decide textos de estado.

## Archivos a crear

### `types/servicio.ts`

`Servicio`: `id` (`string`), `nombre` (`string`), `descripcion` (`string`).

### `lib/landing/servicios.ts`

Exporta `serviciosLanding: Servicio[]` con los tres servicios de las suposiciones, en ese orden. Sin lógica de UI.

### `lib/landing/presentar-horarios.ts`

Recibe `Horario[]` y devuelve filas listas para pintar, ordenadas de lunes a domingo:

- `dia`: etiqueta en español.
- `franja`: `Cerrado` o `${abre} a ${cierra}`.

Los días ausentes no generan fila. No importa React.

### `components/landing/landing.tsx`

Compone, en este orden: `EncabezadoLanding`, `HeroLanding`, `ListaServicios`, `SeccionHorarios`, `SeccionReserva`. Recibe servicios y el resultado de horarios. No llama a Supabase.

### `components/landing/encabezado-landing.tsx`

Barra superior: el texto «Barbería» y tres enlaces, «Servicios» (`#servicios`), «Horario» (`#horario`) y «Reservar» (`#reserva`).

### `components/landing/hero-landing.tsx`

`h1` «Barbería», el subtítulo de las suposiciones y un enlace «Ver cómo reservar» hacia `#reserva`.

### `components/landing/lista-servicios.tsx`

Sección `id="servicios"`. Título «Servicios». Recorre los servicios y renderiza `TarjetaServicio`.

### `components/landing/tarjeta-servicio.tsx`

Muestra `nombre` y `descripcion` de un `Servicio`.

### `components/landing/seccion-horarios.tsx`

Sección `id="horario"`. Título «Horario». Si el resultado no es ok, muestra el texto de error. Si la lista está vacía, muestra «Horario por confirmar». Si hay filas, llama a `presentarHorarios` y renderiza `FilaHorario` por cada una.

### `components/landing/fila-horario.tsx`

Una fila: etiqueta del día y la franja.

### `components/landing/seccion-reserva.tsx`

Sección `id="reserva"`. Título «Reserva en el local». Párrafo: la reserva es presencial y se hace dentro del horario de atención. Enlace «Ver horario» hacia `#horario`.

## Comportamiento visible

| Estado | Qué se ve |
| --- | --- |
| Carga correcta con horarios | Hero, tres servicios y una fila por cada día devuelto, ya ordenada. |
| Lista vacía | El resto de la landing y, en horario, «Horario por confirmar». |
| Error de lectura | El resto de la landing y, en horario, «No pudimos cargar el horario». |
| Día cerrado | La etiqueta del día y «Cerrado». |
| Día abierto | La etiqueta del día y la franja `abre a cierra`. |

En viewports estrechos las secciones van en una columna con `px-4` y `max-w-3xl` centrado. Desde `md`, las tarjetas de servicio van en tres columnas.

## Criterios de aceptación

- `yarn dev` y abrir `/` muestra la landing y no el texto «Hola EDteam».
- El documento tiene título «Barbería».
- Los anclas `#servicios`, `#horario` y `#reserva` existen y los enlaces del encabezado y del hero llegan a ellos.
- Los tres servicios aparecen con el nombre y la descripción definidos en `lib/landing/servicios.ts`.
- Con filas en `horarios_atencion`, `/` lista esos días en orden de lunes a domingo, con «Cerrado» o la franja de horas.
- Con la tabla vacía se lee «Horario por confirmar» y el hero y los servicios siguen visibles.
- Si la lectura falla, se lee «No pudimos cargar el horario» y no hay excepción sin manejar en la página.
- No hay formulario, botón que envíe datos, ni llamada a `POST /api/horarios` o a clientes.
- No se agregan dependencias, archivos CSS ni SVG. `yarn.lock` no cambia.
