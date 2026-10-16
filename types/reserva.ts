export type ValoresReserva = {
  nombre: string;
  correo: string;
  telefono: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nota: string;
};

export type ErroresReserva = Partial<
  Record<
    "nombre" | "correo" | "telefono" | "servicioId" | "fecha" | "hora" | "nota",
    string
  >
>;

export type ResultadoValidacionReserva =
  | { ok: true }
  | { ok: false; errores: ErroresReserva };
