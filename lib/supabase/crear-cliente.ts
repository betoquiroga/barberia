import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { EntornoSupabase } from "@/lib/supabase/leer-entorno";

export function crearCliente(entorno: EntornoSupabase): SupabaseClient {
  return createClient(entorno.url, entorno.clave, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
