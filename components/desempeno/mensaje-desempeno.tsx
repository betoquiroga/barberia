type MensajeDesempenoProps = {
  texto: string;
};

export function MensajeDesempeno({ texto }: MensajeDesempenoProps) {
  return <p className="text-sm text-red-400">{texto}</p>;
}
