import type { ErrorCliente } from "@/types/cliente";

const MENSAJES: Record<ErrorCliente, string> = {
  entrada_invalida: "Revisa nombre, correo, teléfono y detalle.",
  correo_duplicado: "Ese correo ya está registrado.",
  no_encontrado: "Ese cliente ya no existe.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorCliente(error: ErrorCliente): string {
  return MENSAJES[error];
}
