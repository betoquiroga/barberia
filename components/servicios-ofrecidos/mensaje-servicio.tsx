type MensajeServicioProps = {
  tipo: "error" | "exito";
  texto: string;
};

export function MensajeServicio({ tipo, texto }: MensajeServicioProps) {
  const clase =
    tipo === "error" ? "text-sm text-red-400" : "text-sm text-green-400";

  return <p className={clase}>{texto}</p>;
}
