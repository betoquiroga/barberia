type MensajeReservaProps = {
  tipo: "error" | "confirmacion";
  texto: string;
};

export function MensajeReserva({ tipo, texto }: MensajeReservaProps) {
  const clase =
    tipo === "error" ? "text-sm text-red-300" : "text-sm text-green-400";

  return <p className={clase}>{texto}</p>;
}
