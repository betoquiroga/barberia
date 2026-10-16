import { validarHorario } from "@/lib/horarios/validar-horario";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type {
  DiaSemana,
  EntradaHorario,
  Horario,
  ResultadoBorradoHorario,
  ResultadoHorario,
  ResultadoHorarios,
} from "@/types/horario";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const COLUMNAS = "id, dia, abre, cierra, cerrado, creado_en, actualizado_en";

const ORDEN_DIAS: DiaSemana[] = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo",
];

type FilaHorario = {
  id: string;
  dia: DiaSemana;
  abre: string | null;
  cierra: string | null;
  cerrado: boolean;
  creado_en: string;
  actualizado_en: string;
};

type ErrorSdk = { code?: string } | null;

export async function listarHorarios(): Promise<ResultadoHorarios> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await supabase
    .from("horarios_atencion")
    .select(COLUMNAS);

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const horarios = ((data ?? []) as FilaHorario[])
    .map(mapearHorario)
    .sort(
      (a, b) => ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia),
    );

  return { ok: true, horarios };
}

export async function obtenerHorario(id: string): Promise<ResultadoHorario> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("horarios_atencion")
    .select(COLUMNAS)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, horario: mapearHorario(data as FilaHorario) };
}

export async function insertarHorario(
  cuerpo: unknown,
): Promise<ResultadoHorario> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarHorario(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await supabase
    .from("horarios_atencion")
    .insert(columnas(entrada))
    .select(COLUMNAS)
    .single();

  return leerFila(data as FilaHorario | null, error);
}

export async function actualizarHorario(
  id: string,
  cuerpo: unknown,
): Promise<ResultadoHorario> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarHorario(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("horarios_atencion")
    .update(columnas(entrada))
    .eq("id", id)
    .select(COLUMNAS)
    .maybeSingle();

  return leerFila(data as FilaHorario | null, error);
}

export async function borrarHorario(
  id: string,
): Promise<ResultadoBorradoHorario> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("horarios_atencion")
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

function columnas(entrada: EntradaHorario) {
  if (entrada.cerrado) {
    return { dia: entrada.dia, cerrado: true, abre: null, cierra: null };
  }

  return {
    dia: entrada.dia,
    cerrado: false,
    abre: entrada.abre,
    cierra: entrada.cierra,
  };
}

function leerFila(
  data: FilaHorario | null,
  error: ErrorSdk,
): ResultadoHorario {
  if (error?.code === "23505") {
    return { ok: false, error: "dia_duplicado" };
  }

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, horario: mapearHorario(data) };
}

function mapearHorario(fila: FilaHorario): Horario {
  return {
    id: fila.id,
    dia: fila.dia,
    abre: recortarHora(fila.abre),
    cierra: recortarHora(fila.cierra),
    cerrado: fila.cerrado,
    creado_en: fila.creado_en,
    actualizado_en: fila.actualizado_en,
  };
}

function recortarHora(valor: string | null): string | null {
  if (valor === null) {
    return null;
  }

  return valor.slice(0, 5);
}
