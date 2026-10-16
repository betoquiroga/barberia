import { claseCampo } from "@/lib/ui/clases";

type CampoNombreBarberoProps = {
  valor: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
};

export function CampoNombreBarbero({
  valor,
  deshabilitado,
  onChange,
}: CampoNombreBarberoProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor="nombre-barbero">
      Nombre
      <input
        id="nombre-barbero"
        name="nombre-barbero"
        className={claseCampo}
        type="text"
        required
        maxLength={120}
        value={valor}
        disabled={deshabilitado}
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  );
}
