export type EntradaAltaCita = {
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
};

export type PagoCitaCreada = {
  id: string;
  monto_centavos: number;
  moneda: "PEN";
  estado: "pendiente";
  url_pasarela: string;
};

export type CitaCreada = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  servicio_id: string;
  servicio_nombre: string;
  fecha: string;
  hora: string;
  nota: string;
  estado: "programada";
  correo_enviado: boolean;
  pago: PagoCitaCreada;
};

export type ErrorAltaCita =
  | "entrada_invalida"
  | "servicio_desconocido"
  | "entorno_incompleto"
  | "supabase_inalcanzable"
  | "pago_no_creado"
  | "correo_no_enviado";

export type ResultadoAltaCita =
  | { ok: true; cita: CitaCreada }
  | { ok: false; error: "entrada_invalida" | "servicio_desconocido" | "entorno_incompleto" | "supabase_inalcanzable" }
  | { ok: false; error: "pago_no_creado"; cita_id: string }
  | { ok: false; error: "correo_no_enviado"; cita_id: string; pago_id: string };
