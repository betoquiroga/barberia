type MensajeServidorProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeServidor({ tipo, texto }: MensajeServidorProps) {
  const clase =
    tipo === "error" ? "text-sm text-red-400" : "text-sm text-green-400";

  return <p className={clase}>{texto}</p>;
}
