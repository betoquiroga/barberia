import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import { validarPrecio } from "@/lib/servicios/validar-precio";
import type {
  ResultadoPrecioServicio,
  ServicioConPrecio,
} from "@/types/precio-servicio";

const COLUMNAS = "id, nombre, descripcion, precio_centavos";

type FilaServicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_centavos: number;
};

type ErrorSdk = { code?: string; message?: string } | null;

export async function actualizarPrecioServicio(
  id: string,
  cuerpo: unknown,
): Promise<ResultadoPrecioServicio> {
  const entorno = leerEntorno();

  if (!entorno) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const entrada = validarPrecio(id, cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const { data, error } = await crearCliente(entorno)
    .from("servicios")
    .update({ precio_centavos: entrada.precio_centavos })
    .eq("id", entrada.id)
    .select(COLUMNAS);

  if (error) {
    return { ok: false, error: traducirError(error) };
  }

  if (!data || data.length === 0) {
    return { ok: false, error: "no_encontrado" };
  }

  const fila = data[0] as FilaServicio;

  return { ok: true, servicio: presentar(fila) };
}

function presentar(fila: FilaServicio): ServicioConPrecio {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precio_centavos: fila.precio_centavos,
    moneda: "PEN",
  };
}

function traducirError(error: ErrorSdk): "entrada_invalida" | "supabase_inalcanzable" {
  if (
    error?.code === "23514" ||
    error?.message?.includes("servicios_precio_positivo")
  ) {
    return "entrada_invalida";
  }

  return "supabase_inalcanzable";
}
