import { claseError, claseExito } from "@/lib/ui/clases";

type MensajeServidorProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeServidor({ tipo, texto }: MensajeServidorProps) {
  const clase = tipo === "error" ? claseError : claseExito;

  return <p className={clase}>{texto}</p>;
}
