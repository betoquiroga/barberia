import { PanelServidores } from "@/components/servidores/panel-servidores";
import { clasePagina } from "@/lib/ui/clases";

export default function PaginaServidores() {
  return (
    <main className={clasePagina}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <PanelServidores />
      </div>
    </main>
  );
}
