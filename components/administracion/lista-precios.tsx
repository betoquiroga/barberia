import { FilaPrecio } from "@/components/administracion/fila-precio";
import type { EstiloPublico } from "@/types/catalogo-servicio";

type ListaPreciosProps = {
  cargando: boolean;
  servicios: EstiloPublico[];
  textos: Record<string, string>;
  guardandoId: string | null;
  onChange: (id: string, texto: string) => void;
  onGuardar: (id: string) => void;
};

export function ListaPrecios({
  cargando,
  servicios,
  textos,
  guardandoId,
  onChange,
  onGuardar,
}: ListaPreciosProps) {
  if (cargando) {
    return <p>Cargando precios…</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {servicios.map((servicio) => (
        <FilaPrecio
          key={servicio.id}
          servicio={servicio}
          texto={textos[servicio.id] ?? ""}
          enviando={guardandoId === servicio.id}
          onChange={(texto) => onChange(servicio.id, texto)}
          onGuardar={() => onGuardar(servicio.id)}
        />
      ))}
    </ul>
  );
}
