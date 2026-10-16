import { claseError } from "@/lib/ui/clases";

type MensajeCitasProps = {
  texto: string;
};

export function MensajeCitas({ texto }: MensajeCitasProps) {
  return <p className={claseError}>{texto}</p>;
}
