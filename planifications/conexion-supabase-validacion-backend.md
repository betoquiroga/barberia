# Validación backend — Conexión a Supabase

Plan: `planifications/conexion-supabase.md`

## Migraciones

- Puntaje: **10**
- Veredicto: **aprobado**

Evidencia:

- No hay carpeta `supabase/` ni `supabase/migrations`.
- No hay archivos `.sql` en el repositorio.
- El plan pide cero cambios de esquema y no aplicar SQL en el proyecto remoto. Ese alcance se cumple.

## Lógica de negocio

- Puntaje: **10**
- Veredicto: **aprobado**

Evidencia:

- `package.json` declara solo `@supabase/supabase-js` como dependencia nueva. No está `@supabase/ssr`.
- `.env.local` define `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La URL es `https://gtzbxiiunbehowfayelc.supabase.co`. `.gitignore` ignora `.env*` y el archivo no está en el índice.
- `types/supabase-conexion.ts` define `ErrorConexionSupabase`, `ConexionSupabaseOk`, `ConexionSupabaseFallo` y `ResultadoConexionSupabase` como pide el plan, sin funciones.
- `lib/supabase/leer-entorno.ts` exige las dos variables y la URL exacta del proyecto. Si falta algo, devuelve `null` y no llama a la red.
- `lib/supabase/crear-cliente.ts` usa `createClient` de `@supabase/supabase-js` con `auth.persistSession: false` y `auth.autoRefreshToken: false`.
- `lib/supabase/comprobar-conexion.ts` arma el cliente, llama `auth.getSession()`, trata sesión nula como éxito con `proyecto: "gtzbxiiunbehowfayelc"`, mapea 401 o mensaje de API key / JWT inválido a `credenciales_invalidas`, y el resto de fallos a `supabase_inalcanzable`. No registra la clave ni el cuerpo del error.
- `app/api/supabase/conexion/route.ts` solo exporta `GET`, delega en `comprobarConexion` y responde `200` o `503` con el resultado de dominio. No construye el cliente ni interpreta el error de Supabase.
