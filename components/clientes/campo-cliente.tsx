import { claseCampo } from "@/lib/ui/clases";

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

export function CampoCliente(props: CampoClienteProps) {
  return (
    <label className="flex flex-col gap-1 text-sm" htmlFor={props.id}>
      {props.etiqueta}
      {props.control === "textarea" ? (
        <textarea
          id={props.id}
          name={props.id}
          className={claseCampo}
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
          className={claseCampo}
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
