import type { Servidor } from "@/types/servidor";

type SelectorServidoresProps = {
  servidores: Servidor[];
  elegidos: string[];
  deshabilitado: boolean;
  onChange: (servidorIds: string[]) => void;
};

export function SelectorServidores({
  servidores,
  elegidos,
  deshabilitado,
  onChange,
}: SelectorServidoresProps) {
  if (servidores.length === 0) {
    return <p className="text-sm">No hay servidores. Crea uno para asignarlo.</p>;
  }

  function alternar(id: string, marcado: boolean) {
    if (marcado) {
      onChange([...elegidos, id]);
      return;
    }

    onChange(elegidos.filter((actual) => actual !== id));
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm">Servidores</legend>
      {servidores.map((servidor) => (
        <label
          key={servidor.id}
          className="flex items-center gap-2 text-sm"
          htmlFor={servidor.id}
        >
          <input
            id={servidor.id}
            name={servidor.id}
            type="checkbox"
            checked={elegidos.includes(servidor.id)}
            disabled={deshabilitado}
            onChange={(evento) => alternar(servidor.id, evento.target.checked)}
          />
          {servidor.activo ? servidor.nombre : `${servidor.nombre} (inactivo)`}
        </label>
      ))}
    </fieldset>
  );
}
