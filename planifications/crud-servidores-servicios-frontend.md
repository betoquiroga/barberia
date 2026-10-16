# CRUD de servidores y servicios en el navegador

## Objetivo

Dos pantallas para administrar personas que prestan servicios y los servicios con precio y costo en pesos. `/servidores` lista, crea, edita y borra servidores. `/servicios-ofrecidos` lista, crea, edita y borra servicios y elige qué servidores los prestan. El navegador habla solo con las API ya implementadas. La presentación no valida reglas de negocio ni llama a Supabase.

## Alcance

- Servicio HTTP de servidores sobre `/api/servidores`.
- Servicio HTTP de servicios ofrecidos sobre `/api/servicios-ofrecidos`.
- Ruta `/servidores` con formulario y lista.
- Ruta `/servicios-ofrecidos` con formulario (nombre, precio, costo y servidores) y lista.
- Estados de carga, vacío, error, envío y borrado en cada pantalla.
- Reutilizar `types/servidor.ts`, `types/servicio-ofrecido.ts` y `lib/landing/presentar-pesos.ts`.

## Fuera de alcance

- Cambiar `app/api/servidores`, `app/api/servicios-ofrecidos`, `lib/servidores/validar-servidor.ts`, `lib/servidores/repositorio-servidores.ts`, `lib/servicios-ofrecidos/validar-servicio-ofrecido.ts`, `lib/servicios-ofrecidos/repositorio-servicios-ofrecidos.ts`, las migraciones o los tipos de dominio.
- Auth, citas, barberos, desempeño, `public.servicios`, `lib/landing/servicios.ts`, `types/servicio.ts` y el catálogo de la landing.
- Cambiar `/`, `app/layout.tsx`, `app/globals.css` o el encabezado de la landing.
- Paginación, búsqueda y un orden distinto al de la API.
- Instalar dependencias, librerías de íconos, CSS propio o SVG.
- Commit o despliegue.

## Suposiciones

- «Servidor» es la persona que crea o presta el servicio. No es un host. La pantalla lo llama «Servidor».
- Cada módulo es una sola vista: formulario arriba y lista abajo. No hay ruta de detalle.
- Editar carga la fila en el mismo formulario. Guardar en edición hace `PATCH` con el recurso completo.
- Borrar pide confirmación nativa (`window.confirm`) y luego `DELETE`.
- Los mensajes de error salen en español a partir de `{ ok: false, error }`. No se muestra el JSON crudo.
- Si la respuesta no es JSON o la red falla, el mensaje es el de `supabase_inalcanzable`.
- Fechas `creado_en` y `actualizado_en` no se muestran.
- No hay enlace desde `/`. Cada pantalla enlaza a la otra con un `<a>` de texto.
- El ejemplo «Corte de cabello», costo 5000 y precio 15000, es el placeholder del formulario de servicios. El alta no precarga esos valores: la semilla ya ocupa ese nombre y un segundo alta responde `409`.
- Precio y costo se capturan como pesos enteros. En la lista se muestran con `presentarPesos`.
- Un servicio puede quedar sin servidores. La lista de casillas sale de `GET /api/servidores` al abrir `/servicios-ofrecidos`.
- `PATCH` de un servicio reemplaza `servidor_ids` por las casillas marcadas en ese momento.

## Contrato que se consume

Sin query string. `Content-Type: application/json` en `POST` y `PATCH`.

