"use client";

import { useEffect, useState } from "react";
import { DiagramaDias } from "@/components/citas/diagrama-dias";
import { DiagramaHoras } from "@/components/citas/diagrama-horas";
import { MensajeCitas } from "@/components/citas/mensaje-citas";
import { SelectorMes } from "@/components/desempeno/selector-mes";
import { mensajeErrorDesempeno } from "@/lib/desempeno/mensajes-error-desempeno";
import { leerDiagramaCitasCliente } from "@/lib/citas/servicio-citas-diagrama";
import { claseBotonSecundario } from "@/lib/ui/clases";
import type {
  DiaCitas,
  ErrorCitasDiagrama,
  HoraCitas,
  HorarioPico,
} from "@/types/citas-diagrama";

type PanelCitasProps = {
  mes?: string;
};

export function PanelCitas({ mes }: PanelCitasProps) {
  const [cargando, setCargando] = useState(true);
  const [intento, setIntento] = useState(0);
  const [error, setError] = useState<ErrorCitasDiagrama | null>(null);
  const [mesConfirmado, setMesConfirmado] = useState<string | undefined>();
  const [dias, setDias] = useState<DiaCitas[]>([]);
  const [horas, setHoras] = useState<HoraCitas[]>([]);
  const [horarioPico, setHorarioPico] = useState<HorarioPico | null>(null);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      const resultado = await leerDiagramaCitasCliente(mes);

      if (!vigente) {
        return;
      }

      if (!resultado.ok) {
        setError(resultado.error);
        setDias([]);
        setHoras([]);
        setHorarioPico(null);
        setMesConfirmado(undefined);
        setCargando(false);
        return;
      }

      setError(null);
      setMesConfirmado(resultado.mes);
      setDias(resultado.dias);
      setHoras(resultado.horas);
      setHorarioPico(resultado.horario_pico);
      setCargando(false);
    }

    void cargar();

    return () => {
      vigente = false;
    };
  }, [mes, intento]);

  const vacio =
    dias.every((dia) => dia.cantidad === 0) && horarioPico === null;

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Citas</h1>
      {cargando ? <p>Cargando citas…</p> : null}
      {!cargando && error ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeCitas texto={mensajeErrorDesempeno(error)} />
          <button
            type="button"
            className={claseBotonSecundario}
            onClick={() => setIntento((valor) => valor + 1)}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!cargando && !error ? (
        <>
          <SelectorMes
            mesConfirmado={mesConfirmado}
            mesConsulta={mes}
            ruta={(valor) => `/citas?mes=${valor}`}
          />
          {vacio ? (
            <p>No hay citas en este mes.</p>
          ) : (
            <>
              <DiagramaDias dias={dias} />
              <DiagramaHoras horas={horas} horarioPico={horarioPico} />
            </>
          )}
        </>
      ) : null}
    </section>
  );
}
