import { aplicarWebhookPago } from "@/lib/pagos/repositorio-pago";
import type { ErrorWebhookPago } from "@/types/pago";

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const secreto = request.headers.get("x-pasarela-secreto");
  const resultado = await aplicarWebhookPago(secreto, cuerpo);

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

function estado(error: ErrorWebhookPago): number {
  if (error === "no_autorizado") {
    return 401;
  }

  if (error === "entrada_invalida") {
    return 400;
  }

  if (error === "no_encontrado") {
    return 404;
  }

  if (error === "pago_ya_cerrado") {
    return 409;
  }

  return 503;
}
