import { leerPago } from "@/lib/pagos/repositorio-pago";
import type { ErrorLecturaPago } from "@/types/pago";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await leerPago(id);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

function estado(error: ErrorLecturaPago): number {
  if (error === "no_encontrado") {
    return 404;
  }

  return 503;
}
