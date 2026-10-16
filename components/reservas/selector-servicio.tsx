import { claseCampo, claseError } from "@/lib/ui/clases";

type SelectorServicioProps = {
  servicios: { id: string; nombre: string }[];
  valor: string;
  error?: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
};

export function SelectorServicio({
  servicios,
  valor,
  error,
  deshabilitado,
  onChange,
}: SelectorServicioProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex flex-col gap-1 text-sm" htmlFor="reserva-servicio">
        Servicio
        <select
          id="reserva-servicio"
          name="servicioId"
          className={claseCampo}
          required
          value={valor}
          disabled={deshabilitado}
          onChange={(evento) => onChange(evento.target.value)}
        >
          <option value="">Elige un servicio</option>
          {servicios.map((servicio) => (
            <option key={servicio.id} value={servicio.id}>
              {servicio.nombre}
            </option>
          ))}
        </select>
      </label>
      {error ? <p className={claseError}>{error}</p> : null}
    </div>
  );
}
