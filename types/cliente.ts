export type Cliente = {
  id: string;
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
  creado_en: string;
  actualizado_en: string;
};

export type EntradaCliente = {
  nombre: string;
  correo: string;
  telefono: string;
  detalle?: string;
};

export type ErrorCliente =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "correo_duplicado"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoClientes =
  | { ok: true; clientes: Cliente[] }
  | { ok: false; error: ErrorCliente };

export type ResultadoCliente =
  | { ok: true; cliente: Cliente }
  | { ok: false; error: ErrorCliente };

export type ResultadoBorrado =
  | { ok: true }
  | { ok: false; error: ErrorCliente };
