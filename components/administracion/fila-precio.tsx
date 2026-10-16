import { presentarSoles } from "@/lib/servicios/presentar-soles";
import { claseBotonPrincipal, claseCampo, claseFila, claseTextoSuave } from "@/lib/ui/clases";
import type { EstiloPublico } from "@/types/catalogo-servicio";

type FilaPrecioProps = {
  servicio: EstiloPublico;
  texto: string;
  enviando: boolean;
  onChange: (texto: string) => void;
  onGuardar: () => void;
};

export function FilaPrecio({
  servicio,
  texto,
  enviando,
  onChange,
  onGuardar,
}: FilaPrecioProps) {
  const id = `precio-${servicio.id}`;

  return (
    <li className={claseFila}>
      <p className="font-bold">{servicio.nombre}</p>
      <p className={claseTextoSuave}>{servicio.descripcion}</p>
      <p>{presentarSoles(servicio.precio_centavos)}</p>
      <form
        className="flex flex-col gap-2 pt-1"
        noValidate
        onSubmit={(evento) => {
          evento.preventDefault();
          onGuardar();
        }}
      >
        <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
          Nuevo precio (S/)
          <input
            id={id}
            name={id}
            className={claseCampo}
            type="text"
            inputMode="decimal"
            value={texto}
            disabled={enviando}
            onChange={(evento) => onChange(evento.target.value)}
          />
        </label>
        <button type="submit" className={claseBotonPrincipal} disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </li>
  );
}