| Método | Ruta | Cuerpo | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/servidores` | — | `200` `{ ok: true, servidores }` |
| `POST` | `/api/servidores` | `EntradaServidor` | `201` `{ ok: true, servidor }` |
| `PATCH` | `/api/servidores/[id]` | `EntradaServidor` completo | `200` `{ ok: true, servidor }` |
| `DELETE` | `/api/servidores/[id]` | — | `200` `{ ok: true }` |
| `GET` | `/api/servicios-ofrecidos` | — | `200` `{ ok: true, servicios }` |
| `POST` | `/api/servicios-ofrecidos` | `EntradaServicioOfrecido` | `201` `{ ok: true, servicio }` |
| `PATCH` | `/api/servicios-ofrecidos/[id]` | `EntradaServicioOfrecido` completo | `200` `{ ok: true, servicio }` |
| `DELETE` | `/api/servicios-ofrecidos/[id]` | — | `200` `{ ok: true }` |

No llamar a `GET` por id: la edición usa la fila ya listada.

Errores de servidores: `400 entrada_invalida`, `404 no_encontrado`, `503 entorno_incompleto` o `supabase_inalcanzable`.

Errores de servicios: los anteriores más `409 nombre_duplicado` y `422 servidor_inexistente`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/servidor.ts` | Ya existe. No se modifica. |
| `types/servicio-ofrecido.ts` | Ya existe. No se modifica. |
| `lib/landing/presentar-pesos.ts` | Ya existe. Formato COP sin decimales. No se modifica. |
| `lib/servidores/servicio-servidores.ts` | Únicas llamadas `fetch` del CRUD de servidores. Sin JSX. |
| `lib/servidores/mensajes-error-servidor.ts` | Mapa `ErrorServidor` → texto. Sin red ni JSX. |
| `lib/servicios-ofrecidos/servicio-servicios-ofrecidos.ts` | Únicas llamadas `fetch` del CRUD de servicios. Sin JSX. |
| `lib/servicios-ofrecidos/mensajes-error-servicio-ofrecido.ts` | Mapa `ErrorServicioOfrecido` → texto. Sin red ni JSX. |
| `app/servidores/page.tsx` | Server Component. Renderiza el panel. Sin fetch. |
| `components/servidores/panel-servidores.tsx` | Client Component. Estado de lista, formulario, envío y borrado. |
| `components/servidores/formulario-servidor.tsx` | Campos y botones. Sin fetch. Exporta `ValoresFormularioServidor`. |
| `components/servidores/campo-servidor.tsx` | Un label + input de texto. |
| `components/servidores/casilla-activo.tsx` | Checkbox «Activo». |
| `components/servidores/lista-servidores.tsx` | Lista o estado vacío. Sin fetch. |
| `components/servidores/fila-servidor.tsx` | Nombre, teléfono, activo y acciones. |
| `components/servidores/mensaje-servidor.tsx` | Un párrafo de error o de éxito. |
| `components/servidores/enlace-servicios.tsx` | Enlace de texto a `/servicios-ofrecidos`. |
| `app/servicios-ofrecidos/page.tsx` | Server Component. Renderiza el panel. Sin fetch. |
| `components/servicios-ofrecidos/panel-servicios.tsx` | Client Component. Estado de servicios, de servidores para las casillas, formulario, envío y borrado. |
| `components/servicios-ofrecidos/formulario-servicio.tsx` | Nombre, precio, costo, casillas y botones. Sin fetch. Exporta `ValoresFormularioServicio`. |
| `components/servicios-ofrecidos/campo-servicio.tsx` | Un label + input text o number. |
| `components/servicios-ofrecidos/selector-servidores.tsx` | Casillas de servidores. Sin fetch. |
| `components/servicios-ofrecidos/lista-servicios.tsx` | Lista o estado vacío. Sin fetch. |
| `components/servicios-ofrecidos/fila-servicio.tsx` | Nombre, precio, costo, servidores y acciones. |
| `components/servicios-ofrecidos/nombres-servidores.tsx` | Nombres de los servidores de una fila, o el texto vacío. |
| `components/servicios-ofrecidos/mensaje-servicio.tsx` | Un párrafo de error o de éxito. |
| `components/servicios-ofrecidos/enlace-servidores.tsx` | Enlace de texto a `/servidores`. |

No crear hooks nuevos. El estado vive en cada panel. No crear componentes de íconos. Los tipos de dominio no se duplican. `ValoresFormularioServidor` y `ValoresFormularioServicio` son estado de formulario y viven en el archivo del formulario.

## Servicios HTTP

Mismo criterio que `lib/clientes/servicio-clientes.ts`.

