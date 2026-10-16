import type { Servicio } from "@/types/servicio";
import type {
  ErroresReserva,
  ResultadoValidacionReserva,
  ValoresReserva,
} from "@/types/reserva";

const telefonoPermitido = /^[0-9+\- ]+$/;
const fechaIso = /^(\d{4})-(\d{2})-(\d{2})$/;
const hora24 = /^([01]\d|2[0-3]):([0-5]\d)$/;

function hoyLocal(): string {
  const ahora = new Date();
  const mes = String(ahora.getMonth() + 1).padStart(2, "0");
  const dia = String(ahora.getDate()).padStart(2, "0");

  return `${ahora.getFullYear()}-${mes}-${dia}`;
}

function fechaValida(fecha: string): boolean {
  const coincidencia = fechaIso.exec(fecha);

  if (!coincidencia) {
    return false;
  }

  const anio = Number(coincidencia[1]);
  const mes = Number(coincidencia[2]);
  const dia = Number(coincidencia[3]);
  const interpretada = new Date(anio, mes - 1, dia);

  return (
    interpretada.getFullYear() === anio &&
    interpretada.getMonth() === mes - 1 &&
    interpretada.getDate() === dia &&
    fecha >= hoyLocal()
  );
}

export function validarReserva(
  valores: ValoresReserva,
  servicios: Servicio[],
): ResultadoValidacionReserva {
  const nombre = valores.nombre.trim();
  const telefono = valores.telefono.trim();
  const nota = valores.nota.trim();
  const errores: ErroresReserva = {};

  if (nombre.length < 1 || nombre.length > 120) {
    errores.nombre = "Escribe un nombre de 1 a 120 caracteres.";
  }

  if (
    telefono.length < 7 ||
    telefono.length > 20 ||
    !telefonoPermitido.test(telefono)
  ) {
    errores.telefono =
      "Escribe un teléfono de 7 a 20 caracteres, solo con dígitos, espacios, + o -.";
  }

  if (!servicios.some((servicio) => servicio.id === valores.servicioId)) {
    errores.servicioId = "Elige un servicio.";
  }

  if (!fechaValida(valores.fecha)) {
    errores.fecha = "Elige una fecha de hoy en adelante, con formato AAAA-MM-DD.";
  }

  if (!hora24.test(valores.hora)) {
    errores.hora = "Elige una hora entre 00:00 y 23:59.";
  }

  if (nota.length > 300) {
    errores.nota = "La nota admite como máximo 300 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  return { ok: true };
}
