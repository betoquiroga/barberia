const formatoPesos = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function presentarPesos(pesos: number): string {
  return formatoPesos.format(pesos);
}
