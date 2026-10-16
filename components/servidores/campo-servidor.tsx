import { claseCampo } from "@/lib/ui/clases";

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
        className={claseCampo}
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
