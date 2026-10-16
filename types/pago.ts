export type EstadoPago = "pendiente" | "pagado" | "fallido";

export type PagoPublico = {
  id: string;
  cita_id: string;
  monto_centavos: number;
  moneda: "PEN";
  estado: EstadoPago;
  url_pasarela: string | null;
};

export type ErrorLecturaPago =
  | "no_encontrado"
  | "entorno_incompleto"
  | "supabase_inalcanzable";

export type ResultadoLecturaPago =
  | { ok: true; pago: PagoPublico }
  | { ok: false; error: ErrorLecturaPago };

export type EntradaWebhookPago = {
  pagoId: string;
  estado: "pagado" | "fallido";
  referencia: string;
};

export type ErrorWebhookPago =
  | "no_autorizado"
  | "entrada_invalida"
  | "no_encontrado"
  | "pago_ya_cerrado"
  | "entorno_incompleto"
  | "supabase_inalcanzable";

export type ResultadoWebhookPago =
  | { ok: true; pago_id: string; estado: "pagado" | "fallido" }
  | { ok: false; error: ErrorWebhookPago };
