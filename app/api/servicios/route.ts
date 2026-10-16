import { leerCatalogoServicios } from "@/lib/servicios/repositorio-catalogo";
import type { ErrorCatalogo } from "@/types/catalogo-servicio";

export async function GET() {
  const resultado = await leerCatalogoServicios();

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

function estado(_error: ErrorCatalogo): number {
  return 503;
}
