import type { Servicio } from "@/types/servicio";

type TarjetaServicioProps = {
  servicio: Servicio;
};

export function TarjetaServicio({ servicio }: TarjetaServicioProps) {
  return (
    <article className="rounded-lg border border-zinc-800 p-4">
      <h3 className="text-lg font-medium">{servicio.nombre}</h3>
      <p className="mt-2 text-zinc-300">{servicio.descripcion}</p>
    </article>
  );
}
