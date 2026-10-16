import { presentarSoles } from "@/lib/servicios/presentar-soles";

type PrecioEstiloProps = {
  centavos: number;
};

export function PrecioEstilo({ centavos }: PrecioEstiloProps) {
  return (
    <p className="mt-3 text-base font-semibold text-acento">
      {presentarSoles(centavos)}
    </p>
  );
}
