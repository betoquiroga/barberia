# Servidor MCP del API de la barbería

## Objetivo

Exponer el API HTTP ya existente como herramientas de un servidor MCP (Model Context Protocol) por stdio, para que un cliente MCP (Cursor u otro) liste, lea y escriba citas, catálogo, pagos, clientes, servidores, servicios ofrecidos, horarios y desempeño llamando a esas rutas. El servidor MCP no contiene reglas de negocio: reenvía la petición y devuelve el JSON de la ruta.

## Alcance

- Proceso Node aparte del `next dev`, transporte stdio, protocolo MCP.
- Una herramienta por operación HTTP pública de `app/api`, salvo el webhook de la pasarela.
- Esquemas de entrada que copian los tipos de `types/` ya usados por esas rutas.
- Script `yarn mcp` y un ejemplo de configuración de cliente.
- Dependencias nuevas solo para el protocolo: `@modelcontextprotocol/sdk` y `zod`.

## Fuera de alcance

- Migraciones, tablas, columnas, índices, políticas RLS y cualquier cambio de Supabase.
- Cambiar contratos, validaciones o códigos HTTP de las rutas existentes.
- Duplicar repositorios de `lib/` dentro del MCP. El MCP no importa `lib/`.
- `POST /api/pagos/webhook`. Ese endpoint exige el header `x-pasarela-secreto` y lo usa la pasarela, no un cliente conversacional.
- Auth nueva, rate limit, UI, frontend y despliegue en Vercel.
- Transporte HTTP/SSE del MCP. El cliente lanza el proceso local.

## Estado actual

Rutas que el MCP debe reutilizar, sin modificarlas:

| Ruta | Métodos |
| --- | --- |
| `/api/citas` | GET (`mes`), POST |
| `/api/servicios` | GET |
| `/api/pagos/[id]` | GET |
| `/api/pagos/webhook` | POST (excluido del MCP) |
| `/api/clientes` | GET, POST |
| `/api/clientes/[id]` | GET, PATCH, DELETE |
| `/api/servidores` | GET, POST |
| `/api/servidores/[id]` | GET, PATCH, DELETE |
| `/api/servicios-ofrecidos` | GET, POST |
| `/api/servicios-ofrecidos/[id]` | GET, PATCH, DELETE |
| `/api/horarios` | GET, POST |
| `/api/horarios/[id]` | GET, PATCH, DELETE |
| `/api/desempeno` | GET (`mes`) |
| `/api/desempeno/[barberoId]` | GET (`mes`) |
| `/api/supabase/conexion` | GET |

Los cuerpos de éxito y error ya están tipados en `types/cita-alta.ts`, `types/citas-diagrama.ts`, `types/catalogo-servicio.ts`, `types/pago.ts`, `types/cliente.ts`, `types/servidor.ts`, `types/servicio-ofrecido.ts`, `types/horario.ts`, `types/desempeno.ts` y `types/supabase-conexion.ts`. El MCP no redefine esos tipos de dominio.

No hay `@modelcontextprotocol/sdk` ni `zod` en `package.json`. El resto de dependencias se queda igual. Instalar con Yarn.

## Suposiciones

- El API corre antes que el MCP. Base por defecto `http://127.0.0.1:3000`, sobreescribible con `BARBERIA_API_URL` (sin barra final).
- Las rutas no exigen sesión. El MCP tampoco. Quien pueda lanzar el proceso puede llamar a las mismas operaciones que el HTTP anónimo.
- El mes, cuando la herramienta lo pide, es `YYYY-MM` o se omite. Si se omite, la ruta aplica el mes actual en `America/Lima` (`lib/desempeno/validar-mes.ts`). `9999-12` es inválido.
- PATCH usa el mismo cuerpo que el POST de ese recurso. El MCP no inventa actualizaciones parciales.
- `servicioId` de alta de cita sigue siendo el slug que ya valida `lib/citas/validar-alta-cita.ts`: `corte-clasico`, `arreglo-barba`, `corte-y-barba`. El catálogo público (`/api/servicios`) es otra lectura y no sustituye esa validación.
- Hay dos catálogos distintos: estilos públicos en `/api/servicios` y el CRUD administrativo en `/api/servicios-ofrecidos`. Las herramientas llevan nombres distintos.
- Un fallo de red o un JSON que no se puede parsear es error del transporte MCP (`api_inalcanzable`). Un `ok: false` que devuelve la ruta se reenvía tal cual, con `isError` si el status HTTP es mayor o igual a 400.
- No se crea migración. El esquema de base que ya usan las rutas permanece.

