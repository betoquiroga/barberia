type CampoClienteProps = {
  id: string;
  etiqueta: string;
  valor: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
} & (
  | {
      control: "input";
      type: "text" | "email" | "tel";
      required: boolean;
      maxLength: number;
    }
  | {
      control: "textarea";
      maxLength: number;
      rows: number;
    }
);

const clase =
  "w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-50 disabled:bg-zinc-800 disabled:opacity-50";

export function CampoCliente(props: CampoClienteProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={props.id}>
      {props.etiqueta}
      {props.control === "textarea" ? (
        <textarea
          id={props.id}
          name={props.id}
          className={clase}
          maxLength={props.maxLength}
          rows={props.rows}
          value={props.valor}
          disabled={props.deshabilitado}
          onChange={(evento) => props.onChange(evento.target.value)}
        />
      ) : (
        <input
          id={props.id}
          name={props.id}
          className={clase}
          type={props.type}
          required={props.required}
          maxLength={props.maxLength}
          value={props.valor}
          disabled={props.deshabilitado}
          onChange={(evento) => props.onChange(evento.target.value)}
        />
      )}
    </label>
  );
}
