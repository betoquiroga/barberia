import { NombresServidores } from "@/components/servicios-ofrecidos/nombres-servidores";
import { presentarPesos } from "@/lib/landing/presentar-pesos";
import type { ServicioOfrecido } from "@/types/servicio-ofrecido";

type FilaServicioProps = {
  servicio: ServicioOfrecido;
  editando: boolean;
  borrando: boolean;
  onEditar: (servicio: ServicioOfrecido) => void;
  onBorrar: (servicio: ServicioOfrecido) => void;
};

export function FilaServicio({
  servicio,
  editando,
  borrando,
  onEditar,
  onBorrar,
}: FilaServicioProps) {
  return (
    <li
      className={`flex flex-col gap-1 border-b border-zinc-800 py-3 ${editando ? "ring-1 ring-zinc-300" : ""}`}
    >
      <p className="font-bold">{servicio.nombre}</p>
      <p className="text-zinc-400">Precio: {presentarPesos(servicio.precio_pesos)}</p>
      <p className="text-zinc-400">Costo: {presentarPesos(servicio.costo_pesos)}</p>
      <NombresServidores servidores={servicio.servidores} />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onEditar(servicio)}
        >
          Editar
        </button>
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onBorrar(servicio)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
