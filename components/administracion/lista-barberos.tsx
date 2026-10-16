import { FilaBarbero } from "@/components/administracion/fila-barbero";
import type { Barbero } from "@/types/barbero";

type ListaBarberosProps = {
  cargando: boolean;
  barberos: Barbero[];
};

export function ListaBarberos({ cargando, barberos }: ListaBarberosProps) {
  if (cargando) {
    return <p>Cargando barberos…</p>;
  }

  if (barberos.length === 0) {
    return <p>Todavía no hay barberos.</p>;
  }

  return (
    <ul>
      {barberos.map((barbero) => (
        <FilaBarbero key={barbero.id} barbero={barbero} />
      ))}
    </ul>
  );
}
