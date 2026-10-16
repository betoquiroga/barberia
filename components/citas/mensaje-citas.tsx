type MensajeCitasProps = {
  texto: string;
};

export function MensajeCitas({ texto }: MensajeCitasProps) {
  return <p className="text-sm text-red-400">{texto}</p>;
}
