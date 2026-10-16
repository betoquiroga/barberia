import { validarMes } from "@/lib/desempeno/validar-mes";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type {
  FilaDesempeno,
  ResultadoDesempeno,
  ResultadoDesempenoBarbero,
} from "@/types/desempeno";
import type { SupabaseClient } from "@supabase/supabase-js";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type FilaBarbero = {
  id: string;
  nombre: string;
  activo: boolean;
};

type FilaCita = {
  barbero_id: string;
  servicio_id: string;
  estado: string;
};

type FilaServicio = {
  id: string;
  precio_centavos: number;
};

type HechosMes = {
  barberos: FilaBarbero[];
  citas: FilaCita[];
  precios: Map<string, number>;
};

export async function listarDesempeno(
  mes: string | null,
): Promise<ResultadoDesempeno> {
  const preparado = await preparar(mes);

  if (!preparado.ok) {
    return preparado;
  }

  return {
    ok: true,
    mes: preparado.mes,
    filas: preparado.filas,
  };
}

export async function obtenerDesempenoBarbero(
  barberoId: string,
  mes: string | null,
): Promise<ResultadoDesempenoBarbero> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const validacion = validarMes(mes);

  if (!validacion.ok) {
    return validacion;
  }

  if (!UUID.test(barberoId)) {
    return { ok: false, error: "no_encontrado" };
  }

  const listado = await listarDesempeno(mes);

  if (!listado.ok) {
    return listado;
  }

  const fila = listado.filas.find(
    (candidata) => candidata.barbero_id === barberoId,
  );

  if (!fila) {
    return { ok: false, error: "no_encontrado" };
  }

  return { ok: true, mes: listado.mes, fila };
}

async function preparar(mes: string | null): Promise<
  | { ok: true; mes: string; filas: FilaDesempeno[] }
  | { ok: false; error: "entorno_incompleto" | "mes_invalido" | "supabase_inalcanzable" }
> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const validacion = validarMes(mes);

  if (!validacion.ok) {
    return validacion;
  }

  const hechos = await leerHechos(
    crearCliente(entorno),
    validacion.intervalo.desde,
    validacion.intervalo.hasta,
  );

  if (!hechos) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  return {
    ok: true,
    mes: validacion.intervalo.mes,
    filas: armarFilas(hechos.barberos, hechos.citas, hechos.precios),
  };
}

async function leerHechos(
  supabase: SupabaseClient,
  desde: string,
  hasta: string,
): Promise<HechosMes | null> {
  const [barberos, citas, servicios] = await Promise.all([
    supabase.from("barberos").select("id, nombre, activo"),
    supabase
      .from("citas")
      .select("barbero_id, servicio_id, estado")
      .gte("inicia_en", desde)
      .lt("inicia_en", hasta),
    supabase.from("servicios").select("id, precio_centavos"),
  ]);

  if (barberos.error || citas.error || servicios.error) {
    return null;
  }

  const precios = new Map<string, number>();

  for (const servicio of (servicios.data ?? []) as FilaServicio[]) {
    precios.set(servicio.id, servicio.precio_centavos);
  }

  return {
    barberos: (barberos.data ?? []) as FilaBarbero[],
    citas: (citas.data ?? []) as FilaCita[],
    precios,
  };
}

function armarFilas(
  barberos: FilaBarbero[],
  citas: FilaCita[],
  precios: Map<string, number>,
): FilaDesempeno[] {
  const porBarbero = new Map<string, FilaCita[]>();

  for (const cita of citas) {
    const propias = porBarbero.get(cita.barbero_id) ?? [];
    propias.push(cita);
    porBarbero.set(cita.barbero_id, propias);
  }

  const filas = barberos.flatMap((barbero) => {
    const propias = porBarbero.get(barbero.id) ?? [];

    if (!barbero.activo && propias.length === 0) {
      return [];
    }

    return [filaDe(barbero, propias, precios)];
  });

  filas.sort((a, b) => {
    if (b.ingresos_centavos !== a.ingresos_centavos) {
      return b.ingresos_centavos - a.ingresos_centavos;
    }

    return a.nombre.localeCompare(b.nombre, "es");
  });

  return filas;
}

function filaDe(
  barbero: FilaBarbero,
  citas: FilaCita[],
  precios: Map<string, number>,
): FilaDesempeno {
  let citasCompletadas = 0;
  let citasCanceladas = 0;
  let citasProgramadas = 0;
  let ingresosCentavos = 0;

  for (const cita of citas) {
    if (cita.estado === "completada") {
      citasCompletadas += 1;
      const precio = precios.get(cita.servicio_id);

      if (precio !== undefined) {
        ingresosCentavos += precio;
      }
    } else if (cita.estado === "cancelada") {
      citasCanceladas += 1;
    } else if (cita.estado === "programada") {
      citasProgramadas += 1;
    }
  }

  return {
    barbero_id: barbero.id,
    nombre: barbero.nombre,
    activo: barbero.activo,
    citas_completadas: citasCompletadas,
    citas_canceladas: citasCanceladas,
    citas_programadas: citasProgramadas,
    ingresos_centavos: ingresosCentavos,
    ticket_promedio_centavos:
      citasCompletadas === 0
        ? 0
        : Math.trunc(ingresosCentavos / citasCompletadas),
  };
}
