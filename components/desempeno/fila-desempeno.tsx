import { presentarSoles } from "@/lib/desempeno/presentar-montos";
import { claseEnlace, claseTextoSuave } from "@/lib/ui/clases";
import type { FilaDesempeno as DatosFila } from "@/types/desempeno";

type FilaDesempenoProps = {
  fila: DatosFila;
  mes: string;
};

export function FilaDesempeno({ fila, mes }: FilaDesempenoProps) {
  return (
    <tr className="border-b border-borde">
      <td className="py-2 pr-3">
        <a
          className={claseEnlace}
          href={`/desempeno/${fila.barbero_id}?mes=${mes}`}
        >
          {fila.nombre}
        </a>
        {fila.activo ? null : (
          <span className={claseTextoSuave}> Inactivo</span>
        )}
      </td>
      <td className="py-2 pr-3">{fila.citas_completadas}</td>
      <td className="py-2 pr-3">{fila.citas_canceladas}</td>
      <td className="py-2 pr-3">{fila.citas_programadas}</td>
      <td className="py-2 pr-3">{presentarSoles(fila.ingresos_centavos)}</td>
      <td className="py-2">
        {presentarSoles(fila.ticket_promedio_centavos)}
      </td>
    </tr>
  );
}
