import type {
  EntradaServidor,
  ErrorServidor,
  ResultadoBorradoServidor,
  ResultadoServidor,
  ResultadoServidores,
  Servidor,
} from "@/types/servidor";

const ERRORES: ErrorServidor[] = [
  "entorno_incompleto",
  "entrada_invalida",
  "no_encontrado",
  "supabase_inalcanzable",
];

const FALLO: { ok: false; error: ErrorServidor } = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esErrorServidor(valor: unknown): valor is ErrorServidor {
  return typeof valor === "string" && ERRORES.includes(valor as ErrorServidor);
}

export function esServidor(valor: unknown): valor is Servidor {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const servidor = valor as Servidor;

  return (
    typeof servidor.id === "string" &&
    typeof servidor.nombre === "string" &&
    typeof servidor.telefono === "string" &&
    typeof servidor.activo === "boolean" &&
    typeof servidor.creado_en === "string" &&
    typeof servidor.actualizado_en === "string"
  );
}

function cuerpo(entrada: EntradaServidor): EntradaServidor {
  const nombre = entrada.nombre.trim();
  const telefono = entrada.telefono?.trim() ?? "";
  const activo = entrada.activo ?? true;

  if (!telefono) {
    return { nombre, activo };
  }

  return { nombre, telefono, activo };
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorConocido(dato: unknown): ErrorServidor | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpoRespuesta = dato as { ok?: unknown; error?: unknown };

  if (cuerpoRespuesta.ok === false && esErrorServidor(cuerpoRespuesta.error)) {
    return cuerpoRespuesta.error;
  }

  return null;
}

type Lectura =
  | { ok: false; error: ErrorServidor }
  | { response: Response; dato: unknown };

async function pedir(input: string, init?: RequestInit): Promise<Lectura> {
  try {
    const response = await fetch(input, { ...init, cache: "no-store" });
    const dato = await leerJson(response);

    if (dato === null) {
      return FALLO;
    }

    return { response, dato };
  } catch {
    return FALLO;
  }
}

export async function listarServidores(): Promise<ResultadoServidores> {
  const resultado = await pedir("/api/servidores");

  if ("error" in resultado) {
    return resultado;
  }

  const { response, dato } = resultado;
  const error = errorConocido(dato);

  if (error) {
    return { ok: false, error };
  }

  if (
    response.ok &&
    dato &&
    typeof dato === "object" &&
    (dato as { ok?: unknown }).ok === true &&
    Array.isArray((dato as { servidores?: unknown }).servidores) &&
    (dato as { servidores: unknown[] }).servidores.every(esServidor)
  ) {
    return {
      ok: true,
      servidores: (dato as { servidores: Servidor[] }).servidores,
    };
  }

  return FALLO;
}

export async function crearServidor(
  entrada: EntradaServidor,
): Promise<ResultadoServidor> {
  return enviar("/api/servidores", "POST", entrada);
}

export async function actualizarServidor(
  id: string,
  entrada: EntradaServidor,
): Promise<ResultadoServidor> {
  return enviar(`/api/servidores/${id}`, "PATCH", entrada);
}

export async function borrarServidor(
  id: string,
): Promise<ResultadoBorradoServidor> {
  const resultado = await pedir(`/api/servidores/${id}`, { method: "DELETE" });

  if ("error" in resultado) {
    return resultado;
  }

  const { response, dato } = resultado;
  const error = errorConocido(dato);

  if (error) {
    return { ok: false, error };
  }

  if (
    response.ok &&
    dato &&
    typeof dato === "object" &&
    (dato as { ok?: unknown }).ok === true
  ) {
    return { ok: true };
  }

  return FALLO;
}

async function enviar(
  ruta: string,
  method: "POST" | "PATCH",
  entrada: EntradaServidor,
): Promise<ResultadoServidor> {
  const resultado = await pedir(ruta, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuerpo(entrada)),
  });

  if ("error" in resultado) {
    return resultado;
  }

  const { response, dato } = resultado;
  const error = errorConocido(dato);

  if (error) {
    return { ok: false, error };
  }

  if (
    response.ok &&
    dato &&
    typeof dato === "object" &&
    (dato as { ok?: unknown }).ok === true &&
    esServidor((dato as { servidor?: unknown }).servidor)
  ) {
    return { ok: true, servidor: (dato as { servidor: Servidor }).servidor };
  }

  return FALLO;
}
