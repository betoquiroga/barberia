export type EntradaAltaCita = {
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
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
};

export type ErrorAltaCita =
  | "entrada_invalida"
  | "servicio_desconocido"
  | "entorno_incompleto"
  | "supabase_inalcanzable"
  | "correo_no_enviado";

export type ResultadoAltaCita =
  | { ok: true; cita: CitaCreada }
  | { ok: false; error: ErrorAltaCita; cita_id?: string };
