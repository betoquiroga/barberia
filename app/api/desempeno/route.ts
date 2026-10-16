import { listarDesempeno } from "@/lib/desempeno/repositorio-desempeno";
import type { ErrorDesempeno } from "@/types/desempeno";

export async function GET(request: Request) {
  const mes = new URL(request.url).searchParams.get("mes");
  const resultado = await listarDesempeno(mes);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

function estado(error: ErrorDesempeno): number {
  if (error === "mes_invalido") {
    return 400;
  }

  return 503;
}
