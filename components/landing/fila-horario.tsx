import type { FilaPresentada } from "@/lib/landing/presentar-horarios";
import { claseTextoSuave } from "@/lib/ui/clases";

type FilaHorarioProps = {
  fila: FilaPresentada;
};

export function FilaHorario({ fila }: FilaHorarioProps) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-borde py-3">
      <span>{fila.dia}</span>
      <span className={claseTextoSuave}>{fila.franja}</span>
    </li>
  );
}