`lib/servidores/servicio-servidores.ts` exporta:

- `listarServidores(): Promise<ResultadoServidores>`
- `crearServidor(entrada: EntradaServidor): Promise<ResultadoServidor>`
- `actualizarServidor(id: string, entrada: EntradaServidor): Promise<ResultadoServidor>`
- `borrarServidor(id: string): Promise<ResultadoBorradoServidor>`

`lib/servicios-ofrecidos/servicio-servicios-ofrecidos.ts` exporta:

- `listarServiciosOfrecidos(): Promise<ResultadoServiciosOfrecidos>`
- `crearServicioOfrecido(entrada: EntradaServicioOfrecido): Promise<ResultadoServicioOfrecido>`
- `actualizarServicioOfrecido(id: string, entrada: EntradaServicioOfrecido): Promise<ResultadoServicioOfrecido>`
- `borrarServicioOfrecido(id: string): Promise<ResultadoBorradoServicioOfrecido>`

Cada función:

1. `fetch` con `cache: "no-store"`.
2. Si `response.json()` falla o la red lanza, `{ ok: false, error: "supabase_inalcanzable" }`.
3. Si el JSON tiene `ok: true` y la forma del tipo de éxito, devolverlo. Un servidor de éxito tiene `id`, `nombre`, `telefono` string, `activo` boolean y las dos fechas string. Un servicio de éxito tiene además `precio_pesos` y `costo_pesos` number y `servidores` array de servidores válidos.
4. Si el JSON tiene `ok: false` y `error` es un código del tipo, devolverlo.
5. Cualquier otra forma: `{ ok: false, error: "supabase_inalcanzable" }`.

No lee `NEXT_PUBLIC_` ni crea el cliente de Supabase.

Cuerpo de servidor, tras `trim` del nombre:

- `nombre` siempre.
- `telefono` solo si, tras `trim`, no está vacío. Si está vacío, se omite (la API guarda `""`).
- `activo` siempre, boolean del checkbox.

Cuerpo de servicio:

- `nombre` con `trim`.
- `precio_pesos` y `costo_pesos` como enteros (`Number` del input). Si el texto no es un entero, igual se envían los números que salgan del parseo; la API responde `entrada_invalida`.
- `servidor_ids`: array de ids marcados. Array vacío se envía como `[]`.

El servicio HTTP no aplica longitud, teléfono, tope de pesos ni unicidad.

## Mensajes

`mensajeErrorServidor(error: ErrorServidor): string`

| Código | Texto |
| --- | --- |
| `entrada_invalida` | Revisa el nombre, el teléfono y si está activo. |
| `no_encontrado` | Ese servidor ya no existe. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

`mensajeErrorServicioOfrecido(error: ErrorServicioOfrecido): string`

| Código | Texto |
| --- | --- |
| `entrada_invalida` | Revisa el nombre, el precio y el costo. El precio tiene que cubrir el costo. |
| `nombre_duplicado` | Ya existe un servicio con ese nombre. |
| `servidor_inexistente` | Uno de los servidores elegidos ya no existe. |
| `no_encontrado` | Ese servicio ya no existe. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

## Pantalla `/servidores`

Misma caja que `/clientes`: `main` con `min-h-dvh bg-zinc-950 text-zinc-50` y contenedor `mx-auto max-w-xl px-4 py-8`. Solo clases Tailwind. Botones nativos.

Título: `Servidores`. Debajo, `EnlaceServicios` con el texto `Servicios` y `href="/servicios-ofrecidos"`, clase `text-sm text-zinc-300 hover:text-zinc-50`.

### Formulario

`ValoresFormularioServidor`: `nombre: string`, `telefono: string`, `activo: boolean`. Vacío: `""`, `""`, `true`.

| Campo | Control | Label |
| --- | --- | --- |
| `nombre` | `input` text, `required`, `maxLength={120}` | Nombre |
| `telefono` | `input` tel, sin `required`, `maxLength={20}` | Teléfono |
| `activo` | `input` checkbox | Activo |

