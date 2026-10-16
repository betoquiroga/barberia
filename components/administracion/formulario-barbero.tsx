import { CampoNombreBarbero } from "@/components/administracion/campo-nombre-barbero";
import { CasillaActivo } from "@/components/servidores/casilla-activo";
import { claseBotonPrincipal } from "@/lib/ui/clases";

type FormularioBarberoProps = {
  nombre: string;
  activo: boolean;
  enviando: boolean;
  deshabilitado: boolean;
  onNombre: (nombre: string) => void;
  onActivo: (activo: boolean) => void;
  onGuardar: () => void;
};

export function FormularioBarbero({
  nombre,
  activo,
  enviando,
  deshabilitado,
  onNombre,
  onActivo,
  onGuardar,
}: FormularioBarberoProps) {
  const bloqueado = deshabilitado || enviando;

  return (
    <form
      className="flex flex-col gap-4"
      noValidate
      onSubmit={(evento) => {
        evento.preventDefault();
        onGuardar();
      }}
    >
      <CampoNombreBarbero
        valor={nombre}
        deshabilitado={bloqueado}
        onChange={onNombre}
      />
      <CasillaActivo
        activo={activo}
        deshabilitado={bloqueado}
        onChange={onActivo}
      />
      <button type="submit" className={claseBotonPrincipal} disabled={bloqueado}>
        {enviando ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
