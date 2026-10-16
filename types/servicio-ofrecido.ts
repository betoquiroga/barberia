import type { Servidor } from "@/types/servidor";

export type ServicioOfrecido = {
  id: string;
  nombre: string;
  precio_pesos: number;
  costo_pesos: number;
  servidores: Servidor[];
  creado_en: string;
  actualizado_en: string;
};

export type EntradaServicioOfrecido = {
  nombre: string;
  precio_pesos: number;
  costo_pesos: number;
  servidor_ids?: string[];
};

export type ErrorServicioOfrecido =
  | "entorno_incompleto"
  | "entrada_invalida"
  | "nombre_duplicado"
  | "servidor_inexistente"
  | "no_encontrado"
  | "supabase_inalcanzable";

export type ResultadoServiciosOfrecidos =
  | { ok: true; servicios: ServicioOfrecido[] }
  | { ok: false; error: ErrorServicioOfrecido };

export type ResultadoServicioOfrecido =
  | { ok: true; servicio: ServicioOfrecido }
  | { ok: false; error: ErrorServicioOfrecido };

export type ResultadoBorradoServicioOfrecido =
  | { ok: true }
  | { ok: false; error: ErrorServicioOfrecido };
