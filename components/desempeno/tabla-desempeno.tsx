import { FilaDesempeno } from "@/components/desempeno/fila-desempeno";
import type { FilaDesempeno as TipoFilaDesempeno } from "@/types/desempeno";

type TablaDesempenoProps = {
  filas: TipoFilaDesempeno[];
  mes: string;
};

export function TablaDesempeno({ filas, mes }: TablaDesempenoProps) {
  if (filas.length === 0) {
    return <p>No hay barberos en este mes.</p>;
  }

  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-b border-borde">
          <th className="py-2 pr-3 font-medium">Barbero</th>
          <th className="py-2 pr-3 font-medium">Completadas</th>
          <th className="py-2 pr-3 font-medium">Canceladas</th>
          <th className="py-2 pr-3 font-medium">Programadas</th>
          <th className="py-2 pr-3 font-medium">Ingresos</th>
          <th className="py-2 font-medium">Ticket</th>
        </tr>
      </thead>
      <tbody>
        {filas.map((fila) => (
          <FilaDesempeno key={fila.barbero_id} fila={fila} mes={mes} />
        ))}
      </tbody>
    </table>
  );
}
