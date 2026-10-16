import type { DiaSemana, Horario } from "@/types/horario";

const ORDEN_DIAS: DiaSemana[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

const ETIQUETAS: Record<DiaSemana, string> = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
};

export type FilaPresentada = {
  dia: string;
  franja: string;
};

export function presentarHorarios(horarios: Horario[]): FilaPresentada[] {
  return [...horarios]
    .sort((a, b) => ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia))
    .map((horario) => ({
      dia: ETIQUETAS[horario.dia],
      franja: horario.cerrado
        ? "Cerrado"
        : `${horario.abre} a ${horario.cierra}`,
    }));
}
