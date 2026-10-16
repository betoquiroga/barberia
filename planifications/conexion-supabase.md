# Conexión a Supabase

## Objetivo

Dejar el proyecto Next.js (App Router) conectado al proyecto Supabase `https://gtzbxiiunbehowfayelc.supabase.co` y exponer una comprobación de servidor que confirme que la URL y la clave publicable llegan a ese proyecto.

## Alcance

- Variables de entorno, cliente de servidor y una ruta `GET` de comprobación.
- Tipos y regla de negocio fuera de HTTP.
- Cero cambios de esquema.

## Fuera de alcance

- Tablas, columnas, índices, RLS, políticas, seeds y cualquier esquema de barbería.
- Auth de usuarios, cookies, `middleware` / `proxy`, cliente de navegador y clave `service_role` o secret.
- Pantallas, componentes y cambios de `app/page.tsx`.

## Estado actual

- `package.json` no declara `@supabase/supabase-js` ni `@supabase/ssr`.
- No hay `.env`, `lib/supabase`, `app/api` ni carpeta `supabase/migrations`.
- `.gitignore` ya ignora `.env*`. No hay que cambiarlo.

## Suposiciones

- La URL dada es la URL de API del proyecto (ref `gtzbxiiunbehowfayelc`). No se usa otro proyecto.
- La clave la aporta quien implementa en `.env.local`. El plan no incluye el valor. Sirve la publishable key (`sb_publishable_...`) o, si el proyecto aún solo tiene la clave legacy, la anon key. No se usa la secret key.
- Comprobar la conexión no exige leer tablas. `auth.getSession()` sin sesión responde bien cuando URL y clave son válidas, y falla cuando la clave es rechazada o el host no responde.
- No se crea cliente de navegador: la comprobación corre solo en el servidor.

## Dependencia

Instalar solo con Yarn, porque no existe en el proyecto:

```bash
yarn add @supabase/supabase-js
```

No instalar `@supabase/ssr`. No hace falta sesión por cookies.

## Variables de entorno

Archivo local `.env.local` (no se commitea):

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://gtzbxiiunbehowfayelc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key o anon key del mismo proyecto |

No declarar `SUPABASE_SERVICE_ROLE_KEY` ni otras claves.

## Migraciones

No hay migración. No crear `supabase/migrations` ni SQL. No aplicar nada en el proyecto remoto. El esquema existente, si lo hay, se deja intacto.

## Archivos y responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `types/supabase-conexion.ts` | Tipos de resultado e identificadores de error. Sin funciones. |
| `lib/supabase/leer-entorno.ts` | Lee y valida las dos variables. No llama a la red. |
| `lib/supabase/crear-cliente.ts` | Crea el cliente de servidor con `createClient` de `@supabase/supabase-js` a partir del entorno ya validado. Sin `persistSession`. |
| `lib/supabase/comprobar-conexion.ts` | Regla de negocio: arma el cliente y llama a Auth. Traduce el resultado a éxito o a un error de dominio. |
| `app/api/supabase/conexion/route.ts` | Solo HTTP: `GET`, sin body. Mapea el resultado de dominio a status y JSON. |

La ruta no construye el cliente ni interpreta el error de Supabase. Esa regla vive en `lib/supabase/comprobar-conexion.ts`.

## Tipos y regla de negocio

En `types/supabase-conexion.ts`:

- `ErrorConexionSupabase`: `"entorno_incompleto"` | `"credenciales_invalidas"` | `"supabase_inalcanzable"`.
- `ConexionSupabaseOk`: `{ ok: true; proyecto: "gtzbxiiunbehowfayelc" }`.
- `ConexionSupabaseFallo`: `{ ok: false; error: ErrorConexionSupabase }`.
- `ResultadoConexionSupabase`: unión de los dos anteriores.

Regla en `lib/supabase/comprobar-conexion.ts`:

1. Si falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, o la URL no es exactamente `https://gtzbxiiunbehowfayelc.supabase.co`, devolver `entorno_incompleto`. No llamar a la red.
2. Crear el cliente con `auth.persistSession: false` y `auth.autoRefreshToken: false`.
3. Llamar `auth.getSession()`.
4. Si no hay error, devolver éxito con `proyecto: "gtzbxiiunbehowfayelc"`. `session` nula es éxito: significa que Auth respondió y no hay sesión.
5. Si el error de Supabase indica clave o JWT rechazado (status 401 o mensaje de API key inválida), devolver `credenciales_invalidas`.
6. Cualquier otro fallo (red, timeout, 5xx) devolver `supabase_inalcanzable`.
7. No registrar la clave ni el cuerpo crudo del error de Supabase.

## Contrato HTTP

`GET /api/supabase/conexion`

- Entrada: sin query, sin body, sin cabeceras propias.
- `200`: `{ "ok": true, "proyecto": "gtzbxiiunbehowfayelc" }`
- `503` y `error: "entorno_incompleto"` cuando faltan variables o la URL no es la de este proyecto.
- `503` y `error: "credenciales_invalidas"` cuando Supabase rechaza la clave.
- `503` y `error: "supabase_inalcanzable"` cuando el host no responde o Auth falla por otra causa.
- Cuerpo de error: `{ "ok": false, "error": "<codigo>" }`. Sin stack ni mensaje del SDK.
- Otros métodos: no implementarlos. Next responde 405.

## Criterios de aceptación — migraciones

- No existe archivo SQL nuevo ni carpeta `supabase/migrations` creada por este trabajo.
- No se ejecutó SQL contra el proyecto remoto.
- Las tablas remotas, si existen, quedan como estaban.

## Criterios de aceptación — lógica de negocio

- `yarn add @supabase/supabase-js` es la única dependencia nueva. No está `@supabase/ssr`.
- `.env.local` define las dos variables y no se commitea. La URL es `https://gtzbxiiunbehowfayelc.supabase.co`.
- `GET /api/supabase/conexion` con entorno válido responde `200` y `{ "ok": true, "proyecto": "gtzbxiiunbehowfayelc" }`.
- Sin alguna de las dos variables, el mismo `GET` responde `503` con `entorno_incompleto` y no intenta la red.
- Con una clave inválida responde `503` con `credenciales_invalidas`.
- La clave no aparece en la respuesta ni en logs de la ruta.
- La ruta solo delega en `comprobar-conexion`. Los tipos están en `types/supabase-conexion.ts`.
