# Módulo administrativo en el navegador

## Objetivo

Una pantalla en `/administracion` para dar de alta barberos y cambiar el precio en soles de cada servicio del catálogo. El navegador habla solo con las rutas ya implementadas. La presentación no valida reglas de negocio ni llama a Supabase.

## Alcance

- Servicio HTTP de barberos sobre `GET` y `POST /api/barberos`.
- Servicio HTTP de precio sobre `PATCH /api/servicios/[id]`.
- Lectura del catálogo reutilizando `leerCatalogo` de `lib/servicios/servicio-catalogo.ts` (`GET /api/servicios`).
- Una ruta `/administracion` con dos bloques: alta y listado de barberos, y precio de los tres servicios.
- Estados de carga, vacío, error y envío en cada bloque.
- Reutilizar `types/barbero.ts`, `types/catalogo-servicio.ts`, `types/precio-servicio.ts` y `lib/servicios/presentar-soles.ts`.

## Fuera de alcance

- Reimplementar o cambiar `app/api/barberos`, `app/api/servicios`, `app/api/servicios/[id]`, `lib/barberos/**`, `lib/servicios/validar-precio.ts`, `lib/servicios/repositorio-precio.ts`, `lib/servicios/repositorio-catalogo.ts` o la migración.
- Editar, desactivar después del alta o borrar barberos. La API no lo ofrece.
- Crear, renombrar, describir o borrar servicios. El catálogo sigue siendo los tres ids.
- Auth, enlace desde la landing, citas, pagos, desempeño, servidores, servicios ofrecidos ni `app/layout.tsx`.
- Instalar dependencias, librerías de íconos, CSS propio o SVG.
- Commit o despliegue.

## Suposiciones

- La página de Notion no tiene cuerpo. El título es el requerimiento: agregar barberos y fijar el precio de cada servicio.
- Una sola vista. No hay rutas de detalle ni de alta separada.
- El administrador escribe el precio en soles (PEN), con coma o punto y como máximo dos decimales. El cliente lo convierte a `precio_centavos` entero antes del `PATCH`. La API no recibe soles.
- `activo` se envía siempre como boolean. La casilla nace marcada.
- El listado muestra activos e inactivos en el orden de la API. No se reordena en el cliente. Fechas no se muestran.
- No hay enlace desde `/`. La pantalla se abre en `/administracion`.
- Si la respuesta no es JSON o la red falla, el código es `supabase_inalcanzable`.

## Contrato que se consume

Sin query string. `Content-Type: application/json` en `POST` y `PATCH`.

| Método | Ruta | Cuerpo | Éxito |
| --- | --- | --- | --- |
| `GET` | `/api/barberos` | — | `200` `{ ok: true, barberos }` |
| `POST` | `/api/barberos` | `{ nombre, activo }` | `201` `{ ok: true, barbero }` |
| `GET` | `/api/servicios` | — | `200` `{ ok: true, servicios }` |
| `PATCH` | `/api/servicios/[id]` | `{ precio_centavos }` | `200` `{ ok: true, servicio }` |

Errores de barbero: `400 entrada_invalida`, `503 entorno_incompleto` o `supabase_inalcanzable`.

Errores de precio: `400 entrada_invalida`, `404 no_encontrado`, `503 entorno_incompleto` o `supabase_inalcanzable`.

Errores de catálogo: `503 entorno_incompleto` o `supabase_inalcanzable`.

## Archivos

