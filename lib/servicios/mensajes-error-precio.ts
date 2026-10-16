import type { ErrorPrecioServicio } from "@/types/precio-servicio";

const MENSAJES: Record<ErrorPrecioServicio, string> = {
  entrada_invalida:
    "El precio tiene que ser mayor que cero, en soles y con hasta dos decimales.",
  no_encontrado: "Ese servicio ya no está en el catálogo.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorPrecio(error: ErrorPrecioServicio): string {
  return MENSAJES[error];
}
