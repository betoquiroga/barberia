import type { FilaPresentada } from "@/lib/landing/presentar-horarios";

type FilaHorarioProps = {
  fila: FilaPresentada;
};

export function FilaHorario({ fila }: FilaHorarioProps) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-b border-zinc-800 py-3">
      <span>{fila.dia}</span>
      <span className="text-zinc-300">{fila.franja}</span>
    </li>
  );
}
