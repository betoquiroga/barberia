import type { EntradaServicioOfrecido } from "@/types/servicio-ofrecido";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const TOPE_PESOS = 100_000_000;

export function validarServicioOfrecido(
  cuerpo: unknown,
): EntradaServicioOfrecido | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const nombre = textoRecortado(campos.nombre);
  const precio = enteroPositivo(campos.precio_pesos);
  const costo = enteroPositivo(campos.costo_pesos);
  const servidorIds = normalizarServidorIds(campos.servidor_ids);

  if (!nombre || nombre.length > 80) {
    return null;
  }

  if (precio === null || costo === null || precio < costo) {
    return null;
  }

  if (!servidorIds) {
    return null;
  }

  return {
    nombre,
    precio_pesos: precio,
    costo_pesos: costo,
    servidor_ids: servidorIds,
  };
}

function textoRecortado(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  return valor.trim();
}

function enteroPositivo(valor: unknown): number | null {
  if (typeof valor !== "number" || !Number.isInteger(valor)) {
    return null;
  }

  if (valor <= 0 || valor > TOPE_PESOS) {
    return null;
  }

  return valor;
}

function normalizarServidorIds(valor: unknown): string[] | null {
  if (valor === undefined) {
    return [];
  }

  if (!Array.isArray(valor)) {
    return null;
  }

  const ids: string[] = [];

  for (const item of valor) {
    if (typeof item !== "string" || !UUID.test(item)) {
      return null;
    }

    const id = item.toLowerCase();

    if (ids.includes(id)) {
      return null;
    }

    ids.push(id);
  }

  return ids;
}
