import { claseError, claseExito } from "@/lib/ui/clases";

type MensajeClienteProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeCliente({ tipo, texto }: MensajeClienteProps) {
  const clase = tipo === "error" ? claseError : claseExito;

  return <p className={clase}>{texto}</p>;
}
