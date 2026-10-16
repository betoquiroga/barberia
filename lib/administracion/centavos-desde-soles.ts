export function centavosDesdeSoles(texto: string): number | null {
  const coincidencia = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(texto.trim());

  if (!coincidencia) {
    return null;
  }

  const decimales = (coincidencia[2] ?? "").padEnd(2, "0");
  const centavos = Number(`${coincidencia[1]}${decimales}`);

  if (!Number.isSafeInteger(centavos) || centavos <= 0) {
    return null;
  }

  return centavos;
}
