import type {
  DiaCitas,
  HoraCitas,
  HorarioPico,
} from "@/types/citas-diagrama";

const ZONA = "America/Lima";

const formatoFecha = new Intl.DateTimeFormat("en-CA", {
  timeZone: ZONA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const formatoHora = new Intl.DateTimeFormat("en-US", {
  timeZone: ZONA,
  hour: "2-digit",
  hourCycle: "h23",
});

export type FilaCitaDiagrama = {
  inicia_en: string;
  estado: string;
};

export type DiagramaAgrupado = {
  dias: DiaCitas[];
  horas: HoraCitas[];
  horario_pico: HorarioPico | null;
};

export function agruparCitas(
  filas: FilaCitaDiagrama[],
  mes: string,
): DiagramaAgrupado {
  const porDia = new Map<string, number>();
  const porHora = new Map<string, number>();

  for (const fila of filas) {
    if (fila.estado !== "programada" && fila.estado !== "completada") {
      continue;
    }

    const instante = new Date(fila.inicia_en);

    if (Number.isNaN(instante.getTime())) {
      continue;
    }

    const fecha = formatoFecha.format(instante);

    if (!fecha.startsWith(`${mes}-`)) {
      continue;
    }

    const hora = horaLima(instante);

    porDia.set(fecha, (porDia.get(fecha) ?? 0) + 1);
    porHora.set(hora, (porHora.get(hora) ?? 0) + 1);
  }

  const horas = [...porHora.entries()]
    .filter(([, cantidad]) => cantidad > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([hora, cantidad]) => ({ hora, cantidad }));

  return {
    dias: diasDelMes(mes, porDia),
    horas,
    horario_pico: horarioPico(horas),
  };
}

function horaLima(instante: Date): string {
  const parte = formatoHora
    .formatToParts(instante)
    .find((candidata) => candidata.type === "hour")?.value;

  const hora = parte === "24" ? "00" : (parte ?? "00");

  return hora.padStart(2, "0");
}

function diasDelMes(mes: string, porDia: Map<string, number>): DiaCitas[] {
  const [anio, numero] = mes.split("-").map(Number);
  const ultimo = new Date(Date.UTC(anio, numero, 0)).getUTCDate();
  const dias: DiaCitas[] = [];

  for (let dia = 1; dia <= ultimo; dia += 1) {
    const fecha = `${mes}-${String(dia).padStart(2, "0")}`;
    dias.push({ fecha, cantidad: porDia.get(fecha) ?? 0 });
  }

  return dias;
}

function horarioPico(horas: HoraCitas[]): HorarioPico | null {
  let pico: HorarioPico | null = null;

  for (const hora of horas) {
    if (!pico || hora.cantidad > pico.cantidad) {
      pico = { hora: hora.hora, cantidad: hora.cantidad };
    }
  }

  return pico;
}
