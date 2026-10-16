# Módulo de estilos, cita y pasarela en el navegador

## Objetivo

En `/`, el cliente ve los estilos de corte con su valor, agenda la cita y el navegador lo lleva a la URL de pasarela que devuelve el alta. La presentación habla solo con la API ya implementada.

## Alcance

- Catálogo en `#servicios` leído de `GET /api/servicios`.
- Formulario de `#reserva` que envía `POST /api/citas` y, con pago pendiente, asigna `window.location` a `url_pasarela`.
- Si el alta responde `correo_no_enviado`, un `GET /api/pagos/[id]` recupera esa URL y el navegador sigue a la pasarela.
- Campo correo, obligatorio para el contrato de alta.
- Precio visible en soles, a partir de `precio_centavos`.
- Estados de carga, error de catálogo, validación, envío y fallo de alta.

## Fuera de alcance

- Cambiar `app/api/servicios`, `app/api/citas`, `app/api/pagos/[id]`, `app/api/pagos/webhook`, repositorios, validación de alta o migraciones.
- Llamar al webhook, elegir barbero, cupos, solapes o horario de atención.
- Pantalla de retorno, polling del pago o cobro dentro de la app. La pasarela es el sitio de `url_pasarela`.
- `GET /api/citas`, `/citas`, `/clientes`, `/servidores`, `/servicios-ofrecidos` y `/desempeno`.
- Copiar los precios de `lib/landing/servicios.ts` (18000, 12000, 28000). Esa lista deja de alimentar `/`.
- Instalar dependencias, librerías de íconos, CSS propio o SVG. No hay íconos en este cambio.
- Commit o despliegue.

## Suposiciones

- La página de Notion está en blanco. El título es el requerimiento y el módulo vive en la landing, no en una ruta nueva.
- El orden de las tarjetas es el del JSON. No se reordena en el cliente.
- El valor que ve el cliente es `precio_centavos / 100` con moneda `PEN`. La API sigue recibiendo y devolviendo el entero. Ejemplo: `2500` se muestra como `S/ 25.00`.
- `presentarPesos` y `PrecioServicio` formatean pesos colombianos enteros. No se reutilizan para este catálogo.
- El formulario actual no envía `correo` y dice que la cita no se guarda. Hay que añadir el correo y sustituir ese texto. El resto de campos se mantiene.
- `CampoReserva` hoy no admite `type="email"`. Se amplía el tipo del input; no se crea otro campo.
- `SelectorServicio` solo necesita `id` y `nombre`. Se estrecha esa prop para aceptar el catálogo sin mapearlo a `Servicio`.
- La fecha “hoy” del cliente pasa a `America/Lima`, igual que `validarAltaCita`. Se evita aceptar en pantalla un día que el alta rechaza.
- Un `201` redirige de inmediato. No hay pantalla intermedia de “cita guardada”.
- `correo_no_enviado` (`502`) ya creó el pago. El cuerpo trae `pago_id` y no trae `url_pasarela`. Ahí sí se usa `GET /api/pagos/[id]`. Si ese GET trae `url_pasarela`, se redirige igual.
- `pago_no_creado` no tiene URL. Se muestra el error y no se reenvía solo: un segundo POST crearía otra cita.
- No se abre la pasarela en otra pestaña.

## Contrato que se consume

| Método | Ruta | Cuerpo | Uso en la UI |
| --- | --- | --- | --- |
| `GET` | `/api/servicios` | — | Tarjetas y opciones del selector. |
| `POST` | `/api/citas` | `EntradaAltaCita` | Alta y, en `201`, `cita.pago.url_pasarela`. |
| `GET` | `/api/pagos/[id]` | — | Solo tras `correo_no_enviado`, para leer `url_pasarela`. |

`GET /api/servicios` → `200` `{ ok: true, servicios: EstiloPublico[] }` con `id`, `nombre`, `descripcion`, `precio_centavos`, `moneda`. `503` → `{ ok: false, error: "entorno_incompleto" \| "supabase_inalcanzable" }`.

`POST /api/citas` conserva `nombre`, `correo`, `telefono`, `servicioId`, `fecha`, `hora`, `nota`.

- `201`: `{ ok: true, cita }` y `cita.pago` con `id`, `monto_centavos`, `moneda: "PEN"`, `estado: "pendiente"`, `url_pasarela`.
- `400`: `entrada_invalida` o `servicio_desconocido`.
- `502`: `pago_no_creado` con `cita_id`, o `correo_no_enviado` con `cita_id` y `pago_id`.
- `503`: `entorno_incompleto` o `supabase_inalcanzable`.

`GET /api/pagos/[id]` → `200` `{ ok: true, pago }` y `url_pasarela` solo si `estado` es `pendiente`. `404` `no_encontrado`. `503` los mismos dos errores de entorno.

No se llama `POST /api/pagos/webhook`.

