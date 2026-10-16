"use client";

import { useEffect, useState } from "react";
import { MensajeDesempeno } from "@/components/desempeno/mensaje-desempeno";
import { ResumenMes } from "@/components/desempeno/resumen-mes";
import { SelectorMes } from "@/components/desempeno/selector-mes";
import { TablaDesempeno } from "@/components/desempeno/tabla-desempeno";
import { mensajeErrorDesempeno } from "@/lib/desempeno/mensajes-error-desempeno";
import { resumirFilas } from "@/lib/desempeno/resumir-filas";
import { listarDesempeno } from "@/lib/desempeno/servicio-desempeno";
import type { ErrorDesempeno, FilaDesempeno } from "@/types/desempeno";

type PanelDesempenoProps = {
  mes?: string;
};

export function PanelDesempeno({ mes }: PanelDesempenoProps) {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorDesempeno | null>(null);
  const [mesConfirmado, setMesConfirmado] = useState<string | undefined>();
  const [filas, setFilas] = useState<FilaDesempeno[]>([]);

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      setCargando(true);
      const resultado = await listarDesempeno(mes);

      if (!vigente) {
        return;
      }

      if (!resultado.ok) {
        setError(resultado.error);
        setFilas([]);
        setMesConfirmado(undefined);
        setCargando(false);
        return;
      }

      setError(null);
      setMesConfirmado(resultado.mes);
      setFilas(resultado.filas);
      setCargando(false);
    }

    void cargar();

    return () => {
      vigente = false;
    };
  }, [mes]);

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Desempeño</h1>
      {cargando ? <p>Cargando desempeño…</p> : null}
      {!cargando && error ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeDesempeno texto={mensajeErrorDesempeno(error)} />
          <button
            type="button"
            className="rounded border border-zinc-700 px-3 py-1 text-sm"
            onClick={() => {
              setCargando(true);
              void listarDesempeno(mes).then((resultado) => {
                if (!resultado.ok) {
                  setError(resultado.error);
                  setFilas([]);
                  setMesConfirmado(undefined);
                  setCargando(false);
                  return;
                }

                setError(null);
                setMesConfirmado(resultado.mes);
                setFilas(resultado.filas);
                setCargando(false);
              });
            }}
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
            ruta={(valor) => `/desempeno?mes=${valor}`}
          />
          <ResumenMes resumen={resumirFilas(filas)} />
          <TablaDesempeno filas={filas} mes={mesConfirmado ?? ""} />
        </>
      ) : null}
    </section>
  );
}
