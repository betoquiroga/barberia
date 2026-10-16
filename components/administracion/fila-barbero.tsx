import { claseFila, claseTextoSuave } from "@/lib/ui/clases";
import type { Barbero } from "@/types/barbero";

type FilaBarberoProps = {
  barbero: Barbero;
};

export function FilaBarbero({ barbero }: FilaBarberoProps) {
  return (
    <li className={claseFila}>
      <p className="font-bold">{barbero.nombre}</p>
      <p className={claseTextoSuave}>{barbero.activo ? "Activo" : "Inactivo"}</p>
    </li>
  );
}
