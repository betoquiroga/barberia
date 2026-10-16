import type { ErrorBarbero } from "@/types/barbero";

const MENSAJES: Record<ErrorBarbero, string> = {
  entrada_invalida: "Revisa el nombre del barbero.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorBarbero(error: ErrorBarbero): string {
  return MENSAJES[error];
}
