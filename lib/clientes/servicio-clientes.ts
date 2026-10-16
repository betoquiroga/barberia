import type {
  Cliente,
  EntradaCliente,
  ErrorCliente,
  ResultadoBorrado,
  ResultadoCliente,
  ResultadoClientes,
} from "@/types/cliente";

const ERRORES: ErrorCliente[] = [
  "entorno_incompleto",
  "entrada_invalida",
  "correo_duplicado",
  "no_encontrado",
  "supabase_inalcanzable",
];

const FALLO: { ok: false; error: ErrorCliente } = {
  ok: false,
  error: "supabase_inalcanzable",
};

function esErrorCliente(valor: unknown): valor is ErrorCliente {
  return typeof valor === "string" && ERRORES.includes(valor as ErrorCliente);
}

function esCliente(valor: unknown): valor is Cliente {
  if (!valor || typeof valor !== "object") {
    return false;
  }

  const cliente = valor as Cliente;

  return (
    typeof cliente.id === "string" &&
    typeof cliente.nombre === "string" &&
    typeof cliente.correo === "string" &&
    typeof cliente.telefono === "string" &&
    typeof cliente.detalle === "string" &&
    typeof cliente.creado_en === "string" &&
    typeof cliente.actualizado_en === "string"
  );
}

function cuerpo(entrada: EntradaCliente): EntradaCliente {
  const nombre = entrada.nombre.trim();
  const correo = entrada.correo.trim();
  const telefono = entrada.telefono.trim();
  const detalle = entrada.detalle?.trim() ?? "";

  if (!detalle) {
    return { nombre, correo, telefono };
  }

  return { nombre, correo, telefono, detalle };
}

async function leerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function errorConocido(dato: unknown): ErrorCliente | null {
  if (!dato || typeof dato !== "object") {
    return null;
  }

  const cuerpo = dato as { ok?: unknown; error?: unknown };

  if (cuerpo.ok === false && esErrorCliente(cuerpo.error)) {
    return cuerpo.error;
  }

  return null;
}

type Lectura =
  | { ok: false; error: ErrorCliente }
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

export async function listarClientes(): Promise<ResultadoClientes> {
  const resultado = await pedir("/api/clientes");

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
    Array.isArray((dato as { clientes?: unknown }).clientes) &&
    (dato as { clientes: unknown[] }).clientes.every(esCliente)
  ) {
    return {
      ok: true,
      clientes: (dato as { clientes: Cliente[] }).clientes,
    };
  }

  return FALLO;
}

export async function crearCliente(
  entrada: EntradaCliente,
): Promise<ResultadoCliente> {
  return enviar("/api/clientes", "POST", entrada);
}

export async function actualizarCliente(
  id: string,
  entrada: EntradaCliente,
): Promise<ResultadoCliente> {
  return enviar(`/api/clientes/${id}`, "PATCH", entrada);
}

export async function borrarCliente(id: string): Promise<ResultadoBorrado> {
  const resultado = await pedir(`/api/clientes/${id}`, { method: "DELETE" });

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
  entrada: EntradaCliente,
): Promise<ResultadoCliente> {
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
    esCliente((dato as { cliente?: unknown }).cliente)
  ) {
    return { ok: true, cliente: (dato as { cliente: Cliente }).cliente };
  }

  return FALLO;
}
