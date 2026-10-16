import { claseCampo, claseError } from "@/lib/ui/clases";

type CampoReservaProps = {
  id: string;
  etiqueta: string;
  valor: string;
  error?: string;
  deshabilitado: boolean;
  onChange: (valor: string) => void;
} & (
  | {
      control: "input";
      type: "text" | "email" | "tel" | "date" | "time";
      required: boolean;
      maxLength?: number;
    }
  | {
      control: "textarea";
      maxLength: number;
      rows: number;
    }
);

export function CampoReserva(props: CampoReservaProps) {
  return (
    <div className="flex flex-col gap-1">
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
      {props.error ? (
        <p className={claseError}>{props.error}</p>
      ) : null}
    </div>
  );
}
