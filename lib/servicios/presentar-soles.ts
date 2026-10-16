const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function presentarSoles(centavos: number): string {
  return formatoSoles.format(centavos / 100);
}
