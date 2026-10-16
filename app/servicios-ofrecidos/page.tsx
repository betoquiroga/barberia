import { PanelServicios } from "@/components/servicios-ofrecidos/panel-servicios";
import { clasePagina } from "@/lib/ui/clases";

export default function PaginaServiciosOfrecidos() {
  return (
    <main className={clasePagina}>
      <div className="mx-auto max-w-xl px-4 py-8">
        <PanelServicios />
      </div>
    </main>
  );
}
