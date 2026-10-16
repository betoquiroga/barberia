import { PrecioEstilo } from "@/components/estilos/precio-estilo";
import { claseTarjeta, claseTextoSuave } from "@/lib/ui/clases";
import type { EstiloPublico } from "@/types/catalogo-servicio";

type TarjetaServicioProps = {
  servicio: EstiloPublico;
};

export function TarjetaServicio({ servicio }: TarjetaServicioProps) {
  return (
    <article className={claseTarjeta}>
      <h3 className="text-lg font-medium">{servicio.nombre}</h3>
      <p className={`mt-2 ${claseTextoSuave}`}>{servicio.descripcion}</p>
      <PrecioEstilo centavos={servicio.precio_centavos} />
    </article>
  );
}
