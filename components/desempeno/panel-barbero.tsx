"use client";

import { useEffect, useState } from "react";
import { FichaBarbero } from "@/components/desempeno/ficha-barbero";
import { MensajeDesempeno } from "@/components/desempeno/mensaje-desempeno";
import { SelectorMes } from "@/components/desempeno/selector-mes";
import { mensajeErrorDesempeno } from "@/lib/desempeno/mensajes-error-desempeno";
import { leerDesempenoBarbero } from "@/lib/desempeno/servicio-desempeno";
import type { ErrorDesempeno, FilaDesempeno } from "@/types/desempeno";

type PanelBarberoProps = {
  barberoId: string;
  mes?: string;
};

export function PanelBarbero({ barberoId, mes }: PanelBarberoProps) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorDesempeno | null>(null);
  const [mesConfirmado, setMesConfirmado] = useState<string | undefined>();
  const [fila, setFila] = useState<FilaDesempeno | null>(null);
  const vuelta = mes ? `/desempeno?mes=${mes}` : "/desempeno";

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      const resultado = await leerDesempenoBarbero(barberoId, mes);

      if (!vigente) {
        return;
      }

      if (!resultado.ok) {
        setError(resultado.error);
        setFila(null);
        setMesConfirmado(undefined);
        setCargando(false);
        return;
      }

      setError(null);
      setMesConfirmado(resultado.mes);
      setFila(resultado.fila);
      setCargando(false);
    }

    void cargar();

    return () => {
      vigente = false;
    };
  }, [barberoId, mes]);

  function reintentar() {
    setCargando(true);
    void leerDesempenoBarbero(barberoId, mes).then((resultado) => {
      if (!resultado.ok) {
        setError(resultado.error);
        setFila(null);
        setMesConfirmado(undefined);
        setCargando(false);
        return;
      }

      setError(null);
      setMesConfirmado(resultado.mes);
      setFila(resultado.fila);
      setCargando(false);
    });
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Desempeño del barbero</h1>
      {cargando ? <p>Cargando desempeño…</p> : null}
      {!cargando && error ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeDesempeno texto={mensajeErrorDesempeno(error)} />
          {error === "no_encontrado" ? (
            <a className="text-sm hover:text-zinc-300" href={vuelta}>
              Volver al mes
            </a>
          ) : null}
          <button
            type="button"
            className="rounded border border-zinc-700 px-3 py-1 text-sm"
            onClick={reintentar}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!cargando && !error && fila ? (
        <>
          <SelectorMes
            mesConfirmado={mesConfirmado}
            mesConsulta={mes}
            ruta={(valor) => `/desempeno/${barberoId}?mes=${valor}`}
          />
          <FichaBarbero fila={fila} mes={mesConfirmado} />
        </>
      ) : null}
    </section>
  );
}
