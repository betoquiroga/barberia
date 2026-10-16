import type { RespuestaMcp } from "../types/mcp-respuesta.ts";

const BASE = (process.env.BARBERIA_API_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

export async function llamarApi(opciones: {
  metodo: "GET" | "POST" | "PATCH" | "DELETE";
  ruta: string;
  consulta?: Record<string, string | undefined>;
  cuerpo?: unknown;
}): Promise<RespuestaMcp> {
  if (!opciones.ruta.startsWith("/api/")) {
    return { ok: false, error: "api_inalcanzable", detalle: "ruta invalida" };
  }

  let url: URL;
  try {
    url = new URL(`${BASE}${opciones.ruta}`);
  } catch {
    return { ok: false, error: "api_inalcanzable", detalle: "url invalida" };
  }

  if (opciones.consulta) {
    for (const [clave, valor] of Object.entries(opciones.consulta)) {
      if (valor !== undefined) {
        url.searchParams.set(clave, valor);
      }
    }
  }

  try {
    const respuesta = await fetch(url, {
      method: opciones.metodo,
      headers:
        opciones.cuerpo !== undefined
          ? { "Content-Type": "application/json" }
          : undefined,
      body:
        opciones.cuerpo !== undefined
          ? JSON.stringify(opciones.cuerpo)
          : undefined,
      signal: AbortSignal.timeout(10_000),
    });

    const texto = await respuesta.text();
    let cuerpo: unknown;
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      return {
        ok: false,
        error: "api_inalcanzable",
        detalle: "respuesta no json",
      };
    }

    if (typeof cuerpo !== "object" || cuerpo === null) {
      return {
        ok: false,
        error: "api_inalcanzable",
        detalle: "respuesta no es objeto",
      };
    }

    return { ok: true, status: respuesta.status, cuerpo };
  } catch (error) {
    const detalle = error instanceof Error ? error.message : "error de red";
    return { ok: false, error: "api_inalcanzable", detalle };
  }
}

export function textoMcp(respuesta: RespuestaMcp) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(respuesta) }],
    isError: !respuesta.ok || respuesta.status >= 400,
  };
}
