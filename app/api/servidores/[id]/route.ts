import {
  actualizarServidor,
  borrarServidor,
  obtenerServidor,
} from "@/lib/servidores/repositorio-servidores";
import type { ErrorServidor } from "@/types/servidor";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await obtenerServidor(id);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function PATCH(request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const cuerpo = await leerCuerpo(request);
  const resultado = await actualizarServidor(id, cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function DELETE(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await borrarServidor(id);

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

function estado(error: ErrorServidor): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  return 503;
}
