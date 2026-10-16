export type EntradaPrecioServicio = {
  precio_centavos: number;
};

export type ServicioConPrecio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_centavos: number;
  moneda: "PEN";
};

export type ErrorPrecioServicio =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoPrecioServicio =
  | { ok: true; servicio: ServicioConPrecio }
  | { ok: false; error: ErrorPrecioServicio };
