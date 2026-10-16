import type { MesDesempeno } from "@/types/desempeno";

const MES = /^\d{4}-(0[1-9]|1[0-2])$/;
const ZONA = "America/Lima";
const DESPLAZAMIENTO_LIMA = "-05:00";

export type IntervaloMes = {
  mes: MesDesempeno;
  desde: string;
  hasta: string;
};

export type ResultadoMes =
  | { ok: true; intervalo: IntervaloMes }
  | { ok: false; error: "mes_invalido" };

export function validarMes(valor: string | null | undefined): ResultadoMes {
  const texto = valor?.trim() ?? "";
  const mes = texto === "" ? mesActual() : texto;

  if (!MES.test(mes) || mes === "9999-12") {
    return { ok: false, error: "mes_invalido" };
  }

  const [anioTexto, mesTexto] = mes.split("-");
  const anio = Number(anioTexto);
  const numeroMes = Number(mesTexto);
  const siguienteAnio = numeroMes === 12 ? anio + 1 : anio;
  const siguienteMes = numeroMes === 12 ? 1 : numeroMes + 1;

  return {
    ok: true,
    intervalo: {
      mes,
      desde: isoLima(anio, numeroMes),
      hasta: isoLima(siguienteAnio, siguienteMes),
    },
  };
}

function mesActual(): MesDesempeno {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: ZONA,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const anio = partes.find((parte) => parte.type === "year")?.value ?? "";
  const mes = partes.find((parte) => parte.type === "month")?.value ?? "";

  return `${anio}-${mes}`;
}

function isoLima(anio: number, mes: number): string {
  const mesTexto = String(mes).padStart(2, "0");

  return `${anio}-${mesTexto}-01T00:00:00${DESPLAZAMIENTO_LIMA}`;
}
