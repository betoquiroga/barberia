import { PanelClientes } from "@/components/clientes/panel-clientes";

export default function PaginaClientes() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-xl px-4 py-8">
        <PanelClientes />
      </div>
    </main>
  );
}
