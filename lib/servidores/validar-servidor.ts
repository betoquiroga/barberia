import type { EntradaServidor } from "@/types/servidor";

const TELEFONO = /^[\d\s+-]+$/;

export function validarServidor(cuerpo: unknown): EntradaServidor | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const nombre = textoRecortado(campos.nombre);
  const telefono = normalizarTelefono(campos.telefono);
  const activo = normalizarActivo(campos.activo);

  if (!nombre || nombre.length > 120) {
    return null;
  }

  if (telefono === null) {
    return null;
  }

  if (activo === null) {
    return null;
  }

  return { nombre, telefono, activo };
}

function textoRecortado(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  return valor.trim();
}

function normalizarTelefono(valor: unknown): string | null {
  if (valor === undefined || valor === "") {
    return "";
  }

  const telefono = textoRecortado(valor);

  if (!telefono || telefono.length > 20 || !TELEFONO.test(telefono)) {
    return null;
  }

  const digitos = telefono.replace(/\D/g, "");

  if (digitos.length < 7) {
    return null;
  }

  return telefono;
}

function normalizarActivo(valor: unknown): boolean | null {
  if (valor === undefined) {
    return true;
  }

  if (typeof valor !== "boolean") {
    return null;
  }

  return valor;
}
