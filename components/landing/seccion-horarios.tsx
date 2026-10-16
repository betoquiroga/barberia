import { FilaHorario } from "@/components/landing/fila-horario";
import { presentarHorarios } from "@/lib/landing/presentar-horarios";
import type { ResultadoHorarios } from "@/types/horario";

type SeccionHorariosProps = {
  resultado: ResultadoHorarios;
};

export function SeccionHorarios({ resultado }: SeccionHorariosProps) {
  return (
    <section id="horario" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Horario</h2>
      {contenido(resultado)}
    </section>
  );
}

function contenido(resultado: ResultadoHorarios) {
  if (!resultado.ok) {
    return <p className="mt-6 text-zinc-300">No pudimos cargar el horario</p>;
  }

  if (resultado.horarios.length === 0) {
    return <p className="mt-6 text-zinc-300">Horario por confirmar</p>;
  }

  const filas = presentarHorarios(resultado.horarios);

  return (
    <ul className="mt-6">
      {filas.map((fila) => (
        <FilaHorario key={fila.dia} fila={fila} />
      ))}
    </ul>
  );
}
