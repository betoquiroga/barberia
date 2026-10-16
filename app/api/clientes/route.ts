import { insertarCliente, listarClientes } from "@/lib/clientes/repositorio-clientes";
import type { ErrorCliente } from "@/types/cliente";

export async function GET() {
  const resultado = await listarClientes();

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estado(resultado.error),
  });
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const resultado = await insertarCliente(cuerpo);

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

function estado(error: ErrorCliente): number {
  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "correo_duplicado") {
    return 409;
  }

  return 503;
}
