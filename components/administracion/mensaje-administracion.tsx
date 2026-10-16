import { claseError, claseExito } from "@/lib/ui/clases";

type MensajeAdministracionProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeAdministracion({
  tipo,
  texto,
}: MensajeAdministracionProps) {
  const clase = tipo === "error" ? claseError : claseExito;

  return <p className={clase}>{texto}</p>;
}
