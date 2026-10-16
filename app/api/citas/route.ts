import { crearCita } from "@/lib/citas/repositorio-alta-cita";
import { leerDiagramaCitas } from "@/lib/citas/repositorio-citas-diagrama";
import type { ErrorAltaCita } from "@/types/cita-alta";
import type { ErrorCitasDiagrama } from "@/types/citas-diagrama";

export async function GET(request: Request) {
  const mes = new URL(request.url).searchParams.get("mes");
  const resultado = await leerDiagramaCitas(mes);

  return Response.json(resultado, {
    status: resultado.ok ? 200 : estadoLectura(resultado.error),
  });
}

export async function POST(request: Request) {
  const cuerpo = await leerCuerpo(request);
  const resultado = await crearCita(cuerpo);

  return Response.json(resultado, {
    status: resultado.ok ? 201 : estadoAlta(resultado.error),
  });
}

async function leerCuerpo(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function estadoLectura(error: ErrorCitasDiagrama): number {
  if (error === "mes_invalido") {
    return 400;
  }

  return 503;
}

function estadoAlta(error: ErrorAltaCita): number {
  if (error === "entrada_invalida" || error === "servicio_desconocido") {
    return 400;
  }

  if (error === "correo_no_enviado" || error === "pago_no_creado") {
    return 502;
  }

  return 503;
}
