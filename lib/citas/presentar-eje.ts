const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function presentarFecha(fecha: string): string {
  const partes = fecha.split("-");
  const mes = Number(partes[1]);
  const dia = Number(partes[2]);
  const nombre = MESES[mes - 1] ?? partes[1];

  return `${dia} ${nombre}`;
}

export function presentarHora(hora: string): string {
  return `${hora.padStart(2, "0")}:00`;
}
