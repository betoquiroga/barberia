import { FilaServicio } from "@/components/servicios-ofrecidos/fila-servicio";
import type { ServicioOfrecido } from "@/types/servicio-ofrecido";

type ListaServiciosProps = {
  servicios: ServicioOfrecido[];
  editandoId: string | null;
  borrandoId: string | null;
  onEditar: (servicio: ServicioOfrecido) => void;
  onBorrar: (servicio: ServicioOfrecido) => void;
};

export function ListaServicios({
  servicios,
  editandoId,
  borrandoId,
  onEditar,
  onBorrar,
}: ListaServiciosProps) {
  if (servicios.length === 0) {
    return <p>Todavía no hay servicios.</p>;
  }

  return (
    <ul>
      {servicios.map((servicio) => (
        <FilaServicio
          key={servicio.id}
          servicio={servicio}
          editando={servicio.id === editandoId}
          borrando={servicio.id === borrandoId}
          onEditar={onEditar}
          onBorrar={onBorrar}
        />
      ))}
    </ul>
  );
}
