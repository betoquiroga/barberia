import type { ErrorServidor } from "@/types/servidor";

const MENSAJES: Record<ErrorServidor, string> = {
  entrada_invalida: "Revisa el nombre, el teléfono y si está activo.",
  no_encontrado: "Ese servidor ya no existe.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorServidor(error: ErrorServidor): string {
  return MENSAJES[error];
}
