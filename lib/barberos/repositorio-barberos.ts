import { validarBarbero } from "@/lib/barberos/validar-barbero";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type {
  Barbero,
  ResultadoBarbero,
  ResultadoBarberos,
} from "@/types/barbero";

const COLUMNAS = "id, nombre, activo, creado_en, actualizado_en";

export async function listarBarberos(): Promise<ResultadoBarberos> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await crearCliente(entorno)
    .from("barberos")
    .select(COLUMNAS)
    .order("nombre", { ascending: true });

  if (error || !data) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const barberos = [...(data as Barbero[])].sort(compararBarberos);

  return { ok: true, barberos };
}

export async function insertarBarbero(cuerpo: unknown): Promise<ResultadoBarbero> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarBarbero(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await crearCliente(entorno)
    .from("barberos")
    .insert({ nombre: entrada.nombre, activo: entrada.activo })
    .select(COLUMNAS)
    .limit(1);

  if (error || !data || data.length !== 1) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  return { ok: true, barbero: data[0] as Barbero };
}

function compararBarberos(a: Barbero, b: Barbero): number {
  if (a.nombre < b.nombre) {
    return -1;
  }

  if (a.nombre > b.nombre) {
    return 1;
  }

  if (a.creado_en < b.creado_en) {
    return -1;
  }

  if (a.creado_en > b.creado_en) {
    return 1;
  }

  return 0;
}
