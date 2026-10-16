import type {
  DiaCitas,
  ErrorCitasDiagrama,
  HoraCitas,
  HorarioPico,
  ResultadoCitasDiagrama,
} from "@/types/citas-diagrama";

const ERRORES: ErrorCitasDiagrama[] = [
  "mes_invalido",
  "entorno_incompleto",
  "supabase_inalcanzable",
];

const FALLO: ResultadoCitasDiagrama = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esError(valor: unknown): valor is ErrorCitasDiagrama {
  return (
    typeof valor === "string" && ERRORES.includes(valor as ErrorCitasDiagrama)
  );
}

function esDia(valor: unknown): valor is DiaCitas {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const dia = valor as DiaCitas;

  return typeof dia.fecha === "string" && typeof dia.cantidad === "number";
}

function esHora(valor: unknown): valor is HoraCitas {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const hora = valor as HoraCitas;

  return typeof hora.hora === "string" && typeof hora.cantidad === "number";
}

function esPico(valor: unknown): valor is HorarioPico | null {
  if (valor === null) {
    return true;
  }

  return esHora(valor);
}

function ruta(mes?: string): string {
  const texto = mes?.trim() ?? "";

  if (!texto) {
    return "/api/citas";
  }

  return `/api/citas?mes=${encodeURIComponent(mes as string)}`;
}

export async function leerDiagramaCitasCliente(
  mes?: string,
): Promise<ResultadoCitasDiagrama> {
  try {
    const response = await fetch(ruta(mes), { cache: "no-store" });
    let dato: unknown;

    try {
      dato = await response.json();
    } catch {
      return FALLO;
    }

    if (!dato || typeof dato !== "object") {
      return FALLO;
    }

    const cuerpo = dato as {
      ok?: unknown;
      error?: unknown;
      mes?: unknown;
      dias?: unknown;
      horas?: unknown;
      horario_pico?: unknown;
    };

    if (cuerpo.ok === false && esError(cuerpo.error)) {
      return { ok: false, error: cuerpo.error };
    }

    if (
      cuerpo.ok === true &&
      typeof cuerpo.mes === "string" &&
      Array.isArray(cuerpo.dias) &&
      cuerpo.dias.every(esDia) &&
      Array.isArray(cuerpo.horas) &&
      cuerpo.horas.every(esHora) &&
      esPico(cuerpo.horario_pico)
    ) {
      return {
        ok: true,
        mes: cuerpo.mes,
        dias: cuerpo.dias,
        horas: cuerpo.horas,
        horario_pico: cuerpo.horario_pico,
      };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