`htmlFor` / `id` coinciden. El teléfono puede quedar vacío.

Botón principal: `Guardar` al crear, `Actualizar` al editar, `Guardando…` mientras `enviando`. Se deshabilita si `cargando` o `enviando`.

`Cancelar` solo en edición. Limpia el formulario (`activo` vuelve a `true`) y sale de edición sin llamar a la API. También se deshabilita mientras `enviando`.

Al guardar:

- Crear: `crearServidor`. Si `ok`, vaciar, anteponer la fila y mostrar «Servidor guardado.».
- Editar: `actualizarServidor`. Si `ok`, reemplazar la fila, vaciar y mostrar «Servidor actualizado.».
- Si `ok: false`, mostrar el mensaje y conservar el formulario. Si en edición el código es `no_encontrado`, quitar esa fila y salir de edición.

### Lista

Carga inicial: «Cargando servidores…». El formulario queda deshabilitado hasta que termine.

Si el `GET` falla: mensaje y botón `Reintentar` que vuelve a llamar a `listarServidores`.

Lista vacía sin error: «Todavía no hay servidores.»

Cada fila:

- Nombre en negrita.
- Teléfono, o «Sin teléfono» si `telefono === ""`.
- «Activo» o «Inactivo» según `activo`.
- `Editar`: copia nombre, teléfono y activo al formulario y marca el id. La fila en edición lleva `ring-1 ring-zinc-300`.
- `Borrar`: `window.confirm("¿Borrar a {nombre}?")`. Si se acepta, `borrarServidor`. Si `ok`, quitar la fila y mostrar «Servidor borrado.». Si se editaba ese id, limpiar el formulario. Si `no_encontrado`, quitar la fila y mostrar el mensaje de no encontrado. Otros errores dejan la fila.

La fila con `borrandoId` muestra `Borrando…` y deshabilita Editar y Borrar.

## Pantalla `/servicios-ofrecidos`

Misma caja visual. Título: `Servicios`. `EnlaceServidores` con el texto `Servidores` y `href="/servidores"`.

Al montar, en paralelo, `listarServiciosOfrecidos` y `listarServidores`. Las casillas usan la segunda lista. El orden de ambas es el de la API.

### Formulario

`ValoresFormularioServicio`: `nombre: string`, `precio: string`, `costo: string`, `servidorIds: string[]`. Vacío: `""`, `""`, `""`, `[]`. Precio y costo se guardan como texto del input para no perder lo que escribe la persona; al enviar se convierten con `Number`.

| Campo | Control | Label |
| --- | --- | --- |
| `nombre` | `input` text, `required`, `maxLength={80}`, `placeholder="Corte de cabello"` | Nombre |
| `precio` | `input` number, `required`, `min={1}`, `step={1}`, `placeholder="15000"` | Precio (pesos) |
| `costo` | `input` number, `required`, `min={1}`, `step={1}`, `placeholder="5000"` | Costo (pesos) |
| servidores | casillas | Servidores |

`SelectorServidores` recibe `servidores: Servidor[]` y `elegidos: string[]`. Cada casilla usa el `id` del servidor como `id` del input y el `nombre` como etiqueta. Si `activo` es false, el nombre se acompaña de «(inactivo)»; la casilla sigue siendo marcable. Si no hay servidores, el texto es «No hay servidores. Crea uno para asignarlo.» y no hay casillas. Marcar o desmarcar actualiza `servidorIds` sin llamar a la API.

Botones iguales a servidores: `Guardar` / `Actualizar` / `Guardando…` y `Cancelar` solo en edición.

Al guardar se envía `{ nombre, precio_pesos, costo_pesos, servidor_ids }`.

- Crear: si `ok`, anteponer el servicio devuelto (incluye `servidores`), vaciar y mostrar «Servicio guardado.».
- Editar: si `ok`, reemplazar la fila, vaciar y mostrar «Servicio actualizado.».
- `nombre_duplicado` o `entrada_invalida`: mensaje y se conserva el formulario.
- `servidor_inexistente`: mensaje, se conserva el formulario y se vuelve a pedir `listarServidores` para refrescar las casillas.
- `no_encontrado` en edición: mensaje, quitar la fila y salir de edición.

