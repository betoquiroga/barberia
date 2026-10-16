import { presentarSoles } from "@/lib/desempeno/presentar-montos";
import type { ResumenDesempeno } from "@/lib/desempeno/resumir-filas";

type ResumenMesProps = {
  resumen: ResumenDesempeno;
};

export function ResumenMes({ resumen }: ResumenMesProps) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p>Citas completadas: {resumen.citasCompletadas}</p>
      <p>Citas canceladas: {resumen.citasCanceladas}</p>
      <p>Citas programadas: {resumen.citasProgramadas}</p>
      <p>
        Ingresos: {presentarSoles(resumen.ingresosCentavos)} Ticket promedio:{" "}
        {presentarSoles(resumen.ticketPromedioCentavos)}
      </p>
    </div>
  );
}
