import { comprobarConexion } from "@/lib/supabase/comprobar-conexion";

export async function GET() {
  const resultado = await comprobarConexion();
  const status = resultado.ok ? 200 : 503;

  return Response.json(resultado, { status });
}
