import { FilaBarra } from "@/components/citas/fila-barra";
import { claseBarra } from "@/lib/citas/clase-barra";
import { presentarHora } from "@/lib/citas/presentar-eje";
import { claseBarraHora, claseBarraPico } from "@/lib/ui/clases";
import type { HoraCitas, HorarioPico } from "@/types/citas-diagrama";

type DiagramaHorasProps = {
  horas: HoraCitas[];
  horarioPico: HorarioPico | null;
};

export function DiagramaHoras({ horas, horarioPico }: DiagramaHorasProps) {
  const maximo = horas.reduce(
    (mayor, hora) => Math.max(mayor, hora.cantidad),
    0,
  );

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Horario con más citas</h2>
      {horarioPico ? (
        <p>
          Más citas a las {presentarHora(horarioPico.hora)} (
          {horarioPico.cantidad}).
        </p>
      ) : null}
      <ul className="flex flex-col gap-2">
        {horas.map((hora) => (
          <li key={hora.hora}>
            <FilaBarra
              etiqueta={presentarHora(hora.hora)}
              cantidad={hora.cantidad}
              ancho={claseBarra(hora.cantidad, maximo)}
              color={
                horarioPico?.hora === hora.hora ? claseBarraPico : claseBarraHora
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
