import { esUuidPago, validarWebhookPago } from "@/lib/pagos/validar-webhook-pago";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type { EntornoSupabase } from "@/lib/supabase/leer-entorno";
import type {
  EstadoPago,
  PagoPublico,
  ResultadoLecturaPago,
  ResultadoWebhookPago,
} from "@/types/pago";

type FilaPago = {
  id: string;
  cita_id: string;
  monto_centavos: number;
  moneda: string;
  estado: EstadoPago;
};

export type PagoInsertado = {
  id: string;
  monto_centavos: number;
  moneda: "PEN";
  estado: "pendiente";
  url_pasarela: string;
};

export function urlPasarela(pagoId: string): string | null {
  const base = process.env.PASARELA_URL_BASE?.trim();

  if (!base) {
    return null;
  }

  return `${base}?pago=${pagoId}`;
}

export async function insertarPagoCita(
  citaId: string,
  montoCentavos: number,
): Promise<PagoInsertado | null> {
  const entorno = leerEntorno();

  if (!entorno || !urlPasarela(citaId) || montoCentavos <= 0) {
    return null;
  }

  const insercion = await crearCliente(entorno)
    .from("pagos")
    .insert({
      cita_id: citaId,
      monto_centavos: montoCentavos,
      moneda: "PEN",
      estado: "pendiente",
      referencia_pasarela: null,
    })
    .select("id, monto_centavos")
    .single();

  if (insercion.error || !insercion.data) {
    return null;
  }

  const fila = insercion.data as { id: string; monto_centavos: number };
  const destino = urlPasarela(fila.id);

  if (!destino) {
    return null;
  }

  return {
    id: fila.id,
    monto_centavos: fila.monto_centavos,
    moneda: "PEN",
    estado: "pendiente",
    url_pasarela: destino,
  };
}

export async function leerPago(id: string): Promise<ResultadoLecturaPago> {
  if (!esUuidPago(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const fila = await buscarPago(entorno, id);

  if (fila === "error") {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!fila) {
    return { ok: false, error: "no_encontrado" };
  }

  const pago = presentarPago(fila);

  if (pago.estado === "pendiente" && !pago.url_pasarela) {
    return { ok: false, error: "entorno_incompleto" };
  }

  return { ok: true, pago };
}

export async function aplicarWebhookPago(
  secreto: string | null,
  cuerpo: unknown,
): Promise<ResultadoWebhookPago> {
  const esperado = process.env.PASARELA_SECRETO;

  if (!esperado || secreto !== esperado) {
    return { ok: false, error: "no_autorizado" };
  }

  const entrada = validarWebhookPago(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const fila = await buscarPago(entorno, entrada.pagoId);

  if (fila === "error") {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!fila) {
    return { ok: false, error: "no_encontrado" };
  }

  if (fila.estado === entrada.estado) {
    return { ok: true, pago_id: fila.id, estado: entrada.estado };
  }

  if (fila.estado === "pagado" && entrada.estado === "fallido") {
    return { ok: false, error: "pago_ya_cerrado" };
  }

  const actualizacion = await crearCliente(entorno)
    .from("pagos")
    .update({
      estado: entrada.estado,
      referencia_pasarela: entrada.referencia,
    })
    .eq("id", fila.id)
    .select("id, estado")
    .single();

  if (actualizacion.error || !actualizacion.data) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const guardado = actualizacion.data as { id: string; estado: "pagado" | "fallido" };

  return { ok: true, pago_id: guardado.id, estado: guardado.estado };
}

function presentarPago(fila: FilaPago): PagoPublico {
  return {
    id: fila.id,
    cita_id: fila.cita_id,
    monto_centavos: fila.monto_centavos,
    moneda: "PEN",
    estado: fila.estado,
    url_pasarela: fila.estado === "pendiente" ? urlPasarela(fila.id) : null,
  };
}

async function buscarPago(
  entorno: EntornoSupabase,
  id: string,
): Promise<FilaPago | null | "error"> {
  const consulta = await crearCliente(entorno)
    .from("pagos")
    .select("id, cita_id, monto_centavos, moneda, estado")
    .eq("id", id)
    .maybeSingle();

  if (consulta.error) {
    return "error";
  }

  return (consulta.data as FilaPago | null) ?? null;
}
