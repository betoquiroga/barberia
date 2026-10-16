import { PanelClientes } from "@/components/clientes/panel-clientes";
import { clasePagina } from "@/lib/ui/clases";

export default function PaginaClientes() {
  return (
    <main className={clasePagina}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <PanelClientes />
      </div>
    </main>
  );
}