## Esquema de base (sin cambios)

Ningún archivo nuevo en `supabase/migrations/`. El MCP no lee ni escribe Postgres. Las tablas que las rutas ya usan, y que este plan no altera, son: `public.clientes`, `public.horarios_atencion`, `public.barberos`, `public.servicios`, `public.citas`, `public.pagos`, `public.servidores`, `public.servicios_ofrecidos`, `public.servicio_ofrecido_servidor`.

## Archivos nuevos

| Archivo | Responsabilidad |
| --- | --- |
| `mcp/servidor.ts` | Arranque. Crea `McpServer` (`name`: `barberia`, `version`: la de `package.json`), registra las herramientas y conecta `StdioServerTransport`. |
| `mcp/cliente-api.ts` | Único `fetch` hacia `BARBERIA_API_URL`. Arma path, query, método, cuerpo JSON y el sobre de respuesta. |
| `mcp/herramientas/citas.ts` | `leer_diagrama_citas`, `crear_cita`. |
| `mcp/herramientas/servicios.ts` | `listar_catalogo_servicios`. |
| `mcp/herramientas/pagos.ts` | `leer_pago`. |
| `mcp/herramientas/clientes.ts` | CRUD de clientes. |
| `mcp/herramientas/servidores.ts` | CRUD de servidores. |
| `mcp/herramientas/servicios-ofrecidos.ts` | CRUD de servicios ofrecidos. |
| `mcp/herramientas/horarios.ts` | CRUD de horarios. |
| `mcp/herramientas/desempeno.ts` | Listado y fila de un barbero. |
| `mcp/herramientas/conexion.ts` | `comprobar_conexion_supabase`. |
| `types/mcp-respuesta.ts` | Sobre de transporte, ajeno al dominio. |

Cada archivo de herramientas solo registra tools y llama a `cliente-api`. No valida reglas de negocio.

## Dependencias y script

```bash
yarn add @modelcontextprotocol/sdk zod
```

`zod` queda como dependencia directa porque los `inputSchema` del SDK se declaran con él. No añadir un runner de TypeScript: el script usa el Node del proyecto con tipos nativos.

En `package.json`:

```json
"mcp": "node --experimental-strip-types mcp/servidor.ts"
```

Si esa bandera falla en el Node local, la alternativa única es `yarn add -D tsx` y `"mcp": "tsx mcp/servidor.ts"`. No usar npm.

Ejemplo de cliente (`.cursor/mcp.json`, lo crea quien integre el cliente; no es código de negocio):

```json
{
  "mcpServers": {
    "barberia": {
      "command": "yarn",
      "args": ["mcp"],
      "env": { "BARBERIA_API_URL": "http://127.0.0.1:3000" }
    }
  }
}
```

El proceso escribe logs solo a stderr. stdout queda reservado al protocolo.

## Cliente HTTP interno

`mcp/cliente-api.ts` exporta:

```ts
llamarApi(opciones: {
  metodo: "GET" | "POST" | "PATCH" | "DELETE";
  ruta: string;
  consulta?: Record<string, string | undefined>;
  cuerpo?: unknown;
}): Promise<RespuestaMcp>
```

`types/mcp-respuesta.ts`:

```ts
export type RespuestaMcp =
  | { ok: true; status: number; cuerpo: unknown }
  | { ok: false; error: "api_inalcanzable"; detalle: string };
```

Reglas:

- `ruta` empieza por `/api/`.
- Omite claves de `consulta` cuyo valor sea `undefined`.
- `Content-Type: application/json` solo si hay cuerpo.
- Timeout 10 segundos (`AbortSignal.timeout`).
- Status 2xx: `{ ok: true, status, cuerpo }` con el JSON parseado.
- Status distinto de 2xx con JSON objeto: igual `{ ok: true, status, cuerpo }` para no perder `error` de dominio. El registro de la herramienta marca `isError: true`.
- Cuerpo no JSON, red, aborto o URL inválida: `{ ok: false, error: "api_inalcanzable", detalle }` sin stack ni variables de entorno.
- No envía `x-pasarela-secreto` ni otras cabeceras secretas.

Cada herramienta responde al cliente MCP con un único contenido `text` igual a `JSON.stringify` de `RespuestaMcp`. No resume ni traduce mensajes.

Anotaciones MCP:

- GET: `readOnlyHint: true`, `destructiveHint: false`.
- POST y PATCH: `readOnlyHint: false`, `destructiveHint: false`.
- DELETE: `readOnlyHint: false`, `destructiveHint: true`.

## Herramientas

