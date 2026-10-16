import { CampoCliente } from "@/components/clientes/campo-cliente";
import {
  claseBotonPrincipal,
  claseBotonSecundarioGrande,
} from "@/lib/ui/clases";

export type ValoresFormularioCliente = {
  nombre: string;
  correo: string;
  telefono: string;
  detalle: string;
};

type FormularioClienteProps = {
  valores: ValoresFormularioCliente;
  editando: boolean;
  enviando: boolean;
  deshabilitado: boolean;
  onChange: (campo: keyof ValoresFormularioCliente, valor: string) => void;
  onGuardar: () => void;
  onCancelar: () => void;
};

export function FormularioCliente({
  valores,
  editando,
  enviando,
  deshabilitado,
  onChange,
  onGuardar,
  onCancelar,
}: FormularioClienteProps) {
  const bloqueado = deshabilitado || enviando;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        onGuardar();
      }}
    >
      <CampoCliente
        control="input"
        id="nombre"
        etiqueta="Nombre"
        type="text"
        required
        maxLength={120}
        valor={valores.nombre}
        deshabilitado={bloqueado}
        onChange={(valor) => onChange("nombre", valor)}
      />
      <CampoCliente
        control="input"
        id="correo"
        etiqueta="Correo"
        type="email"
        required
        maxLength={254}
        valor={valores.correo}
        deshabilitado={bloqueado}
        onChange={(valor) => onChange("correo", valor)}
      />
      <CampoCliente
        control="input"
        id="telefono"
        etiqueta="Teléfono"
        type="tel"
        required
        maxLength={20}
        valor={valores.telefono}
        deshabilitado={bloqueado}
        onChange={(valor) => onChange("telefono", valor)}
      />
      <CampoCliente
        control="textarea"
        id="detalle"
        etiqueta="Detalle"
        maxLength={500}
        rows={3}
        valor={valores.detalle}
        deshabilitado={bloqueado}
        onChange={(valor) => onChange("detalle", valor)}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className={claseBotonPrincipal}
          disabled={bloqueado}
        >
          {enviando ? "Guardando…" : editando ? "Actualizar" : "Guardar"}
        </button>
        {editando ? (
          <button
            type="button"
            className={claseBotonSecundarioGrande}
            disabled={bloqueado}
            onClick={onCancelar}
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
