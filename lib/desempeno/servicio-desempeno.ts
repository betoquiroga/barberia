import type {
  ErrorDesempeno,
  FilaDesempeno,
  ResultadoDesempeno,
  ResultadoDesempenoBarbero,
} from "@/types/desempeno";

const ERRORES: ErrorDesempeno[] = [
  "entorno_incompleto",
  "mes_invalido",
  "no_encontrado",
  "supabase_inalcanzable",
];

const FALLO: { ok: false; error: ErrorDesempeno } = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esError(valor: unknown): valor is ErrorDesempeno {
  return typeof valor === "string" && ERRORES.includes(valor as ErrorDesempeno);
}

function esFila(valor: unknown): valor is FilaDesempeno {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const fila = valor as FilaDesempeno;

  return (
    typeof fila.barbero_id === "string" &&
    typeof fila.nombre === "string" &&
    typeof fila.activo === "boolean" &&
    typeof fila.citas_completadas === "number" &&
    typeof fila.citas_canceladas === "number" &&
    typeof fila.citas_programadas === "number" &&
    typeof fila.ingresos_centavos === "number" &&
    typeof fila.ticket_promedio_centavos === "number"
  );
}

function conMes(ruta: string, mes?: string): string {
  const texto = mes?.trim() ?? "";

  if (!texto) {
    return ruta;
  }

  return `${ruta}?mes=${encodeURIComponent(mes as string)}`;
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorConocido(dato: unknown): ErrorDesempeno | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as { ok?: unknown; error?: unknown };

  if (cuerpo.ok === false && esError(cuerpo.error)) {
    return cuerpo.error;
  }

  return null;
}

export async function listarDesempeno(
  mes?: string,
): Promise<ResultadoDesempeno> {
  try {
    const response = await fetch(conMes("/api/desempeno", mes), {
      cache: "no-store",
    });
    const dato = await leerJson(response);

    if (dato === null) {
      return FALLO;
    }

    const error = errorConocido(dato);

    if (error) {
      return { ok: false, error };
    }

    if (
      dato &&
      typeof dato === "object" &&
      (dato as { ok?: unknown }).ok === true &&
      typeof (dato as { mes?: unknown }).mes === "string" &&
      Array.isArray((dato as { filas?: unknown }).filas) &&
      (dato as { filas: unknown[] }).filas.every(esFila)
    ) {
      const cuerpo = dato as { mes: string; filas: FilaDesempeno[] };

      return { ok: true, mes: cuerpo.mes, filas: cuerpo.filas };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}

export async function leerDesempenoBarbero(
  barberoId: string,
  mes?: string,
): Promise<ResultadoDesempenoBarbero> {
  try {
    const response = await fetch(
      conMes(`/api/desempeno/${encodeURIComponent(barberoId)}`, mes),
      { cache: "no-store" },
    );
    const dato = await leerJson(response);

    if (dato === null) {
      return FALLO;
    }

    const error = errorConocido(dato);

    if (error) {
      return { ok: false, error };
    }

    if (
      dato &&
      typeof dato === "object" &&
      (dato as { ok?: unknown }).ok === true &&
      typeof (dato as { mes?: unknown }).mes === "string" &&
      esFila((dato as { fila?: unknown }).fila)
    ) {
      const cuerpo = dato as { mes: string; fila: FilaDesempeno };

      return { ok: true, mes: cuerpo.mes, fila: cuerpo.fila };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
