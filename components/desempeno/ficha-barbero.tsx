import { presentarSoles } from "@/lib/desempeno/presentar-montos";
import type { FilaDesempeno } from "@/types/desempeno";

type FichaBarberoProps = {
  fila: FilaDesempeno;
  mes?: string;
};

export function FichaBarbero({ fila, mes }: FichaBarberoProps) {
  const vuelta = mes ? `/desempeno?mes=${mes}` : "/desempeno";

  return (
    <div className="flex flex-col gap-2 text-sm">
      <p>
        {fila.nombre}
        {fila.activo ? null : <span className="text-zinc-400"> Inactivo</span>}
      </p>
      <p>Completadas: {fila.citas_completadas}</p>
      <p>Canceladas: {fila.citas_canceladas}</p>
      <p>Programadas: {fila.citas_programadas}</p>
      <p>Ingresos: {presentarSoles(fila.ingresos_centavos)}</p>
      <p>Ticket: {presentarSoles(fila.ticket_promedio_centavos)}</p>
      <a className="hover:text-zinc-300" href={vuelta}>
        Volver al mes
      </a>
    </div>
  );
}
