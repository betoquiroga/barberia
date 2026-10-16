import { TarjetaServicio } from "@/components/landing/tarjeta-servicio";
import type { Servicio } from "@/types/servicio";

type ListaServiciosProps = {
  servicios: Servicio[];
};

export function ListaServicios({ servicios }: ListaServiciosProps) {
  return (
    <section id="servicios" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Servicios</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {servicios.map((servicio) => (
          <li key={servicio.id}>
            <TarjetaServicio servicio={servicio} />
          </li>
        ))}
      </ul>
    </section>
  );
}
