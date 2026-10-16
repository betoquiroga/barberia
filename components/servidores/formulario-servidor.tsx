import { CampoServidor } from "@/components/servidores/campo-servidor";
import { CasillaActivo } from "@/components/servidores/casilla-activo";

export type ValoresFormularioServidor = {
  nombre: string;
  telefono: string;
  activo: boolean;
};

type FormularioServidorProps = {
  valores: ValoresFormularioServidor;
  editando: boolean;
  enviando: boolean;
  deshabilitado: boolean;
  onChange: (valores: ValoresFormularioServidor) => void;
  onGuardar: () => void;
  onCancelar: () => void;
};

export function FormularioServidor({
  valores,
  editando,
  enviando,
  deshabilitado,
  onChange,
  onGuardar,
  onCancelar,
}: FormularioServidorProps) {
  const bloqueado = deshabilitado || enviando;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        onGuardar();
      }}
    >
      <CampoServidor
        id="nombre"
        etiqueta="Nombre"
        type="text"
        required
        maxLength={120}
        valor={valores.nombre}
        deshabilitado={bloqueado}
        onChange={(nombre) => onChange({ ...valores, nombre })}
      />
      <CampoServidor
        id="telefono"
        etiqueta="Teléfono"
        type="tel"
        maxLength={20}
        valor={valores.telefono}
        deshabilitado={bloqueado}
        onChange={(telefono) => onChange({ ...valores, telefono })}
      />
      <CasillaActivo
        activo={valores.activo}
        deshabilitado={bloqueado}
        onChange={(activo) => onChange({ ...valores, activo })}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded bg-zinc-50 px-4 py-2 text-sm text-zinc-950 disabled:opacity-50"
          disabled={bloqueado}
        >
          {enviando ? "Guardando…" : editando ? "Actualizar" : "Guardar"}
        </button>
        {editando ? (
          <button
            type="button"
            className="rounded border border-zinc-700 px-4 py-2 text-sm disabled:opacity-50"
            disabled={enviando}
            onClick={onCancelar}
          >
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
