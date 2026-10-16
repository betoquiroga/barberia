export type ErrorConexionSupabase =
  | "entorno_incompleto"
  | "credenciales_invalidas"
  | "supabase_inalcanzable";

export type ConexionSupabaseOk = {
  ok: true;
  proyecto: "gtzbxiiunbehowfayelc";
};

export type ConexionSupabaseFallo = {
  ok: false;
  error: ErrorConexionSupabase;
};

export type ResultadoConexionSupabase =
  | ConexionSupabaseOk
  | ConexionSupabaseFallo;