| Archivo | Responsabilidad |
| --- | --- |
| `types/barbero.ts` | Ya existe. No se modifica. |
| `types/precio-servicio.ts` | Ya existe. No se modifica. |
| `types/catalogo-servicio.ts` | Ya existe. No se modifica. |
| `lib/barberos/servicio-barberos.ts` | Únicas llamadas `fetch` de barberos. Sin JSX. |
| `lib/barberos/mensajes-error-barbero.ts` | Mapa `ErrorBarbero` → texto en español. Sin red ni JSX. |
| `lib/servicios/servicio-precio.ts` | Única llamada `PATCH` de precio. Sin JSX. |
| `lib/servicios/mensajes-error-precio.ts` | Mapa `ErrorPrecioServicio` → texto en español. Sin red ni JSX. |
| `lib/administracion/centavos-desde-soles.ts` | Convierte el texto de soles a céntimos enteros. Sin red ni JSX. |
| `app/administracion/page.tsx` | Server Component. Renderiza el panel. Sin fetch. |
| `components/administracion/panel-administracion.tsx` | Client Component. Compone los dos bloques. Sin fetch propio. |
| `components/administracion/panel-barberos.tsx` | Estado de lista, formulario y envío de barberos. Importa el servicio de barberos. |
| `components/administracion/formulario-barbero.tsx` | Nombre, casilla Activo y botón Guardar. Sin fetch. |
| `components/administracion/campo-nombre-barbero.tsx` | Label + input de nombre. |
| `components/administracion/lista-barberos.tsx` | Lista, carga o vacío. Sin fetch. |
| `components/administracion/fila-barbero.tsx` | Nombre y si está activo. Sin acciones. |
| `components/administracion/panel-precios.tsx` | Estado del catálogo y del guardado de cada precio. Importa catálogo y precio. |
| `components/administracion/lista-precios.tsx` | Las tres filas o el estado de carga. Sin fetch. |
| `components/administracion/fila-precio.tsx` | Nombre, descripción, precio actual, campo y botón. Sin fetch. |
| `components/administracion/mensaje-administracion.tsx` | Un párrafo de error o de éxito. |

No crear hooks nuevos. El estado de barberos vive en `panel-barberos.tsx` y el de precios en `panel-precios.tsx`. No crear componentes de íconos. No duplicar `CampoCliente`, `MensajeCliente` ni `CasillaActivo`: la casilla se importa de `components/servidores/casilla-activo.tsx`.

## Servicios

`lib/barberos/servicio-barberos.ts`:

- `listarBarberos(): Promise<ResultadoBarberos>`
- `crearBarbero(entrada: EntradaBarbero): Promise<ResultadoBarbero>`

`lib/servicios/servicio-precio.ts`:

- `actualizarPrecio(id: string, entrada: EntradaPrecioServicio): Promise<ResultadoPrecioServicio>`

Cada función:

1. `fetch` con `cache: "no-store"`.
2. Si `response.json()` falla, devolver `{ ok: false, error: "supabase_inalcanzable" }`.
3. Si el JSON tiene `ok: true` con la forma del tipo de éxito, devolverlo.
4. Si el JSON tiene `ok: false` y `error` es un código del tipo, devolverlo.
5. Cualquier otra forma: `{ ok: false, error: "supabase_inalcanzable" }`.

No leen `NEXT_PUBLIC_` ni crean el cliente de Supabase. El nombre se envía con `trim`. El servicio no aplica el largo 1–120 ni comprueba que el id sea uno de los tres; eso lo hace la API.

`leerCatalogo` no se reescribe. `panel-precios.tsx` lo importa.

## Conversión de soles

`centavosDesdeSoles(texto: string): number | null` en `lib/administracion/centavos-desde-soles.ts`.

- Acepta `trim`, dígitos y un separador decimal opcional (`.` o `,`) con uno o dos dígitos.
- Devuelve el entero de céntimos. `30` → `3000`, `30.5` y `30,50` → `3050`.
- Devuelve `null` si está vacío, tiene más de dos decimales, no es numérico o el resultado no es un entero `> 0`.
- No llama a la API.

## Mensajes

`mensajeErrorBarbero(error: ErrorBarbero): string`

| Código | Texto |
| --- | --- |
| `entrada_invalida` | Revisa el nombre del barbero. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

`mensajeErrorPrecio(error: ErrorPrecioServicio): string`

| Código | Texto |
| --- | --- |
| `entrada_invalida` | El precio tiene que ser mayor que cero, en soles y con hasta dos decimales. |
| `no_encontrado` | Ese servicio ya no está en el catálogo. |
| `entorno_incompleto` | El servidor no tiene la configuración de datos. |
| `supabase_inalcanzable` | No se pudo contactar el servicio. Inténtalo de nuevo. |

La carga del catálogo usa `mensajeErrorCatalogo` tal como está.

