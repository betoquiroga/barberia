import type {
  CitaCreada,
  EntradaAltaCita,
  ErrorAltaCita,
  ResultadoAltaCita,
} from "@/types/cita-alta";

const FALLO: ResultadoAltaCita = { ok: false, error: "supabase_inalcanzable" };

function esCitaCreada(valor: unknown): valor is CitaCreada {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const cita = valor as CitaCreada;
  const pago = cita.pago;

  return (
    typeof cita.id === "string" &&
    typeof cita.nombre === "string" &&
    typeof cita.correo === "string" &&
    typeof cita.telefono === "string" &&
    typeof cita.servicio_id === "string" &&
    typeof cita.servicio_nombre === "string" &&
    typeof cita.fecha === "string" &&
    typeof cita.hora === "string" &&
    typeof cita.nota === "string" &&
    cita.estado === "programada" &&
    typeof cita.correo_enviado === "boolean" &&
    !!pago &&
    typeof pago === "object" &&
    typeof pago.id === "string" &&
    typeof pago.monto_centavos === "number" &&
    pago.moneda === "PEN" &&
    pago.estado === "pendiente" &&
    typeof pago.url_pasarela === "string"
  );
}

function errorAlta(dato: unknown, status: number): ResultadoAltaCita | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as {
    ok?: unknown;
    error?: unknown;
    cita_id?: unknown;
    pago_id?: unknown;
  };

  if (cuerpo.ok !== false || typeof cuerpo.error !== "string") {
    return null;
  }

  const error = cuerpo.error as ErrorAltaCita;

  if (
    status === 400 &&
    (error === "entrada_invalida" || error === "servicio_desconocido")
  ) {
    return { ok: false, error };
  }

  if (
    status === 503 &&
    (error === "entorno_incompleto" || error === "supabase_inalcanzable")
  ) {
    return { ok: false, error };
  }

  if (
    status === 502 &&
    error === "pago_no_creado" &&
    typeof cuerpo.cita_id === "string"
  ) {
    return { ok: false, error, cita_id: cuerpo.cita_id };
  }

  if (
    status === 502 &&
    error === "correo_no_enviado" &&
    typeof cuerpo.cita_id === "string" &&
    typeof cuerpo.pago_id === "string"
  ) {
    return { ok: false, error, cita_id: cuerpo.cita_id, pago_id: cuerpo.pago_id };
  }

  return null;
}

export async function enviarAltaCita(
  entrada: EntradaAltaCita,
): Promise<ResultadoAltaCita> {
  try {
    const response = await fetch("/api/citas", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entrada),
    });
    const dato: unknown = await response.json();
    const error = errorAlta(dato, response.status);

    if (error) {
      return error;
    }

    if (
      response.status === 201 &&
      dato &&
      typeof dato === "object" &&
      (dato as { ok?: unknown }).ok === true &&
      esCitaCreada((dato as { cita?: unknown }).cita)
    ) {
      return { ok: true, cita: (dato as { cita: CitaCreada }).cita };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
