type CampoServidorProps = {
  id: string;
  etiqueta: string;
  type: "text" | "tel";
  required?: boolean;
  maxLength: number;
  valor: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
};

const clase =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:bg-zinc-800 disabled:opacity-50";

export function CampoServidor({
  id,
  etiqueta,
  type,
  required,
  maxLength,
  valor,
  deshabilitado,
  onChange,
}: CampoServidorProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={id}>
      {etiqueta}
      <input
        id={id}
        name={id}
        className={clase}
        type={type}
        required={required}
        maxLength={maxLength}
        value={valor}
        disabled={deshabilitado}
        onChange={(evento) => onChange(evento.target.value)}
      />
    </label>
  );
}
