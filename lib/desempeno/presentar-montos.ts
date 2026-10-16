const SOLES = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function presentarSoles(centavos: number): string {
  return SOLES.format(centavos / 100);
}