Los nombres de propiedades del input coinciden con el JSON que ya espera la ruta (`servicioId`, `precio_pesos`, etc.).

### Citas

`leer_diagrama_citas` → `GET /api/citas`

- Input: `{ mes?: string }` con patrón `^\d{4}-(0[1-9]|1[0-2])$` si viene.
- 200: `ResultadoCitasDiagrama` con `ok: true` (`mes`, `dias`, `horas`, `horario_pico`).
- 400: `{ ok: false, error: "mes_invalido" }`.
- 503: `entorno_incompleto` o `supabase_inalcanzable`.

`crear_cita` → `POST /api/citas`

- Input obligatorio, objeto `EntradaAltaCita`: `nombre`, `correo`, `telefono`, `servicioId`, `fecha` (`YYYY-MM-DD`), `hora` (`HH:mm`), `nota` (string, puede ir vacío).
- 201: `{ ok: true, cita }` con `pago` anidado (`id`, `monto_centavos`, `moneda: "PEN"`, `estado: "pendiente"`, `url_pasarela`).
- 400: `entrada_invalida` o `servicio_desconocido`.
- 502: `pago_no_creado` (incluye `cita_id`) o `correo_no_enviado` (incluye `cita_id` y `pago_id`).
- 503: `entorno_incompleto` o `supabase_inalcanzable`.

### Catálogo público

`listar_catalogo_servicios` → `GET /api/servicios`

- Input: objeto vacío.
- 200: `{ ok: true, servicios: EstiloPublico[] }` (`id`, `nombre`, `descripcion`, `precio_centavos`, `moneda: "PEN"`).
- 503: `entorno_incompleto` o `supabase_inalcanzable`.

### Pagos

`leer_pago` → `GET /api/pagos/{id}`

- Input: `{ id: string }` no vacío. Va en el path, no en el cuerpo.
- 200: `{ ok: true, pago: PagoPublico }` (`cita_id`, `monto_centavos`, `moneda`, `estado` `pendiente|pagado|fallido`, `url_pasarela`).
- 404: `no_encontrado`.
- 503: `entorno_incompleto` o `supabase_inalcanzable`.

No existe herramienta de webhook.

### Clientes

Tipos: `EntradaCliente` y `Cliente` en `types/cliente.ts`.

| Herramienta | HTTP | Input |
| --- | --- | --- |
| `listar_clientes` | GET `/api/clientes` | `{}` |
| `crear_cliente` | POST `/api/clientes` | `nombre`, `correo`, `telefono`, `detalle?` |
| `obtener_cliente` | GET `/api/clientes/{id}` | `id` |
| `actualizar_cliente` | PATCH `/api/clientes/{id}` | `id` más el mismo cuerpo que el alta |
| `borrar_cliente` | DELETE `/api/clientes/{id}` | `id` |

Salidas de la ruta: lista `{ ok: true, clientes }`, uno `{ ok: true, cliente }`, borrado `{ ok: true }`. Errores: 400 `entrada_invalida`, 404 `no_encontrado`, 409 `correo_duplicado`, 503 `entorno_incompleto` o `supabase_inalcanzable`.

### Servidores

Tipos: `EntradaServidor` y `Servidor`.

| Herramienta | HTTP | Input |
| --- | --- | --- |
| `listar_servidores` | GET `/api/servidores` | `{}` |
| `crear_servidor` | POST `/api/servidores` | `nombre`, `telefono?`, `activo?` |
| `obtener_servidor` | GET `/api/servidores/{id}` | `id` |
| `actualizar_servidor` | PATCH `/api/servidores/{id}` | `id` más el mismo cuerpo que el alta |
| `borrar_servidor` | DELETE `/api/servidores/{id}` | `id` |

Errores: 400 `entrada_invalida`, 404 `no_encontrado`, 503 `entorno_incompleto` o `supabase_inalcanzable`.

### Servicios ofrecidos

Tipos: `EntradaServicioOfrecido` y `ServicioOfrecido`. Distinto de `listar_catalogo_servicios`.

| Herramienta | HTTP | Input |
| --- | --- | --- |
| `listar_servicios_ofrecidos` | GET `/api/servicios-ofrecidos` | `{}` |
| `crear_servicio_ofrecido` | POST `/api/servicios-ofrecidos` | `nombre`, `precio_pesos`, `costo_pesos`, `servidor_ids?` |
| `obtener_servicio_ofrecido` | GET `/api/servicios-ofrecidos/{id}` | `id` |
| `actualizar_servicio_ofrecido` | PATCH `/api/servicios-ofrecidos/{id}` | `id` más el mismo cuerpo que el alta |
| `borrar_servicio_ofrecido` | DELETE `/api/servicios-ofrecidos/{id}` | `id` |

