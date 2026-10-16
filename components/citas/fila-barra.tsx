import { claseRiel } from "@/lib/ui/clases";

type FilaBarraProps = {
  etiqueta: string;
  cantidad: number;
  ancho: string;
  color: string;
};

export function FilaBarra({
  etiqueta,
  cantidad,
  ancho,
  color,
}: FilaBarraProps) {
  return (
    <div className="grid grid-cols-[4.5rem_2.5rem_minmax(0,1fr)] items-center gap-3 text-sm">
      <span>{etiqueta}</span>
      <span className="tabular-nums">{cantidad}</span>
      <div className={claseRiel}>
        <div className={`h-2 rounded ${color} ${ancho}`} />
      </div>
    </div>
  );
}
