import { PanelAdministracion } from "@/components/administracion/panel-administracion";
import { clasePagina } from "@/lib/ui/clases";

export default function PaginaAdministracion() {
  return (
    <main className={clasePagina}>
      <div className="mx-auto flex max-w-xl flex-col gap-10 px-4 py-8">
        <PanelAdministracion />
      </div>
    </main>
  );
}
