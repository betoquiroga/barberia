const URL_PROYECTO = "https://gtzbxiiunbehowfayelc.supabase.co";

export type EntornoSupabase = {
  url: string;
  clave: string;
};

export function leerEntorno(): EntornoSupabase | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !clave || url !== URL_PROYECTO) {
    return null;
  }

  return { url, clave };
}
