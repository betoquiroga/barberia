import { FilaServidor } from "@/components/servidores/fila-servidor";
import type { Servidor } from "@/types/servidor";

type ListaServidoresProps = {
  servidores: Servidor[];
  editandoId: string | null;
  borrandoId: string | null;
  onEditar: (servidor: Servidor) => void;
  onBorrar: (servidor: Servidor) => void;
};

export function ListaServidores({
  servidores,
  editandoId,
  borrandoId,
  onEditar,
  onBorrar,
}: ListaServidoresProps) {
  if (servidores.length === 0) {
    return <p>Todavía no hay servidores.</p>;
  }

  return (
    <ul>
      {servidores.map((servidor) => (
        <FilaServidor
          key={servidor.id}
          servidor={servidor}
          editando={servidor.id === editandoId}
          borrando={servidor.id === borrandoId}
          onEditar={onEditar}
          onBorrar={onBorrar}
        />
      ))}
    </ul>
  );
}
