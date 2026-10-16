import type { Servicio } from "@/types/servicio";

type SelectorServicioProps = {
  servicios: Servicio[];
  valor: string;
  error?: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
};

const clase =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:bg-zinc-800 disabled:opacity-50";

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
          className={clase}
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
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
