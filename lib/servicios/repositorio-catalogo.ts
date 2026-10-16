import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type { EstiloPublico, ResultadoCatalogo } from "@/types/catalogo-servicio";

const ORDEN = ["corte-clasico", "arreglo-barba", "corte-y-barba"] as const;

type FilaServicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_centavos: number;
};

export async function leerCatalogoServicios(): Promise<ResultadoCatalogo> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const consulta = await crearCliente(entorno)
    .from("servicios")
    .select("id, nombre, descripcion, precio_centavos")
    .in("id", [...ORDEN]);

  if (consulta.error || !consulta.data) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const filas = consulta.data as FilaServicio[];
  const porId = new Map(filas.map((fila) => [fila.id, fila]));
  const servicios: EstiloPublico[] = [];

  for (const id of ORDEN) {
    const fila = porId.get(id);

    if (!fila || typeof fila.precio_centavos !== "number") {
      return { ok: false, error: "supabase_inalcanzable" };
    }

    servicios.push({
      id: fila.id,
      nombre: fila.nombre,
      descripcion: fila.descripcion,
      precio_centavos: fila.precio_centavos,
      moneda: "PEN",
    });
  }

  return { ok: true, servicios };
}
