# CRUD de clientes en el navegador

## Objetivo

Una pantalla en `/clientes` para listar, crear, editar y borrar clientes. El navegador habla solo con la API ya implementada. La presentación no valida reglas de negocio ni llama a Supabase.

## Alcance

- Servicio de cliente HTTP sobre `/api/clientes`.
- Una ruta `/clientes` con formulario y lista.
- Estados de carga, vacío, error, envío y borrado.
- Reutilizar `types/cliente.ts`. No duplicar `Cliente`, `EntradaCliente` ni `ErrorCliente`.

## Fuera de alcance

- Reimplementar `app/api/clientes`, `lib/clientes/validar-cliente.ts`, `lib/clientes/repositorio-clientes.ts` o la migración.
- Auth, citas, barberos, paginación, búsqueda y orden distinto al de la API (`creado_en` descendente).
- Cambiar `/` (`Hola EDteam`), `app/layout.tsx`, `app/globals.css` o el título del documento.
- Instalar dependencias, librerías de íconos, CSS propio o SVG.
- Commit o despliegue.

## Suposiciones

- “Servicios en el frontend” es un módulo que hace `fetch` desde el navegador. No hay capa extra en el servidor de Next para esta pantalla.
- “Interfaz muy sencilla” es una sola vista: formulario arriba y lista abajo. No hay ruta de detalle ni de alta separada.
- Editar carga el cliente en el mismo formulario. Guardar en edición hace `PATCH` con el recurso completo.
- Borrar pide confirmación nativa (`window.confirm`) y luego `DELETE`.
- Los mensajes de error se muestran en español a partir del código `{ ok: false, error }`. No se muestra el JSON crudo.
- Si la respuesta no es JSON o la red falla, el mensaje es el mismo que `supabase_inalcanzable`.
- Fechas `creado_en` y `actualizado_en` no se muestran. El detalle vacío se muestra como “Sin detalle”.
- No hay enlace desde `/`. La pantalla se abre en `/clientes`.

## Contrato que se consume

Sin query string. `Content-Type: application/json` en `POST` y `PATCH`.

| Método | Ruta | Cuerpo | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/clientes` | — | `200` `{ ok: true, clientes }` |
| `POST` | `/api/clientes` | `EntradaCliente` (`detalle` opcional) | `201` `{ ok: true, cliente }` |
| `GET` | `/api/clientes/[id]` | — | `200` `{ ok: true, cliente }` |
| `PATCH` | `/api/clientes/[id]` | `EntradaCliente` completo | `200` `{ ok: true, cliente }` |
| `DELETE` | `/api/clientes/[id]` | — | `200` `{ ok: true }` |

Errores: `{ ok: false, error }` con `400 entrada_invalida`, `404 no_encontrado`, `409 correo_duplicado`, `503 entorno_incompleto` o `supabase_inalcanzable`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/cliente.ts` | Ya existe. No se modifica. |
| `lib/clientes/servicio-clientes.ts` | Únicas llamadas `fetch` del CRUD. Devuelve `ResultadoClientes`, `ResultadoCliente` o `ResultadoBorrado`. Sin JSX. |
| `lib/clientes/mensajes-error-cliente.ts` | Mapa `ErrorCliente` → texto en español. Sin red ni JSX. |
| `app/clientes/page.tsx` | Server Component. Renderiza el panel. Sin fetch. |
| `components/clientes/panel-clientes.tsx` | Client Component. Estado de lista, formulario, envío y borrado. Importa el servicio. |
| `components/clientes/formulario-cliente.tsx` | Campos y botones Guardar / Cancelar. Sin fetch. |
| `components/clientes/campo-cliente.tsx` | Un label + input o textarea. |
| `components/clientes/lista-clientes.tsx` | Lista o estado vacío. Sin fetch. |
| `components/clientes/fila-cliente.tsx` | Nombre, correo, teléfono, detalle y acciones Editar / Borrar. |
| `components/clientes/mensaje-cliente.tsx` | Un párrafo de error o de éxito. |

No crear hooks nuevos: el estado vive en `panel-clientes.tsx`. No crear componentes de íconos.

## Servicio

`lib/clientes/servicio-clientes.ts` exporta cuatro funciones async:

- `listarClientes(): Promise<ResultadoClientes>`
- `crearCliente(entrada: EntradaCliente): Promise<ResultadoCliente>`
- `actualizarCliente(id: string, entrada: EntradaCliente): Promise<ResultadoCliente>`
- `borrarCliente(id: string): Promise<ResultadoBorrado>`

Cada una:

1. `fetch` con `cache: "no-store"`.
2. Si `response.json()` falla, devolver `{ ok: false, error: "supabase_inalcanzable" }`.
3. Si el JSON tiene `ok: true` con la forma del tipo de éxito, devolverlo.
4. Si el JSON tiene `ok: false` y `error` es uno de los cinco códigos, devolverlo.
5. Cualquier otra forma o un `!response.ok` sin código conocido: `{ ok: false, error: "supabase_inalcanzable" }`.

No lee `NEXT_PUBLIC_` ni crea el cliente de Supabase. No llama a `GET /api/clientes/[id]`: la edición usa la fila ya listada.

