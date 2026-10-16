import type { EntradaCliente } from "@/types/cliente";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^[\d\s+-]+$/;

export function validarCliente(cuerpo: unknown): EntradaCliente | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const nombre = textoRecortado(campos.nombre);
  const correo = textoRecortado(campos.correo)?.toLowerCase();
  const telefono = textoRecortado(campos.telefono);
  const detalle = normalizarDetalle(campos.detalle);

  if (!nombre || nombre.length > 120) {
    return null;
  }

  if (!correo || correo.length > 254 || !CORREO.test(correo)) {
    return null;
  }

  if (!telefonoValido(telefono)) {
    return null;
  }

  if (detalle === null || detalle.length > 500) {
    return null;
  }

  return { nombre, correo, telefono, detalle };
}

function textoRecortado(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  return valor.trim();
}

function normalizarDetalle(valor: unknown): string | null {
  if (valor === undefined || valor === "") {
    return "";
  }

  return textoRecortado(valor);
}

function telefonoValido(telefono: string | null): telefono is string {
  if (!telefono || telefono.length < 7 || telefono.length > 20) {
    return false;
  }

  if (!TELEFONO.test(telefono)) {
    return false;
  }

  const digitos = telefono.replace(/\D/g, "");

  return digitos.length >= 7;
}
