import { claseError, claseExito } from "@/lib/ui/clases";

type MensajeReservaProps = {
  tipo: "error" | "confirmacion";
  texto: string;
};

export function MensajeReserva({ tipo, texto }: MensajeReservaProps) {
  const clase = tipo === "error" ? claseError : claseExito;

  return <p className={clase}>{texto}</p>;
}
