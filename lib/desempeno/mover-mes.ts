const MES = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function mesAnterior(mes: string): string | null {
  const partes = leer(mes);

  if (!partes || (partes.anio === 1 && partes.numero === 1)) {
    return null;
  }

  if (partes.numero === 1) {
    return formatear(partes.anio - 1, 12);
  }

  return formatear(partes.anio, partes.numero - 1);
}

export function mesSiguiente(mes: string): string | null {
  const partes = leer(mes);

  if (!partes || (partes.anio === 9999 && partes.numero === 12)) {
    return null;
  }

  if (partes.numero === 12) {
    return formatear(partes.anio + 1, 1);
  }

  return formatear(partes.anio, partes.numero + 1);
}

function leer(mes: string): { anio: number; numero: number } | null {
  const coincidencia = MES.exec(mes);

  if (!coincidencia) {
    return null;
  }

  return {
    anio: Number(coincidencia[1]),
    numero: Number(coincidencia[2]),
  };
}

function formatear(anio: number, numero: number): string {
  return `${String(anio).padStart(4, "0")}-${String(numero).padStart(2, "0")}`;
}
