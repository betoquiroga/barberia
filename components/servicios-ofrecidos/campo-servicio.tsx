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

const clase =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:bg-zinc-800 disabled:opacity-50";

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
        className={clase}
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
