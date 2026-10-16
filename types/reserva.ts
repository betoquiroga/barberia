export type ValoresReserva = {
  nombre: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
};

export type ErroresReserva = Partial<
  Record<"nombre" | "telefono" | "servicioId" | "fecha" | "hora" | "nota", string>
>;

export type ResultadoValidacionReserva =
  | { ok: true }
  | { ok: false; errores: ErroresReserva };
