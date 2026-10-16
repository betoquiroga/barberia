import type { FilaDesempeno } from "@/types/desempeno";

export type ResumenDesempeno = {
  citasCompletadas: number;
  citasCanceladas: number;
  citasProgramadas: number;
  ingresosCentavos: number;
  ticketPromedioCentavos: number;
};

export function resumirFilas(filas: FilaDesempeno[]): ResumenDesempeno {
  const citasCompletadas = sumar(filas, "citas_completadas");
  const ingresosCentavos = sumar(filas, "ingresos_centavos");

  return {
    citasCompletadas,
    citasCanceladas: sumar(filas, "citas_canceladas"),
    citasProgramadas: sumar(filas, "citas_programadas"),
    ingresosCentavos,
    ticketPromedioCentavos:
      citasCompletadas === 0
        ? 0
        : Math.trunc(ingresosCentavos / citasCompletadas),
  };
}

function sumar(
  filas: FilaDesempeno[],
  campo: "citas_completadas" | "citas_canceladas" | "citas_programadas" | "ingresos_centavos",
): number {
  return filas.reduce((total, fila) => total + fila[campo], 0);
}
