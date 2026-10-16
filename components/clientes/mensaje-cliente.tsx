type MensajeClienteProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeCliente({ tipo, texto }: MensajeClienteProps) {
  const clase =
    tipo === "error" ? "text-sm text-red-400" : "text-sm text-green-400";

  return <p className={clase}>{texto}</p>;
}
