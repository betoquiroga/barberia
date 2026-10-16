import type { EntradaBarbero } from "@/types/barbero";

export function validarBarbero(cuerpo: unknown): EntradaBarbero | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;

  if (typeof campos.nombre !== "string") {
    return null;
  }

  const nombre = campos.nombre.trim();

  if (nombre.length < 1 || nombre.length > 120) {
    return null;
  }

  if (campos.activo === undefined) {
    return { nombre, activo: true };
  }

  if (typeof campos.activo !== "boolean") {
    return null;
  }

  return { nombre, activo: campos.activo };
}