## Pantalla `/administracion`

`app/administracion/page.tsx` usa `clasePagina` y un contenedor `mx-auto flex max-w-xl flex-col gap-10 px-4 py-8`. Todo con clases de Tailwind y las constantes de `lib/ui/clases.ts`. Botones nativos, sin íconos.

Título visible del panel: `Administración`.

### Barberos

Título de sección: `Barberos`.

Formulario, en este orden:

| Control | Detalle |
| --- | --- |
| Nombre | `input` text, `required`, `maxLength={120}`, label `Nombre`, `id` `nombre-barbero` |
| Activo | `CasillaActivo`, nace en `true` |
| Guardar | `claseBotonPrincipal`. Texto `Guardar`. Mientras envía: `Guardando…` y `disabled` |

Al guardar:

1. Si `centavos` no aplica aquí. Si el nombre, tras `trim`, está vacío, no se llama a la API y el aviso es el de `entrada_invalida`.
2. `POST` con `{ nombre: trim, activo }`.
3. Éxito: aviso `Barbero agregado.`, se vacía el nombre, la casilla vuelve a marcada y se vuelve a listar.
4. Fallo: aviso con `mensajeErrorBarbero`. La lista no se borra.

Lista:

- Mientras carga la primera vez: `Cargando barberos…` y el formulario deshabilitado.
- Error de carga: el mensaje de error y un botón `Reintentar` con `claseBotonSecundario` que vuelve a hacer `GET`.
- Lista vacía con carga correcta: `Todavía no hay barberos.`
- Cada fila: nombre y el texto `Activo` o `Inactivo`. Sin botones.

### Precios

Título de sección: `Precios`.

Al montar, `GET /api/servicios`.

- Cargando: `Cargando precios…`.
- Error: mensaje de catálogo y botón `Reintentar`.
- Éxito: una fila por servicio, en el orden del JSON.

Cada fila muestra nombre, descripción y el precio actual con `presentarSoles(precio_centavos)`.

Campo de nuevo precio: `input` text, `inputMode="decimal"`, label `Nuevo precio (S/)`, `id` `precio-${id}`. El valor inicial es el precio actual en soles con dos decimales y punto (`(precio_centavos / 100).toFixed(2)`).

Botón `Guardar` por fila. Mientras esa fila envía: `Guardando…` y `disabled`. Las otras filas siguen habilitadas.

Al guardar una fila:

1. `centavosDesdeSoles`. Si es `null`, no hay `fetch` y el aviso de esa sección es el de `entrada_invalida`.
2. `PATCH /api/servicios/${id}` con `{ precio_centavos }`.
3. Éxito: aviso `Precio actualizado.`, se sustituye solo ese servicio en el estado con `resultado.servicio` y el campo muestra el precio guardado con dos decimales.
4. Fallo: aviso con `mensajeErrorPrecio`. El catálogo en pantalla no cambia.

Un solo aviso por sección. Un aviso nuevo reemplaza al anterior de esa sección. El aviso de barberos no borra el de precios.

## Criterios de aceptación

- Existe `app/administracion/page.tsx` y abre el módulo sin enlace nuevo en la landing.
- Alta con nombre `Luis` y casilla marcada hace `POST /api/barberos` con `{ "nombre": "Luis", "activo": true }` y el nombre aparece en la lista como `Activo`.
- Nombre vacío no llama a la API y muestra el texto de `entrada_invalida`.
- La lista incluye inactivos si la API los devuelve y no ofrece editar ni borrar.
- Los tres servicios muestran el precio de `GET /api/servicios` con `presentarSoles`.
- Guardar `30` o `30.00` en Corte clásico hace `PATCH /api/servicios/corte-clasico` con `{ "precio_centavos": 3000 }` y la fila pasa a mostrar S/ 30.00 sin recargar los otros dos.
- `0`, vacío, tres decimales o texto no llaman a la API y muestran el texto de precio inválido.
- No hay fetch a Supabase, ni `POST`/`DELETE` de servicios, ni dependencia nueva.
- Cada componente está en su archivo. Los paneles no contienen el markup de filas ni de campos.
