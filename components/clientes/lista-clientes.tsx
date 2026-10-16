import { FilaCliente } from "@/components/clientes/fila-cliente";
import type { Cliente } from "@/types/cliente";

type ListaClientesProps = {
  clientes: Cliente[];
  editandoId: string | null;
  borrandoId: string | null;
  onEditar: (cliente: Cliente) => void;
  onBorrar: (cliente: Cliente) => void;
};

export function ListaClientes({
  clientes,
  editandoId,
  borrandoId,
  onEditar,
  onBorrar,
}: ListaClientesProps) {
  if (clientes.length === 0) {
    return <p>Todavía no hay clientes.</p>;
  }

  return (
    <ul>
      {clientes.map((cliente) => (
        <FilaCliente
          key={cliente.id}
          cliente={cliente}
          editando={cliente.id === editandoId}
          borrando={cliente.id === borrandoId}
          onEditar={onEditar}
          onBorrar={onBorrar}
        />
      ))}
    </ul>
  );
}