Tipos ya existentes, sin duplicar: `EstiloPublico`, `ResultadoCatalogo`, `EntradaAltaCita`, `ResultadoAltaCita`, `PagoPublico`, `ResultadoLecturaPago`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `lib/servicios/servicio-catalogo.ts` | Único `fetch` de `GET /api/servicios`. Devuelve `ResultadoCatalogo`. Sin JSX. |
| `lib/servicios/presentar-soles.ts` | `precio_centavos` → texto `PEN`. Sin JSX ni red. |
| `lib/servicios/mensajes-error-catalogo.ts` | `ErrorCatalogo` → español. |
| `lib/citas/servicio-alta-cita.ts` | Único `fetch` de `POST /api/citas`. Devuelve `ResultadoAltaCita`. Sin JSX. |
| `lib/citas/mensajes-error-alta.ts` | `ErrorAltaCita` → español. |
| `lib/pagos/servicio-pago.ts` | Único `fetch` de `GET /api/pagos/[id]`. Devuelve `ResultadoLecturaPago`. Sin JSX. |
| `lib/reservas/validar-reserva.ts` | Suma la regla de correo y “hoy” en Lima. Sigue sin red. |
| `types/reserva.ts` | `correo` en valores y errores. |
| `components/estilos/experiencia-cliente.tsx` | Client Component. Carga el catálogo una vez. Pinta servicios, el hueco de horarios y la reserva. |
| `components/estilos/precio-estilo.tsx` | Una línea de precio en soles. |
| `components/estilos/mensaje-catalogo.tsx` | Párrafo de carga o error del catálogo. |
| `components/landing/tarjeta-servicio.tsx` | Pasa a `EstiloPublico` y usa `PrecioEstilo`. |
| `components/landing/lista-servicios.tsx` | Lista `EstiloPublico`. Sigue siendo la sección `#servicios`. |
| `components/landing/landing.tsx` | Encabezado, hero y `ExperienciaCliente`. Ya no reparte `serviciosLanding`. |
| `components/landing/seccion-reserva.tsx` | Texto de que la cita se guarda y sigue a la pasarela. Sigue siendo Server Component. |
| `components/reservas/formulario-reserva.tsx` | Correo, `POST`, estados de envío y redirección. |
| `components/reservas/campo-reserva.tsx` | Acepta `type: "email"`. |
| `components/reservas/selector-servicio.tsx` | Lista `{ id: string; nombre: string }[]`. |
| `app/page.tsx` | Deja de pasar `serviciosLanding`. El hueco `horarios` entra a `Landing` igual que ahora. |

No se crean hooks. No se borra `lib/landing/servicios.ts`, `presentarPesos` ni `PrecioServicio`: dejan de usarse en `/` y no forman parte de este flujo.

## Pantallas

Una sola pantalla, `/`, en este orden:

1. Encabezado y hero, sin cambio de destino (`#reserva`).
2. `#servicios`. Tres tarjetas: nombre, descripción y precio en soles.
3. Horarios, el mismo `Suspense` de hoy, entre el catálogo y la reserva.
4. `#reserva`. Formulario. Tras un alta con URL, el documento navega a la pasarela y esta pantalla deja de verse.

No hay ruta `/estilos`, `/reservar` ni `/pago`.

## Componentes

`ExperienciaCliente` es el único Client Component nuevo de composición. Recibe `horarios: ReactNode`. Al montar llama a `servicio-catalogo`. Con `ok`, pasa `servicios` a `ListaServicios` y a `SeccionReserva`. Si el catálogo falla, muestra `MensajeCatalogo` y no monta el formulario.

`ListaServicios` sigue armando el `ul` y un `li` por estilo. `TarjetaServicio` solo pinta un artículo: `h3`, descripción y `PrecioEstilo`.

`SeccionReserva` conserva el título «Reservar cita», el formulario y el enlace «Ver horario». El párrafo deja de decir que la cita no se guarda. Texto fijo: «Elige estilo, fecha y hora. Al agendar te llevamos a la pasarela de pago.»

`FormularioReserva` conserva el estado. Campos, en orden: nombre, correo, teléfono, servicio, fecha, hora, nota. Reutiliza `CampoReserva`, `SelectorServicio`, `MensajeReserva` y `claseBotonPrincipal`. El botón dice «Agendar y pagar» y, mientras espera la red, «Agendando…» y queda `disabled`.

`MensajeCatalogo` es un párrafo con `claseTextoSuave` en carga y `claseError` en fallo. No se mezcla con `MensajeReserva`.

## Tipos y lógica fuera de la presentación

`ValoresReserva` gana `correo: string`, vacío al inicio. `ErroresReserva` incluye `correo`.

