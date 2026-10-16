import { FilaBarra } from "@/components/citas/fila-barra";
import { claseBarra } from "@/lib/citas/clase-barra";
import { presentarFecha } from "@/lib/citas/presentar-eje";
import type { DiaCitas } from "@/types/citas-diagrama";

type DiagramaDiasProps = {
  dias: DiaCitas[];
};

export function DiagramaDias({ dias }: DiagramaDiasProps) {
  const maximo = dias.reduce(
    (mayor, dia) => Math.max(mayor, dia.cantidad),
    0,
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Citas por día</h2>
      <ul className="flex flex-col gap-2">
        {dias.map((dia) => (
          <li key={dia.fecha}>
            <FilaBarra
              etiqueta={presentarFecha(dia.fecha)}
              cantidad={dia.cantidad}
              ancho={claseBarra(dia.cantidad, maximo)}
              color="bg-zinc-200"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
