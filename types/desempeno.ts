export type MesDesempeno = string;

export type FilaDesempeno = {
  barbero_id: string;
  nombre: string;
  activo: boolean;
  citas_completadas: number;
  citas_canceladas: number;
  citas_programadas: number;
  ingresos_centavos: number;
  ticket_promedio_centavos: number;
};

export type ErrorDesempeno =
  | "entorno_incompleto"
  | "mes_invalido"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoDesempeno =
  | { ok: true; mes: MesDesempeno; filas: FilaDesempeno[] }
  | { ok: false; error: ErrorDesempeno };

export type ResultadoDesempenoBarbero =
  | { ok: true; mes: MesDesempeno; fila: FilaDesempeno }
  | { ok: false; error: ErrorDesempeno };
