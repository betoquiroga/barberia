import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import { validarCliente } from "@/lib/clientes/validar-cliente";
import type {
  Cliente,
  ResultadoBorrado,
  ResultadoCliente,
  ResultadoClientes,
} from "@/types/cliente";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COLUMNAS =
  "id, nombre, correo, telefono, detalle, creado_en, actualizado_en";

type ErrorSdk = { code?: string } | null;

export async function listarClientes(): Promise<ResultadoClientes> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await supabase
    .from("clientes")
    .select(COLUMNAS)
    .order("creado_en", { ascending: false });

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  return { ok: true, clientes: (data ?? []) as Cliente[] };
}

export async function obtenerCliente(id: string): Promise<ResultadoCliente> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("clientes")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, cliente: data as Cliente };
}

export async function insertarCliente(
  cuerpo: unknown,
): Promise<ResultadoCliente> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarCliente(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await supabase
    .from("clientes")
    .insert({
      nombre: entrada.nombre,
      correo: entrada.correo,
      telefono: entrada.telefono,
      detalle: entrada.detalle ?? "",
    })
    .select(COLUMNAS)
    .single();

  return leerFila(data as Cliente | null, error);
}

export async function actualizarCliente(
  id: string,
  cuerpo: unknown,
): Promise<ResultadoCliente> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarCliente(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("clientes")
    .update({
      nombre: entrada.nombre,
      correo: entrada.correo,
      telefono: entrada.telefono,
      detalle: entrada.detalle ?? "",
    })
    .eq("id", id)
    .select(COLUMNAS)
    .maybeSingle();

  return leerFila(data as Cliente | null, error);
}

export async function borrarCliente(id: string): Promise<ResultadoBorrado> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("clientes")
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

function leerFila(data: Cliente | null, error: ErrorSdk): ResultadoCliente {
  if (error?.code === "23505") {
    return { ok: false, error: "correo_duplicado" };
  }

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, cliente: data };
}
