import type { ErrorServicioOfrecido } from "@/types/servicio-ofrecido";

const MENSAJES: Record<ErrorServicioOfrecido, string> = {
  entrada_invalida:
    "Revisa el nombre, el precio y el costo. El precio tiene que cubrir el costo.",
  nombre_duplicado: "Ya existe un servicio con ese nombre.",
  servidor_inexistente: "Uno de los servidores elegidos ya no existe.",
  no_encontrado: "Ese servicio ya no existe.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorServicioOfrecido(
  error: ErrorServicioOfrecido,
): string {
  return MENSAJES[error];
}