### Lista

«Cargando servicios…» mientras falta el `GET` de servicios. Si ese `GET` falla: mensaje y `Reintentar`, que vuelve a pedir servicios y servidores. Si solo falla el `GET` de servidores, los servicios se listan igual, las casillas muestran el mensaje de error de servidores y un `Reintentar` que solo vuelve a pedir servidores.

Lista vacía sin error: «Todavía no hay servicios.» Con la semilla, la primera fila es «Corte de cabello», precio `presentarPesos(15000)`, costo `presentarPesos(5000)` y «Sin servidores».

Cada fila:

- Nombre en negrita.
- Precio y costo con `presentarPesos`, en líneas «Precio: …» y «Costo: …».
- `NombresServidores`: nombres unidos por «, » en el orden del array, o «Sin servidores» si está vacío.
- `Editar`: copia nombre, `String(precio_pesos)`, `String(costo_pesos)` y los `id` de `servicio.servidores`. Fila en edición con `ring-1 ring-zinc-300`.
- `Borrar`: `window.confirm("¿Borrar el servicio {nombre}?")`. Si `ok`, quitar la fila y mostrar «Servicio borrado.». El borrado no quita servidores. `no_encontrado` quita la fila y muestra el mensaje.

## Estado

`panel-servidores.tsx`:

- `servidores: Servidor[]`
- `cargando`, `enviando`, `borrandoId`, `editandoId`
- `aviso: { tipo: "error" | "exito"; texto: string } | null`
- `errorCarga: string | null`
- `valores: ValoresFormularioServidor`

`panel-servicios.tsx`: los mismos campos para servicios, más `servidores: Servidor[]`, `cargandoServidores: boolean` y `errorServidores: string | null`.

Un aviso nuevo reemplaza al anterior. Tras un alta o una edición correcta se limpia el error de carga de la lista.

## Criterios de aceptación

- No hay dependencias nuevas ni cambios en `app/api`, en los repositorios, en la validación de servidor, en `/` ni en `types/servidor.ts` y `types/servicio-ofrecido.ts`.
- `/servidores` muestra el formulario y la lista de `GET /api/servidores`.
- Guardar solo el nombre llama `POST /api/servidores` sin `telefono` y la fila muestra «Sin teléfono» y «Activo».
- Editar y Actualizar llama `PATCH` con nombre, teléfono (si hay) y activo, y la fila cambia.
- Desmarcar Activo y actualizar muestra «Inactivo».
- Cancelar no llama a la API y deja el formulario vacío con Activo marcado.
- Borrar, tras confirmar, llama `DELETE` y la fila desaparece.
- Un teléfono inválido o un nombre vacío que la API rechace muestra «Revisa el nombre, el teléfono y si está activo.».
- `/servicios-ofrecidos` muestra «Corte de cabello» con precio y costo formateados en pesos (15000 y 5000) y «Sin servidores».
- Los placeholders del formulario son «Corte de cabello», «15000» y «5000».
- Crear otro nombre con precio 15000, costo 5000 y un servidor marcado llama `POST` con `servidor_ids` y la fila nueva muestra el nombre de ese servidor.
- Crear o editar sin casillas envía `servidor_ids: []` y la fila muestra «Sin servidores».
- Editar y dejar solo otras casillas llama `PATCH` con esa lista y la fila muestra solo esos servidores.
- Repetir el nombre «Corte de cabello» muestra «Ya existe un servicio con ese nombre.» y no duplica la fila.
- Precio menor que costo muestra el mensaje de `entrada_invalida`.
- Borrar un servicio lo quita de la lista y el servidor sigue en `/servidores`.
- Si el `GET` inicial de una pantalla falla, se ve el mensaje y `Reintentar` vuelve a pedir los datos.
- Los textos de la interfaz están en español. No hay SVG, CSS nuevo ni íconos.
