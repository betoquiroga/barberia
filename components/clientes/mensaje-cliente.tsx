type MensajeClienteProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeCliente({ tipo, texto }: MensajeClienteProps) {
  const clase =
    tipo === "error" ? "text-sm text-red-700" : "text-sm text-green-700";

  return <p className={clase}>{texto}</p>;
}
