export type Barbero = {
  id: string;
  nombre: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type EntradaBarbero = {
  nombre: string;
  activo: boolean;
};

export type ErrorBarbero =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "supabase_inalcanzable";

export type ResultadoBarberos =
  | { ok: true; barberos: Barbero[] }
  | { ok: false; error: ErrorBarbero };

export type ResultadoBarbero =
  | { ok: true; barbero: Barbero }
  | { ok: false; error: ErrorBarbero };
