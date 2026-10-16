import type { DiaSemana, EntradaHorario } from "@/types/horario";

const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

const DIAS: Record<string, DiaSemana> = {
  lunes: "lunes",
  martes: "martes",
  miercoles: "miercoles",
  miércoles: "miercoles",
  jueves: "jueves",
  viernes: "viernes",
  sabado: "sabado",
  sábado: "sabado",
  domingo: "domingo",
};

export function validarHorario(cuerpo: unknown): EntradaHorario | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const dia = normalizarDia(campos.dia);

  if (!dia || typeof campos.cerrado !== "boolean") {
    return null;
  }

  if (campos.cerrado) {
    return { dia, cerrado: true };
  }

  if (typeof campos.abre !== "string" || typeof campos.cierra !== "string") {
    return null;
  }

  if (!HORA.test(campos.abre) || !HORA.test(campos.cierra)) {
    return null;
  }

  if (campos.abre >= campos.cierra) {
    return null;
  }

  return { dia, cerrado: false, abre: campos.abre, cierra: campos.cierra };
}

function normalizarDia(valor: unknown): DiaSemana | null {
  if (typeof valor !== "string") {
    return null;
  }

  return DIAS[valor.trim().toLowerCase()] ?? null;
}