`validarReserva` recorta y exige correo de 1 a 254 caracteres que cumpla `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, el mismo criterio que `validarAltaCita`. El texto de error: «Escribe un correo válido de hasta 254 caracteres.» El valor que se envía va en minúsculas y recortado, igual que el resto de textos que ya recorta la validación de alta. La fecha mínima sale de `America/Lima` con `en-CA` (`AAAA-MM-DD`). El resto de reglas de nombre, teléfono, servicio, hora y nota no cambia. El segundo argumento pasa a ser `{ id: string }[]`.

`presentarSoles(centavos: number): string` usa `Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2, maximumFractionDigits: 2 })` sobre `centavos / 100`.

Cada servicio HTTP comprueba `response.ok` según el status del contrato, hace `response.json()` y estrecha el cuerpo al tipo existente. JSON inválido o red caída se devuelve como `supabase_inalcanzable`. No se muestra el JSON crudo.

`servicio-alta-cita` envía `Content-Type: application/json` y el objeto `EntradaAltaCita` ya validado en el cliente. `cache: "no-store"` en los tres `fetch`.

Mensajes de catálogo, ambos códigos: «No pudimos cargar los estilos. Recarga la página.»

Mensajes de alta:

| Código | Texto |
| --- | --- |
| `entrada_invalida` | «Revisa los datos e inténtalo de nuevo.» |
| `servicio_desconocido` | «Ese estilo ya no está disponible. Recarga la página.» |
| `entorno_incompleto` | «No podemos agendar ahora. Inténtalo más tarde.» |
| `supabase_inalcanzable` | «No pudimos guardar la cita. Inténtalo de nuevo.» |
| `pago_no_creado` | «La cita quedó creada, pero no hay enlace de pago. No vuelvas a enviar el formulario.» |
| `correo_no_enviado` | «La cita quedó creada. No pudimos abrir la pasarela.» |

El de `correo_no_enviado` solo se muestra si el `GET` del pago no trae una `url_pasarela` string no vacía.

## Comportamiento visible

Carga: `#servicios` muestra «Cargando estilos…». El formulario no está. Los horarios siguen su propio `Suspense`.

Catálogo `200`: tres tarjetas y el selector con los mismos `id`. Precios de la base, no los de la landing estática: Corte clásico `S/ 25.00`, Arreglo de barba `S/ 15.00`, Corte y barba `S/ 35.00`, si `precio_centavos` sigue en 2500, 1500 y 3500.

Catálogo `503` o red: el mensaje de catálogo y ningún botón de agendar.

Edición: igual que hoy. El primer envío inválido marca los campos; los siguientes actualizan errores al escribir. El correo entra en esa validación. No hay `fetch` hasta que `validarReserva` devuelve `ok`.

Envío válido: se vacían los errores, el botón queda en «Agendando…» y los campos `disabled`. Los valores no se borran antes de conocer la respuesta.

`201` con `cita.pago.estado === "pendiente"` y `url_pasarela` absoluta: `window.location.assign(url_pasarela)`.

`201` sin esa URL: se trata como `supabase_inalcanzable`, se rehabilita el formulario y se muestra `MensajeReserva` `tipo="error"`.

`502 correo_no_enviado`: `GET /api/pagos/${pago_id}`. Con `pago.estado === "pendiente"` y `url_pasarela` string no vacía, `window.location.assign`. Si el GET es `404`, `503`, falla la red o `url_pasarela` es `null`, mensaje de `correo_no_enviado` y el formulario vuelve a habilitarse. No se hace un segundo POST.

`502 pago_no_creado` y el resto de errores: mensaje de la tabla, formulario habilitado, valores conservados.

Confirmación en pantalla: no hay. `MensajeReserva` `tipo="confirmacion"` deja de usarse en el envío. El componente se queda para no partir la UI de error.

Clases solo de `lib/ui/clases.ts` y utilidades Tailwind ya usadas en esas secciones (`mx-auto max-w-3xl px-4 py-12`, `mt-6 grid gap-4 md:grid-cols-3`, `mt-6 flex flex-col gap-4`). Tema oscuro actual, sin CSS nuevo.

## Criterios de aceptación

- `/` muestra nombre, descripción y precio en soles de `GET /api/servicios`. No muestra 18000, 12000 ni 28000.
- Con el catálogo en error, no se puede pulsar «Agendar y pagar».
- El formulario exige correo además de nombre, teléfono, estilo, fecha y hora. La nota sigue opcional.
- Un envío inválido no llama a la red y marca el campo.
- Un `POST /api/citas` con cuerpo válido que responde `201` navega a `cita.pago.url_pasarela` en la misma pestaña.
- Ante `correo_no_enviado`, la UI pide `GET /api/pagos/[pago_id]` y navega a `url_pasarela` si viene informada.
- Ante `pago_no_creado`, `400` o `503`, la UI permanece en `#reserva`, muestra el texto de ese código y no crea otra petición de alta por su cuenta.
- No hay dependencia nueva, ícono, SVG, CSS propio ni ruta de API nueva.
