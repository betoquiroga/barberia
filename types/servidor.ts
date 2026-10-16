export type Servidor = {
  id: string;
  nombre: string;
  telefono: string;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
};

export type EntradaServidor = {
  nombre: string;
  telefono?: string;
  activo?: boolean;
};

export type ErrorServidor =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoServidores =
  | { ok: true; servidores: Servidor[] }
  | { ok: false; error: ErrorServidor };

export type ResultadoServidor =
  | { ok: true; servidor: Servidor }
  | { ok: false; error: ErrorServidor };

export type ResultadoBorradoServidor =
  | { ok: true }
  | { ok: false; error: ErrorServidor };
