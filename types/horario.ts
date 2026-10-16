export type DiaSemana =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type Horario = {
  id: string;
  dia: DiaSemana;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type EntradaHorario =
  | { dia: DiaSemana; cerrado: true }
  | { dia: DiaSemana; cerrado: false; abre: string; cierra: string };

export type ErrorHorario =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "dia_duplicado"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoHorarios =
  | { ok: true; horarios: Horario[] }
  | { ok: false; error: ErrorHorario };

export type ResultadoHorario =
  | { ok: true; horario: Horario }
  | { ok: false; error: ErrorHorario };

export type ResultadoBorradoHorario =
  | { ok: true }
  | { ok: false; error: ErrorHorario };
