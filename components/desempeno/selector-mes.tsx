"use client";

import { useRouter } from "next/navigation";
import { mesAnterior, mesSiguiente } from "@/lib/desempeno/mover-mes";
import { claseBotonSecundario, claseCampo } from "@/lib/ui/clases";

const MES = /^\d{4}-(0[1-9]|1[0-2])$/;

type SelectorMesProps = {
  mesConfirmado?: string;
  mesConsulta?: string;
  ruta: (mes: string) => string;
};

export function SelectorMes({
  mesConfirmado,
  mesConsulta,
  ruta,
}: SelectorMesProps) {
  const router = useRouter();
  const anterior = mesConfirmado ? mesAnterior(mesConfirmado) : null;
  const siguiente = mesConfirmado ? mesSiguiente(mesConfirmado) : null;

  function ir(mes: string) {
    router.replace(ruta(mes));
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1 text-sm">
        Mes
        <input
          type="month"
          className={claseCampo}
          value={mesConfirmado ?? mesConsulta ?? ""}
          onChange={(evento) => {
            const valor = evento.target.value;

            if (MES.test(valor)) {
              ir(valor);
            }
          }}
        />
      </label>
      <button
        type="button"
        className={claseBotonSecundario}
        disabled={!anterior}
        onClick={() => {
          if (anterior) {
            ir(anterior);
          }
        }}
      >
        Mes anterior
      </button>
      <button
        type="button"
        className={claseBotonSecundario}
        disabled={!siguiente}
        onClick={() => {
          if (siguiente) {
            ir(siguiente);
          }
        }}
      >
        Mes siguiente
      </button>
    </div>
  );
}
