import type { ErrorDesempeno } from "@/types/desempeno";

const MENSAJES: Record<ErrorDesempeno, string> = {
  mes_invalido: "El mes no es válido. Usa el formato año y mes.",
  no_encontrado: "Ese barbero no tiene desempeño en este mes.",
  entorno_incompleto: "El servidor no tiene la configuración de datos.",
  supabase_inalcanzable: "No se pudo contactar el servicio. Inténtalo de nuevo.",
};

export function mensajeErrorDesempeno(error: ErrorDesempeno): string {
  return MENSAJES[error];
}
