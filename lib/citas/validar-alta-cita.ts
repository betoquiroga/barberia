import type { EntradaAltaCita } from "@/types/cita-alta";

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO = /^[\d\s+-]+$/;
const FECHA = /^(\d{4})-(\d{2})-(\d{2})$/;
const HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const SERVICIOS = new Set(["corte-clasico", "arreglo-barba", "corte-y-barba"]);

export function validarAltaCita(cuerpo: unknown): EntradaAltaCita | null {
  if (typeof cuerpo !== "object" || cuerpo === null || Array.isArray(cuerpo)) {
    return null;
  }

  const campos = cuerpo as Record<string, unknown>;
  const nombre = textoRecortado(campos.nombre);
  const correo = textoRecortado(campos.correo)?.toLowerCase();
  const telefono = textoRecortado(campos.telefono);
  const servicioId = textoRecortado(campos.servicioId);
  const fecha = textoRecortado(campos.fecha);
  const hora = textoRecortado(campos.hora);
  const nota = normalizarNota(campos.nota);

  if (!nombre || nombre.length > 120) {
    return null;
  }

  if (!correo || correo.length > 254 || !CORREO.test(correo)) {
    return null;
  }

  if (!telefono || telefono.length < 7 || telefono.length > 20 || !TELEFONO.test(telefono)) {
    return null;
  }

  if (!servicioId || !SERVICIOS.has(servicioId)) {
    return null;
  }

  if (!fecha || !fechaValida(fecha)) {
    return null;
  }

  if (!hora || !HORA.test(hora)) {
    return null;
  }

  if (nota === null || nota.length > 300) {
    return null;
  }

  return { nombre, correo, telefono, servicioId, fecha, hora, nota };
}

function textoRecortado(valor: unknown): string | null {
  if (typeof valor !== "string") {
    return null;
  }

  return valor.trim();
}

function normalizarNota(valor: unknown): string | null {
  if (valor === undefined || valor === null) {
    return "";
  }

  return textoRecortado(valor);
}

function fechaValida(fecha: string): boolean {
  const partes = FECHA.exec(fecha);

  if (!partes) {
    return false;
  }

  const anio = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const calendario = new Date(Date.UTC(anio, mes - 1, dia));

  if (
    calendario.getUTCFullYear() !== anio ||
    calendario.getUTCMonth() !== mes - 1 ||
    calendario.getUTCDate() !== dia
  ) {
    return false;
  }

  return fecha >= hoyLima();
}

function hoyLima(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
