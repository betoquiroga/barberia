import {
  insertarBarbero,
  listarBarberos,
} from "@/lib/barberos/repositorio-barberos";
import type { ErrorBarbero } from "@/types/barbero";

export async function GET() {
  const resultado = await listarBarberos();

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const resultado = await insertarBarbero(cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 201 : estado(resultado.error),
  });
}

async function leerCuerpo(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function estado(error: ErrorBarbero): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  return 503;
}
