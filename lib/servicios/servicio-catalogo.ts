import type {
  ErrorCatalogo,
  EstiloPublico,
  ResultadoCatalogo,
} from "@/types/catalogo-servicio";

const FALLO: ResultadoCatalogo = { ok: false, error: "supabase_inalcanzable" };

const ERRORES: ErrorCatalogo[] = ["entorno_incompleto", "supabase_inalcanzable"];

function esEstilo(valor: unknown): valor is EstiloPublico {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const estilo = valor as EstiloPublico;

  return (
    typeof estilo.id === "string" &&
    typeof estilo.nombre === "string" &&
    typeof estilo.descripcion === "string" &&
    typeof estilo.precio_centavos === "number" &&
    estilo.moneda === "PEN"
  );
}

function errorCatalogo(dato: unknown, status: number): ErrorCatalogo | null {
  if (status !== 503 || !dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as { ok?: unknown; error?: unknown };

  if (
    cuerpo.ok === false &&
    typeof cuerpo.error === "string" &&
    ERRORES.includes(cuerpo.error as ErrorCatalogo)
  ) {
    return cuerpo.error as ErrorCatalogo;
  }

  return null;
}

export async function obtenerCatalogo(): Promise<ResultadoCatalogo> {
  try {
    const response = await fetch("/api/servicios", { cache: "no-store" });
    const dato: unknown = await response.json();
    const error = errorCatalogo(dato, response.status);

    if (error) {
      return { ok: false, error };
    }

    if (
      response.status === 200 &&
      dato &&
      typeof dato === "object" &&
      (dato as { ok?: unknown }).ok === true &&
      Array.isArray((dato as { servicios?: unknown }).servicios) &&
      (dato as { servicios: unknown[] }).servicios.every(esEstilo)
    ) {
      return {
        ok: true,
        servicios: (dato as { servicios: EstiloPublico[] }).servicios,
      };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
