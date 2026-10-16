import { actualizarPrecioServicio } from "@/lib/servicios/repositorio-precio";
import type { ErrorPrecioServicio } from "@/types/precio-servicio";

type Contexto = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const cuerpo = await leerCuerpo(request);
  const resultado = await actualizarPrecioServicio(id, cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

async function leerCuerpo(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function estado(error: ErrorPrecioServicio): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  return 503;
}
