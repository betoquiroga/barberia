import { PrecioServicio } from "@/components/landing/precio-servicio";
import { claseTarjeta, claseTextoSuave } from "@/lib/ui/clases";
import type { Servicio } from "@/types/servicio";

type TarjetaServicioProps = {
  servicio: Servicio;
};

export function TarjetaServicio({ servicio }: TarjetaServicioProps) {
  return (
    <article className={claseTarjeta}>
      <h3 className="text-lg font-medium">{servicio.nombre}</h3>
      <p className={`mt-2 ${claseTextoSuave}`}>{servicio.descripcion}</p>
      <PrecioServicio precio={servicio.precio} />
    </article>
  );
}
