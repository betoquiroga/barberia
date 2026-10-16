import type { Cliente } from "@/types/cliente";

type FilaClienteProps = {
  cliente: Cliente;
  editando: boolean;
  borrando: boolean;
  onEditar: (cliente: Cliente) => void;
  onBorrar: (cliente: Cliente) => void;
};

export function FilaCliente({
  cliente,
  editando,
  borrando,
  onEditar,
  onBorrar,
}: FilaClienteProps) {
  const detalle = cliente.detalle === "" ? "Sin detalle" : cliente.detalle;

  return (
    <li
      className={`flex flex-col gap-1 border-b border-zinc-800 py-3 ${editando ? "ring-1 ring-zinc-600" : ""}`}
    >
      <p className="font-bold">{cliente.nombre}</p>
      <p className="text-zinc-400">{cliente.correo}</p>
      <p className="text-zinc-400">{cliente.telefono}</p>
      <p className="text-zinc-400">{detalle}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onEditar(cliente)}
        >
          Editar
        </button>
        <button
          type="button"
          className="rounded border border-zinc-700 px-3 py-1 text-sm disabled:opacity-50"
          disabled={borrando}
          onClick={() => onBorrar(cliente)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
