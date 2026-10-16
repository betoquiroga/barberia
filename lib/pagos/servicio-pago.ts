import type {
  ErrorLecturaPago,
  PagoPublico,
  ResultadoLecturaPago,
} from "@/types/pago";

const FALLO: ResultadoLecturaPago = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esPago(valor: unknown): valor is PagoPublico {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const pago = valor as PagoPublico;

  return (
    typeof pago.id === "string" &&
    typeof pago.cita_id === "string" &&
    typeof pago.monto_centavos === "number" &&
    pago.moneda === "PEN" &&
    (pago.estado === "pendiente" ||
      pago.estado === "pagado" ||
      pago.estado === "fallido") &&
    (pago.url_pasarela === null || typeof pago.url_pasarela === "string")
  );
}

function errorLectura(dato: unknown, status: number): ErrorLecturaPago | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as { ok?: unknown; error?: unknown };

  if (cuerpo.ok !== false || typeof cuerpo.error !== "string") {
    return null;
  }

  if (status === 404 && cuerpo.error === "no_encontrado") {
    return "no_encontrado";
  }

  if (
    status === 503 &&
    (cuerpo.error === "entorno_incompleto" ||
      cuerpo.error === "supabase_inalcanzable")
  ) {
    return cuerpo.error;
  }

  return null;
}

export async function obtenerPago(id: string): Promise<ResultadoLecturaPago> {
  try {
    const response = await fetch(`/api/pagos/${id}`, { cache: "no-store" });
    const dato: unknown = await response.json();
    const error = errorLectura(dato, response.status);

    if (error) {
      return { ok: false, error };
    }

    if (
      response.status === 200 &&
      dato &&
      typeof dato === "object" &&
      (dato as { ok?: unknown }).ok === true &&
      esPago((dato as { pago?: unknown }).pago)
    ) {
      return { ok: true, pago: (dato as { pago: PagoPublico }).pago };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
