import { claseError } from "@/lib/ui/clases";

type MensajeDesempenoProps = {
  texto: string;
};

export function MensajeDesempeno({ texto }: MensajeDesempenoProps) {
  return <p className={claseError}>{texto}</p>;
}
