const IDS = new Set(["corte-clasico", "arreglo-barba", "corte-y-barba"]);

export function validarPrecio(
  id: string,
  cuerpo: unknown,
): { id: string; precio_centavos: number } | null {
  if (!IDS.has(id)) {
    return null;
  }

  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const claves = Object.keys(campos);

  if (claves.length !== 1 || claves[0] !== "precio_centavos") {
    return null;
  }

  const precio = campos.precio_centavos;

  if (typeof precio !== "number" || !Number.isInteger(precio) || precio <= 0) {
    return null;
  }

  return { id, precio_centavos: precio };
}