`detalle` se envía solo si, tras `trim`, no está vacío. Nombre, correo y teléfono se envían con `trim`. El servicio no aplica las reglas de longitud ni el regex; eso lo hace la API.

## Mensajes

`lib/clientes/mensajes-error-cliente.ts` exporta `mensajeErrorCliente(error: ErrorCliente): string`.

| Código | Texto |
| --- | --- |
| `entrada_invalida` | Revisa nombre, correo, teléfono y detalle. |
| `correo_duplicado` | Ese correo ya está registrado. |
| `no_encontrado` | Ese cliente ya no existe. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

## Pantalla `/clientes`

Fondo `bg-white text-zinc-950`. Contenedor `mx-auto max-w-xl px-4 py-8`. Todo con clases Tailwind. Botones nativos, sin íconos.

### Formulario

Título visible: `Clientes`.

Campos, en este orden, cada uno en `campo-cliente.tsx`:

| name | Control | Label |
| --- | --- | --- |
| `nombre` | `input` text, `required`, `maxLength={120}` | Nombre |
| `correo` | `input` email, `required`, `maxLength={254}` | Correo |
| `telefono` | `input` tel, `required`, `maxLength={20}` | Teléfono |
| `detalle` | `textarea`, `maxLength={500}`, `rows={3}` | Detalle |

`htmlFor` / `id` coinciden con el `name`.

Botón principal: `Guardar` al crear y `Actualizar` al editar. Se deshabilita mientras `enviando` es true y su texto pasa a `Guardando…`.

Botón `Cancelar` solo en edición. Limpia el formulario y sale del modo edición sin llamar a la API. También se deshabilita mientras `enviando`.

Al guardar:

- Crear: `crearCliente`. Si `ok`, vaciar el formulario, anteponer el cliente a la lista y mostrar “Cliente guardado.”.
- Editar: `actualizarCliente` con el `id` en edición. Si `ok`, reemplazar esa fila, vaciar el formulario, salir de edición y mostrar “Cliente actualizado.”.
- Si `ok: false`, mostrar `mensajeErrorCliente`. No se vacía el formulario. Si el código es `no_encontrado` en edición, quitar esa fila de la lista y salir de edición.

### Lista

Mientras `cargando` y aún no hay datos: texto “Cargando clientes…”. No se muestra el formulario deshabilitado; el formulario sí se puede usar en cuanto termina la carga inicial. Durante la carga inicial el formulario permanece deshabilitado.

Si la carga inicial falla: el mensaje de error y un botón `Reintentar` que vuelve a llamar a `listarClientes`.

Si `clientes` está vacío y no hay error de carga: “Todavía no hay clientes.”

Cada fila (`fila-cliente.tsx`):

- Nombre en negrita.
- Correo y teléfono en líneas aparte.
- Detalle, o “Sin detalle” si `detalle === ""`.
- Botón `Editar`: copia la fila al formulario (`detalle` incluido) y marca ese `id` como edición. La fila en edición lleva `ring-1 ring-zinc-300`.
- Botón `Borrar`: `window.confirm("¿Borrar a {nombre}?")`. Si se acepta, `borrarCliente`. Si `ok`, quitar la fila. Si se estaba editando ese id, limpiar el formulario. Mostrar “Cliente borrado.”. Si `no_encontrado`, quitar la fila igual y mostrar el mensaje de no encontrado. Otros errores dejan la fila.

El botón `Borrar` de la fila cuyo `id` está en `borrandoId` dice `Borrando…` y queda deshabilitado. El resto de acciones de esa fila también se deshabilitan.

## Estado en `panel-clientes.tsx`

- `clientes: Cliente[]`
- `cargando: boolean` (inicio `true`)
- `enviando: boolean`
- `borrandoId: string | null`
- `editandoId: string | null`
- `aviso: { tipo: "error" | "exito"; texto: string } | null`
- Valores del formulario: `nombre`, `correo`, `telefono`, `detalle` (strings)

Al montar, un solo `listarClientes`. Un aviso nuevo reemplaza al anterior.

## Criterios de aceptación

- No hay dependencias nuevas ni cambios en `app/api`, `/` o `types/cliente.ts`.
- Abrir `/clientes` con la API disponible muestra el formulario y la lista que devuelve `GET /api/clientes`, la más reciente primero.
- Con lista vacía se lee “Todavía no hay clientes.”.
- Guardar nombre, correo, teléfono y detalle llama `POST /api/clientes` y la fila nueva aparece sin recargar la página.
- Omitir el detalle en el formulario envía el cuerpo sin `detalle` (o con el campo ausente). La fila muestra “Sin detalle”.
- Pulsar Editar y Actualizar llama `PATCH /api/clientes/[id]` con los cuatro campos y la fila cambia.
- Cancelar no llama a la API y restaura el formulario vacío.
- Borrar, tras confirmar, llama `DELETE` y la fila desaparece.
- Un correo repetido muestra “Ese correo ya está registrado.” y no duplica la fila.
- Una respuesta `entrada_invalida` muestra “Revisa nombre, correo, teléfono y detalle.”.
- Si `GET` inicial falla, se ve el mensaje y `Reintentar` vuelve a pedir la lista.
- Los textos de UI están en español. No hay SVG, CSS nuevo ni íconos.
