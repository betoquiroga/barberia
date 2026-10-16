import {
  insertarServicioOfrecido,
  listarServiciosOfrecidos,
} from "@/lib/servicios-ofrecidos/repositorio-servicios-ofrecidos";
import type { ErrorServicioOfrecido } from "@/types/servicio-ofrecido";

export async function GET() {
  const resultado = await listarServiciosOfrecidos();

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const resultado = await insertarServicioOfrecido(cuerpo);

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
