import type { ErrorAltaCita } from "@/types/cita-alta";

const MENSAJES: Record<ErrorAltaCita, string> = {
  entrada_invalida: "Revisa los datos e inténtalo de nuevo.",
  servicio_desconocido: "Ese estilo ya no está disponible. Recarga la página.",
  entorno_incompleto: "No podemos agendar ahora. Inténtalo más tarde.",
  supabase_inalcanzable: "No pudimos guardar la cita. Inténtalo de nuevo.",
  pago_no_creado:
    "La cita quedó creada, pero no hay enlace de pago. No vuelvas a enviar el formulario.",
  correo_no_enviado: "La cita quedó creada. No pudimos abrir la pasarela.",
};

export function mensajeErrorAlta(error: ErrorAltaCita): string {
  return MENSAJES[error];
}
