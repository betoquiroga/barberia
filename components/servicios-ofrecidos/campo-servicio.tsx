import { claseCampo } from "@/lib/ui/clases";

type CampoServicioProps = {
  id: string;
  etiqueta: string;
  type: "text" | "number";
  required: boolean;
  valor: string;
  deshabilitado: boolean;
  placeholder: string;
  onChange: (valor: string) => void;
  maxLength?: number;
  min?: number;
  step?: number;
};

export function CampoServicio({
  id,
  etiqueta,
  type,
  required,
  valor,
  deshabilitado,
  placeholder,
  onChange,
  maxLength,
  min,
  step,
}: CampoServicioProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      {etiqueta}
      <input
        id={id}
        name={id}
        className={claseCampo}
        type={type}
        required={required}
        value={valor}
        disabled={deshabilitado}
        placeholder={placeholder}
        maxLength={maxLength}
        min={min}
        step={step}
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  );
}
