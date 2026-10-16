import { NombresServidores } from "@/components/servicios-ofrecidos/nombres-servidores";
import { presentarPesos } from "@/lib/landing/presentar-pesos";
import {
  claseBotonSecundario,
  claseFila,
  claseFilaEdicion,
  claseTextoSuave,
} from "@/lib/ui/clases";
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
      className={`${claseFila}${editando ? ` ${claseFilaEdicion}` : ""}`}
    >
      <p className="font-bold">{servicio.nombre}</p>
      <p className={claseTextoSuave}>Precio: {presentarPesos(servicio.precio_pesos)}</p>
      <p className={claseTextoSuave}>Costo: {presentarPesos(servicio.costo_pesos)}</p>
      <NombresServidores servidores={servicio.servidores} />
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onEditar(servicio)}
        >
          Editar
        </button>
        <button
          type="button"
          className={claseBotonSecundario}
          disabled={borrando}
          onClick={() => onBorrar(servicio)}
        >
          {borrando ? "Borrando…" : "Borrar"}
        </button>
      </div>
    </li>
  );
}
