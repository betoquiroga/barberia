import {
  claseBotonSecundario,
  claseFila,
  claseFilaEdicion,
  claseTextoSuave,
} from "@/lib/ui/clases";
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
      className={`${claseFila}${editando ? ` ${claseFilaEdicion}` : ""}`}
    >
      <p className="font-bold">{servidor.nombre}</p>
      <p className={claseTextoSuave}>{telefono}</p>
      <p className={claseTextoSuave}>{servidor.activo ? "Activo" : "Inactivo"}</p>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onEditar(servidor)}
        >
          Editar
        </button>
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onBorrar(servidor)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
