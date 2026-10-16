export type DiaCitas = { fecha: string; cantidad: number };
export type HoraCitas = { hora: string; cantidad: number };
export type HorarioPico = { hora: string; cantidad: number };

export type ErrorCitasDiagrama =
  | "mes_invalido"
  | "entorno_incompleto"
  | "supabase_inalcanzable";

export type ResultadoCitasDiagrama =
  | {
      ok: true;
      mes: string;
      dias: DiaCitas[];
      horas: HoraCitas[];
      horario_pico: HorarioPico | null;
    }
  | { ok: false; error: ErrorCitasDiagrama };
