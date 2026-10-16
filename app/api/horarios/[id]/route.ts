import {
  actualizarHorario,
  borrarHorario,
  obtenerHorario,
} from "@/lib/horarios/repositorio-horarios";
import type { ErrorHorario } from "@/types/horario";

type Contexto = { params: Promise<{ id: string }> };

export async function GET(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await obtenerHorario(id);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function PATCH(request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const cuerpo = await leerCuerpo(request);
  const resultado = await actualizarHorario(id, cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function DELETE(_request: Request, contexto: Contexto) {
  const { id } = await contexto.params;
  const resultado = await borrarHorario(id);

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

function estado(error: ErrorHorario): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  if (error === "dia_duplicado") {
    return 409;
  }

  return 503;
}
