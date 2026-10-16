import { presentarPesos } from "@/lib/landing/presentar-pesos";

type PrecioServicioProps = {
  precio: number;
};

export function PrecioServicio({ precio }: PrecioServicioProps) {
  return <p className="mt-3 text-base font-semibold text-zinc-50">{presentarPesos(precio)}</p>;
}
