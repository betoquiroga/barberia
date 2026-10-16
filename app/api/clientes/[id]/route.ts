import {
  actualizarCliente,
  borrarCliente,
  obtenerCliente,
} from "@/lib/clientes/repositorio-clientes";
import type { ErrorCliente } from "@/types/cliente";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await obtenerCliente(id);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function PATCH(request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const cuerpo = await leerCuerpo(request);
  const resultado = await actualizarCliente(id, cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function DELETE(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await borrarCliente(id);

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

function estado(error: ErrorCliente): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  if (error === "correo_duplicado") {
    return 409;
  }

  return 503;
}
