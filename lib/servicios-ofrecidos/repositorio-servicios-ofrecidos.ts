import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import { validarServicioOfrecido } from "@/lib/servicios-ofrecidos/validar-servicio-ofrecido";
import type { Servidor } from "@/types/servidor";
import type {
  ResultadoBorradoServicioOfrecido,
  ResultadoServicioOfrecido,
  ResultadoServiciosOfrecidos,
  ServicioOfrecido,
} from "@/types/servicio-ofrecido";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COLUMNAS_SERVIDOR =
  "id, nombre, telefono, activo, creado_en, actualizado_en";

const SELECT_SERVICIO = `
  id,
  nombre,
  precio_pesos,
  costo_pesos,
  creado_en,
  actualizado_en,
  servicio_ofrecido_servidor (
    servidores ( ${COLUMNAS_SERVIDOR} )
  )
`;

type ErrorSdk = { code?: string } | null;

type FilaPuente = {
  servidores: Servidor | Servidor[] | null;
};

type FilaServicio = {
  id: string;
  nombre: string;
  precio_pesos: number;
  costo_pesos: number;
  creado_en: string;
  actualizado_en: string;
  servicio_ofrecido_servidor: FilaPuente[] | null;
};

export async function listarServiciosOfrecidos(): Promise<ResultadoServiciosOfrecidos> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await supabase
    .from("servicios_ofrecidos")
    .select(SELECT_SERVICIO)
    .order("creado_en", { ascending: false });

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const servicios = ((data ?? []) as FilaServicio[]).map(presentar);

  return { ok: true, servicios };
}

export async function obtenerServicioOfrecido(
  id: string,
): Promise<ResultadoServicioOfrecido> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  return leerServicio(supabase, id);
}

export async function insertarServicioOfrecido(
  cuerpo: unknown,
): Promise<ResultadoServicioOfrecido> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarServicioOfrecido(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await supabase
    .from("servicios_ofrecidos")
    .insert({
      nombre: entrada.nombre,
      precio_pesos: entrada.precio_pesos,
      costo_pesos: entrada.costo_pesos,
    })
    .select("id")
    .single();

  if (error?.code === "23505") {
    return { ok: false, error: "nombre_duplicado" };
  }

  if (error || !data) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const id = (data as { id: string }).id;
  const servidorIds = entrada.servidor_ids ?? [];

  if (servidorIds.length > 0) {
    const vinculo = await insertarVinculos(supabase, id, servidorIds);

    if (vinculo) {
      await supabase.from("servicios_ofrecidos").delete().eq("id", id);
      return { ok: false, error: vinculo };
    }
  }

  return leerServicio(supabase, id);
}

export async function actualizarServicioOfrecido(
  id: string,
  cuerpo: unknown,
): Promise<ResultadoServicioOfrecido> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarServicioOfrecido(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const previos = await leerVinculos(supabase, id);

  if (!previos.ok) {
    return { ok: false, error: previos.error };
  }

  const { data, error } = await supabase
    .from("servicios_ofrecidos")
    .update({
      nombre: entrada.nombre,
      precio_pesos: entrada.precio_pesos,
      costo_pesos: entrada.costo_pesos,
    })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error?.code === "23505") {
    return { ok: false, error: "nombre_duplicado" };
  }

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  const { error: borrado } = await supabase
    .from("servicio_ofrecido_servidor")
    .delete()
    .eq("servicio_ofrecido_id", id);

  if (borrado) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const servidorIds = entrada.servidor_ids ?? [];
  const vinculo = await insertarVinculos(supabase, id, servidorIds);

  if (vinculo) {
    await insertarVinculos(supabase, id, previos.ids);
    return { ok: false, error: vinculo };
  }

  return leerServicio(supabase, id);
}

export async function borrarServicioOfrecido(
  id: string,
): Promise<ResultadoBorradoServicioOfrecido> {
  const supabase = cliente();

  if (!supabase) {
    return { ok: false, error: "entorno_incompleto" };
  }

  if (!UUID.test(id)) {
    return { ok: false, error: "no_encontrado" };
  }

  const { data, error } = await supabase
    .from("servicios_ofrecidos")
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

type ClienteSupabase = NonNullable<ReturnType<typeof cliente>>;

async function leerServicio(
  supabase: ClienteSupabase,
  id: string,
): Promise<ResultadoServicioOfrecido> {
  const { data, error } = await supabase
    .from("servicios_ofrecidos")
    .select(SELECT_SERVICIO)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  if (!data) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, servicio: presentar(data as FilaServicio) };
}

async function leerVinculos(
  supabase: ClienteSupabase,
  servicioId: string,
): Promise<
  | { ok: true; ids: string[] }
  | { ok: false; error: "supabase_inalcanzable" }
> {
  const { data, error } = await supabase
    .from("servicio_ofrecido_servidor")
    .select("servidor_id")
    .eq("servicio_ofrecido_id", servicioId);

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const ids = ((data ?? []) as { servidor_id: string }[]).map(
    (fila) => fila.servidor_id,
  );

  return { ok: true, ids };
}

async function insertarVinculos(
  supabase: ClienteSupabase,
  servicioId: string,
  servidorIds: string[],
): Promise<"servidor_inexistente" | "supabase_inalcanzable" | null> {
  if (servidorIds.length === 0) {
    return null;
  }

  const filas = servidorIds.map((servidorId) => ({
    servicio_ofrecido_id: servicioId,
    servidor_id: servidorId,
  }));

  const { error } = await supabase
    .from("servicio_ofrecido_servidor")
    .insert(filas);

  return codigoVinculo(error);
}

function codigoVinculo(
  error: ErrorSdk,
): "servidor_inexistente" | "supabase_inalcanzable" | null {
  if (!error) {
    return null;
  }

  if (error.code === "23503") {
    return "servidor_inexistente";
  }

  return "supabase_inalcanzable";
}

function presentar(fila: FilaServicio): ServicioOfrecido {
  const anidados = fila.servicio_ofrecido_servidor ?? [];
  const servidores = anidados
    .flatMap((puente) => {
      if (!puente.servidores) {
        return [];
      }

      return Array.isArray(puente.servidores)
        ? puente.servidores
        : [puente.servidores];
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

  return {
    id: fila.id,
    nombre: fila.nombre,
    precio_pesos: fila.precio_pesos,
    costo_pesos: fila.costo_pesos,
    servidores,
    creado_en: fila.creado_en,
    actualizado_en: fila.actualizado_en,
  };
}

function cliente() {
  const entorno = leerEntorno();

  if (!entorno) {
    return null;
  }

  return crearCliente(entorno);
}
