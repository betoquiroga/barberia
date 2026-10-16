import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type { ResultadoConexionSupabase } from "@/types/supabase-conexion";

const PROYECTO = "krpyyghflgcxhmscvemw" as const;

export async function comprobarConexion(): Promise<ResultadoConexionSupabase> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  try {
    const cliente = crearCliente(entorno);
    const { error } = await cliente.auth.getSession();

    if (!error) {
      return { ok: true, proyecto: PROYECTO };
    }

    if (esCredencialRechazada(error)) {
      return { ok: false, error: "credenciales_invalidas" };
    }

    return { ok: false, error: "supabase_inalcanzable" };
  } catch {
    return { ok: false, error: "supabase_inalcanzable" };
  }
}

function esCredencialRechazada(error: {
  status?: number;
  message?: string;
}): boolean {
  if (error.status === 401) {
    return true;
  }

  const mensaje = error.message?.toLowerCase() ?? "";
  return mensaje.includes("invalid api key") || mensaje.includes("invalid jwt");
}
