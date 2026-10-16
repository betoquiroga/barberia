import {
  actualizarServicioOfrecido,
  borrarServicioOfrecido,
  obtenerServicioOfrecido,
} from "@/lib/servicios-ofrecidos/repositorio-servicios-ofrecidos";
import type { ErrorServicioOfrecido } from "@/types/servicio-ofrecido";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await obtenerServicioOfrecido(id);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function PATCH(request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const cuerpo = await leerCuerpo(request);
  const resultado = await actualizarServicioOfrecido(id, cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function DELETE(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await borrarServicioOfrecido(id);

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

function estado(error: ErrorServicioOfrecido): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  if (error === "nombre_duplicado") {
    return 409;
  }

  if (error === "servidor_inexistente") {
    return 422;
  }

  return 503;
}
