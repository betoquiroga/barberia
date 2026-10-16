import type { ErrorCatalogo } from "@/types/catalogo-servicio";

const MENSAJES: Record<ErrorCatalogo, string> = {
  entorno_incompleto: "No pudimos cargar los estilos. Recarga la página.",
  supabase_inalcanzable: "No pudimos cargar los estilos. Recarga la página.",
};

export function mensajeErrorCatalogo(error: ErrorCatalogo): string {
  return MENSAJES[error];
}
