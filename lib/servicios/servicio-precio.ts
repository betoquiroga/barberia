import type {
  EntradaPrecioServicio,
  ErrorPrecioServicio,
  ResultadoPrecioServicio,
  ServicioConPrecio,
} from "@/types/precio-servicio";

const ERRORES: ErrorPrecioServicio[] = [
  "entorno_incompleto",
  "entrada_invalida",
  "no_encontrado",
  "supabase_inalcanzable",
];

const FALLO: ResultadoPrecioServicio = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esError(valor: unknown): valor is ErrorPrecioServicio {
  return typeof valor === "string" && ERRORES.includes(valor as ErrorPrecioServicio);
}

function esServicio(valor: unknown): valor is ServicioConPrecio {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const servicio = valor as ServicioConPrecio;

  return (
    typeof servicio.id === "string" &&
    typeof servicio.nombre === "string" &&
    typeof servicio.descripcion === "string" &&
    typeof servicio.precio_centavos === "number" &&
    servicio.moneda === "PEN"
  );
}

export async function actualizarPrecio(
  id: string,
  entrada: EntradaPrecioServicio,
): Promise<ResultadoPrecioServicio> {
  try {
    const response = await fetch(`/api/servicios/${id}`, {
      method: "PATCH",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ precio_centavos: entrada.precio_centavos }),
    });

    let dato: unknown;

    try {
      dato = await response.json();
    } catch {
      return FALLO;
    }

    if (!dato || typeof dato !== "object") {
      return FALLO;
    }

    const cuerpo = dato as { ok?: unknown; error?: unknown; servicio?: unknown };

    if (cuerpo.ok === true && esServicio(cuerpo.servicio)) {
      return { ok: true, servicio: cuerpo.servicio };
    }

    if (cuerpo.ok === false && esError(cuerpo.error)) {
      return { ok: false, error: cuerpo.error };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
