import { CampoServicio } from "@/components/servicios-ofrecidos/campo-servicio";
import { SelectorServidores } from "@/components/servicios-ofrecidos/selector-servidores";
import type { Servidor } from "@/types/servidor";

export type ValoresFormularioServicio = {
  nombre: string;
  precio: string;
  costo: string;
  servidorIds: string[];
};

type FormularioServicioProps = {
  valores: ValoresFormularioServicio;
  servidores: Servidor[];
  editando: boolean;
  enviando: boolean;
  deshabilitado: boolean;
  mostrarSelector: boolean;
  onChange: (valores: ValoresFormularioServicio) => void;
  onGuardar: () => void;
  onCancelar: () => void;
};

export function FormularioServicio({
  valores,
  servidores,
  editando,
  enviando,
  deshabilitado,
  mostrarSelector,
  onChange,
  onGuardar,
  onCancelar,
}: FormularioServicioProps) {
  const bloqueado = deshabilitado || enviando;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        onGuardar();
      }}
    >
      <CampoServicio
        id="nombre-servicio"
        etiqueta="Nombre"
        type="text"
        required
        maxLength={80}
        placeholder="Corte de cabello"
        valor={valores.nombre}
        deshabilitado={bloqueado}
        onChange={(nombre) => onChange({ ...valores, nombre })}
      />
      <CampoServicio
        id="precio"
        etiqueta="Precio (pesos)"
        type="number"
        required
        min={1}
        step={1}
        placeholder="15000"
        valor={valores.precio}
        deshabilitado={bloqueado}
        onChange={(precio) => onChange({ ...valores, precio })}
      />
      <CampoServicio
        id="costo"
        etiqueta="Costo (pesos)"
        type="number"
        required
        min={1}
        step={1}
        placeholder="5000"
        valor={valores.costo}
        deshabilitado={bloqueado}
        onChange={(costo) => onChange({ ...valores, costo })}
      />
      {mostrarSelector ? (
        <SelectorServidores
          servidores={servidores}
          elegidos={valores.servidorIds}
          deshabilitado={bloqueado}
          onChange={(servidorIds) => onChange({ ...valores, servidorIds })}
        />
      ) : null}
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
