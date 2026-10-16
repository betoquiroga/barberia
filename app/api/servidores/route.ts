import {
  insertarServidor,
  listarServidores,
} from "@/lib/servidores/repositorio-servidores";
import type { ErrorServidor } from "@/types/servidor";

export async function GET() {
  const resultado = await listarServidores();

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const resultado = await insertarServidor(cuerpo);

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

function estado(error: ErrorServidor): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  return 503;
}
