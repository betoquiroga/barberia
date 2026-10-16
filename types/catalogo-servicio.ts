export type EstiloPublico = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_centavos: number;
  moneda: "PEN";
};

export type ErrorCatalogo = "entorno_incompleto" | "supabase_inalcanzable";

export type ResultadoCatalogo =
  | { ok: true; servicios: EstiloPublico[] }
  | { ok: false; error: ErrorCatalogo };
