import {
  claseBotonSecundario,
  claseFila,
  claseFilaEdicion,
  claseTextoSuave,
} from "@/lib/ui/clases";
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
      className={`${claseFila}${editando ? ` ${claseFilaEdicion}` : ""}`}
    >
      <p className="font-bold">{cliente.nombre}</p>
      <p className={claseTextoSuave}>{cliente.correo}</p>
      <p className={claseTextoSuave}>{cliente.telefono}</p>
      <p className={claseTextoSuave}>{detalle}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onEditar(cliente)}
        >
          Editar
        </button>
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onBorrar(cliente)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
