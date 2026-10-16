import { claseError, claseExito } from "@/lib/ui/clases";

type MensajeServicioProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeServicio({ tipo, texto }: MensajeServicioProps) {
  const clase =
    tipo === "error" ? claseError : claseExito;

  return <p className={clase}>{texto}</p>;
}
