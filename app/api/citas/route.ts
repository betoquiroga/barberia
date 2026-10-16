import { leerDiagramaCitas } from "@/lib/citas/repositorio-citas-diagrama";
import type { ErrorCitasDiagrama } from "@/types/citas-diagrama";

export async function GET(request: Request) {
  const mes = new URL(request.url).searchParams.get("mes");
  const resultado = await leerDiagramaCitas(mes);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

function estado(error: ErrorCitasDiagrama): number {
  if (error === "mes_invalido") {
    return 400;
  }

  return 503;
}
