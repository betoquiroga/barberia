import type {
  Barbero,
  EntradaBarbero,
  ErrorBarbero,
  ResultadoBarbero,
  ResultadoBarberos,
} from "@/types/barbero";

const ERRORES: ErrorBarbero[] = [
  "entorno_incompleto",
  "entrada_invalida",
  "supabase_inalcanzable",
];

const FALLO: { ok: false; error: ErrorBarbero } = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esError(valor: unknown): valor is ErrorBarbero {
  return typeof valor === "string" && ERRORES.includes(valor as ErrorBarbero);
}

function esBarbero(valor: unknown): valor is Barbero {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const barbero = valor as Barbero;

  return (
    typeof barbero.id === "string" &&
    typeof barbero.nombre === "string" &&
    typeof barbero.activo === "boolean" &&
    typeof barbero.creado_en === "string" &&
    typeof barbero.actualizado_en === "string"
  );
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorConocido(dato: unknown): ErrorBarbero | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as { ok?: unknown; error?: unknown };

  if (cuerpo.ok === false && esError(cuerpo.error)) {
    return cuerpo.error;
  }

  return null;
}

export async function listarBarberos(): Promise<ResultadoBarberos> {
  try {
    const response = await fetch("/api/barberos", { cache: "no-store" });
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
      Array.isArray((dato as { barberos?: unknown }).barberos) &&
      (dato as { barberos: unknown[] }).barberos.every(esBarbero)
    ) {
      return {
        ok: true,
        barberos: (dato as { barberos: Barbero[] }).barberos,
      };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}

export async function crearBarbero(
  entrada: EntradaBarbero,
): Promise<ResultadoBarbero> {
  try {
    const response = await fetch("/api/barberos", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: entrada.nombre.trim(),
        activo: entrada.activo,
      }),
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
      esBarbero((dato as { barbero?: unknown }).barbero)
    ) {
      return { ok: true, barbero: (dato as { barbero: Barbero }).barbero };
    }

    return FALLO;
  } catch {
    return FALLO;
  }
}
