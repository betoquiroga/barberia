import type { Servidor } from "@/types/servidor";

type FilaServidorProps = {
  servidor: Servidor;
  editando: boolean;
  borrando: boolean;
  onEditar: (servidor: Servidor) => void;
  onBorrar: (servidor: Servidor) => void;
};

export function FilaServidor({
  servidor,
  editando,
  borrando,
  onEditar,
  onBorrar,
}: FilaServidorProps) {
  const telefono = servidor.telefono === "" ? "Sin teléfono" : servidor.telefono;

  return (
    <li
      className={`flex flex-col gap-1 border-b border-zinc-800 py-3 ${editando ? "ring-1 ring-zinc-300" : ""}`}
    >
      <p className="font-bold">{servidor.nombre}</p>
      <p className="text-zinc-400">{telefono}</p>
      <p className="text-zinc-400">{servidor.activo ? "Activo" : "Inactivo"}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onEditar(servidor)}
        >
          Editar
        </button>
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onBorrar(servidor)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
