import { agruparCitas } from "@/lib/citas/agrupar-citas";
import type { FilaCitaDiagrama } from "@/lib/citas/agrupar-citas";
import { validarMes } from "@/lib/desempeno/validar-mes";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type { ResultadoCitasDiagrama } from "@/types/citas-diagrama";

export async function leerDiagramaCitas(
  mes: string | null,
): Promise<ResultadoCitasDiagrama> {
  const validacion = validarMes(mes);

  if (!validacion.ok) {
    return { ok: false, error: "mes_invalido" };
  }

  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const { data, error } = await crearCliente(entorno)
    .from("citas")
    .select("inicia_en, estado")
    .gte("inicia_en", validacion.intervalo.desde)
    .lt("inicia_en", validacion.intervalo.hasta);

  if (error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const agrupado = agruparCitas(
    (data ?? []) as FilaCitaDiagrama[],
    validacion.intervalo.mes,
  );

  return {
    ok: true,
    mes: validacion.intervalo.mes,
    dias: agrupado.dias,
    horas: agrupado.horas,
    horario_pico: agrupado.horario_pico,
  };
}
