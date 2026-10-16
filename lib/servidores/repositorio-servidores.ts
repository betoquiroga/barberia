import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import { validarServidor } from "@/lib/servidores/validar-servidor";
import type {
  ResultadoBorradoServidor,
  ResultadoServidor,
  ResultadoServidores,
  Servidor,
} from "@/types/servidor";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COLUMNAS = "id, nombre, telefono, activo, creado_en, actualizado_en";

type ErrorSdk = { code?: string } | null;

export async function listarServidores(): Promise<ResultadoServidores> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await supabase
    .from("servidores")
    .select(COLUMNAS)
    .order("creado_en", { ascending: false });

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  return { ok: true, servidores: (data ?? []) as Servidor[] };
}

export async function obtenerServidor(id: string): Promise<ResultadoServidor> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("servidores")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, servidor: data as Servidor };
}

export async function insertarServidor(
  cuerpo: unknown,
): Promise<ResultadoServidor> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarServidor(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await supabase
    .from("servidores")
    .insert({
      nombre: entrada.nombre,
      telefono: entrada.telefono ?? "",
      activo: entrada.activo ?? true,
    })
    .select(COLUMNAS)
    .single();

  return leerFila(data as Servidor | null, error);
}

export async function actualizarServidor(
  id: string,
  cuerpo: unknown,
): Promise<ResultadoServidor> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarServidor(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("servidores")
    .update({
      nombre: entrada.nombre,
      telefono: entrada.telefono ?? "",
      activo: entrada.activo ?? true,
    })
    .eq("id", id)
    .select(COLUMNAS)
    .maybeSingle();

  return leerFila(data as Servidor | null, error);
}

export async function borrarServidor(
  id: string,
): Promise<ResultadoBorradoServidor> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("servidores")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true };
}

function cliente() {
  const entorno = leerEntorno();

  if (!entorno) {
    return null;
  }

  return crearCliente(entorno);
}

function leerFila(data: Servidor | null, error: ErrorSdk): ResultadoServidor {
  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, servidor: data };
}
