import { esServidor } from "@/lib/servidores/servicio-servidores";
import type {
  EntradaServicioOfrecido,
  ErrorServicioOfrecido,
  ResultadoBorradoServicioOfrecido,
  ResultadoServicioOfrecido,
  ResultadoServiciosOfrecidos,
  ServicioOfrecido,
} from "@/types/servicio-ofrecido";

const ERRORES: ErrorServicioOfrecido[] = [
  "entorno_incompleto",
  "entrada_invalida",
  "nombre_duplicado",
  "servidor_inexistente",
  "no_encontrado",
  "supabase_inalcanzable",
];

const FALLO: { ok: false; error: ErrorServicioOfrecido } = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esErrorServicio(valor: unknown): valor is ErrorServicioOfrecido {
  return (
    typeof valor === "string" && ERRORES.includes(valor as ErrorServicioOfrecido)
  );
}

function esServicio(valor: unknown): valor is ServicioOfrecido {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const servicio = valor as ServicioOfrecido;

  return (
    typeof servicio.id === "string" &&
    typeof servicio.nombre === "string" &&
    typeof servicio.precio_pesos === "number" &&
    typeof servicio.costo_pesos === "number" &&
    Array.isArray(servicio.servidores) &&
    servicio.servidores.every(esServidor) &&
    typeof servicio.creado_en === "string" &&
    typeof servicio.actualizado_en === "string"
  );
}

function cuerpo(entrada: EntradaServicioOfrecido): EntradaServicioOfrecido {
  return {
    nombre: entrada.nombre.trim(),
    precio_pesos: Number(entrada.precio_pesos),
    costo_pesos: Number(entrada.costo_pesos),
    servidor_ids: entrada.servidor_ids ?? [],
  };
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorConocido(dato: unknown): ErrorServicioOfrecido | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpoRespuesta = dato as { ok?: unknown; error?: unknown };

  if (cuerpoRespuesta.ok === false && esErrorServicio(cuerpoRespuesta.error)) {
    return cuerpoRespuesta.error;
  }

  return null;
}

type Lectura =
  | { ok: false; error: ErrorServicioOfrecido }
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

export async function listarServiciosOfrecidos(): Promise<ResultadoServiciosOfrecidos> {
  const resultado = await pedir("/api/servicios-ofrecidos");

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
    Array.isArray((dato as { servicios?: unknown }).servicios) &&
    (dato as { servicios: unknown[] }).servicios.every(esServicio)
  ) {
    return {
      ok: true,
      servicios: (dato as { servicios: ServicioOfrecido[] }).servicios,
    };
  }

  return FALLO;
}

export async function crearServicioOfrecido(
  entrada: EntradaServicioOfrecido,
): Promise<ResultadoServicioOfrecido> {
  return enviar("/api/servicios-ofrecidos", "POST", entrada);
}

export async function actualizarServicioOfrecido(
  id: string,
  entrada: EntradaServicioOfrecido,
): Promise<ResultadoServicioOfrecido> {
  return enviar(`/api/servicios-ofrecidos/${id}`, "PATCH", entrada);
}

export async function borrarServicioOfrecido(
  id: string,
): Promise<ResultadoBorradoServicioOfrecido> {
  const resultado = await pedir(`/api/servicios-ofrecidos/${id}`, {
    method: "DELETE",
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
    (dato as { ok?: unknown }).ok === true
  ) {
    return { ok: true };
  }

  return FALLO;
}

async function enviar(
  ruta: string,
  method: "POST" | "PATCH",
  entrada: EntradaServicioOfrecido,
): Promise<ResultadoServicioOfrecido> {
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
    esServicio((dato as { servicio?: unknown }).servicio)
  ) {
    return {
      ok: true,
      servicio: (dato as { servicio: ServicioOfrecido }).servicio,
    };
  }

  return FALLO;
}
