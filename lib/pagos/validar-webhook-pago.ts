import type { EntradaWebhookPago } from "@/types/pago";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validarWebhookPago(cuerpo: unknown): EntradaWebhookPago | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const pagoId = typeof campos.pagoId === "string" ? campos.pagoId.trim() : "";
  const estado = campos.estado;
  const referencia =
    typeof campos.referencia === "string" ? campos.referencia.trim() : "";

  if (!UUID.test(pagoId)) {
    return null;
  }

  if (estado !== "pagado" && estado !== "fallido") {
    return null;
  }

  if (referencia.length < 1 || referencia.length > 120) {
    return null;
  }

  return { pagoId, estado, referencia };
}

export function esUuidPago(id: string): boolean {
  return UUID.test(id);
}
