import { obtenerDesempenoBarbero } from "@/lib/desempeno/repositorio-desempeno";
import type { ErrorDesempeno } from "@/types/desempeno";

type Contexto = { params: Promise<{ barberoId: string }> };

export async function GET(request: Request, contexto: Contexto) {
  const { barberoId } = await contexto.params;
  const mes = new URL(request.url).searchParams.get("mes");
  const resultado = await obtenerDesempenoBarbero(barberoId, mes);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

function estado(error: ErrorDesempeno): number {
  if (error === "mes_invalido") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  return 503;
}