Errores: 400 `entrada_invalida`, 404 `no_encontrado`, 409 `nombre_duplicado`, 422 `servidor_inexistente`, 503 `entorno_incompleto` o `supabase_inalcanzable`.

### Horarios

Tipos: `EntradaHorario`, `DiaSemana`, `Horario`.

| Herramienta | HTTP | Input |
| --- | --- | --- |
| `listar_horarios` | GET `/api/horarios` | `{}` |
| `crear_horario` | POST `/api/horarios` | ver cuerpo |
| `obtener_horario` | GET `/api/horarios/{id}` | `id` |
| `actualizar_horario` | PATCH `/api/horarios/{id}` | `id` más el mismo cuerpo que el alta |
| `borrar_horario` | DELETE `/api/horarios/{id}` | `id` |

Cuerpo de alta y de actualización (unión que ya modela `EntradaHorario`):

- Cerrado: `{ dia, cerrado: true }`.
- Abierto: `{ dia, cerrado: false, abre, cierra }` con horas `HH:mm`.
- `dia`: `lunes|martes|miercoles|jueves|viernes|sabado|domingo`.

Errores: 400 `entrada_invalida`, 404 `no_encontrado`, 409 `dia_duplicado`, 503 `entorno_incompleto` o `supabase_inalcanzable`.

### Desempeño

`listar_desempeno` → `GET /api/desempeno`

- Input: `{ mes?: string }`.
- 200: `{ ok: true, mes, filas: FilaDesempeno[] }`.
- 400: `mes_invalido`. 503: `entorno_incompleto` o `supabase_inalcanzable`.

`obtener_desempeno_barbero` → `GET /api/desempeno/{barberoId}`

- Input: `{ barberoId: string, mes?: string }`. `barberoId` va en el path.
- 200: `{ ok: true, mes, fila }`.
- 400: `mes_invalido`. 404: `no_encontrado`. 503: `entorno_incompleto` o `supabase_inalcanzable`.

`FilaDesempeno`: `barbero_id`, `nombre`, `activo`, `citas_completadas`, `citas_canceladas`, `citas_programadas`, `ingresos_centavos`, `ticket_promedio_centavos`.

### Conexión

`comprobar_conexion_supabase` → `GET /api/supabase/conexion`

- Input: `{}`.
- 200: `{ ok: true, proyecto: "krpyyghflgcxhmscvemw" }` (el valor lo define la ruta; el MCP no lo hardcodea).
- 503: `entorno_incompleto`, `credenciales_invalidas` o `supabase_inalcanzable`.

## Criterios de aceptación

### Migraciones

- No se agrega ni se edita ningún archivo en `supabase/migrations/`.
- `list_migrations` del proyecto no cambia por este trabajo.

### Lógica de negocio y transporte

- `yarn mcp` levanta un servidor stdio que anuncia las 27 herramientas de este plan y ninguna más. No anuncia webhook.
- Con el API en marcha, `listar_catalogo_servicios`, `listar_clientes`, `listar_servidores`, `listar_servicios_ofrecidos`, `listar_horarios`, `leer_diagrama_citas` sin `mes`, `listar_desempeno` sin `mes` y `comprobar_conexion_supabase` devuelven el mismo JSON que un GET directo a la ruta, dentro del sobre `{ ok: true, status, cuerpo }`.
- `crear_cita` con un cuerpo válido devuelve status 201 y el `cita.pago` que ya arma `POST /api/citas`. Un `servicioId` fuera de los tres slugs devuelve status 400 y `error: "servicio_desconocido"` o `entrada_invalida`, el que ya responda la ruta.
- `leer_pago` con un id inexistente devuelve status 404 y `error: "no_encontrado"`.
- `crear_cliente` repetido con el mismo correo devuelve status 409 y `error: "correo_duplicado"`.
- `borrar_cliente`, `borrar_servidor`, `borrar_servicio_ofrecido` y `borrar_horario` declaran `destructiveHint: true` y llaman al DELETE de la ruta.
- Con `BARBERIA_API_URL` apuntando a un puerto cerrado, cualquier herramienta devuelve `{ ok: false, error: "api_inalcanzable" }` y no lanza una excepción sin capturar.
- Ningún archivo bajo `mcp/` importa `@/lib` ni `@supabase/supabase-js`.
- Las rutas de `app/api` quedan con el mismo comportamiento que antes de este trabajo.
