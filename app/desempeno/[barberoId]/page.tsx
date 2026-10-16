import { Suspense } from "react";
import { PanelBarbero } from "@/components/desempeno/panel-barbero";
import { clasePagina } from "@/lib/ui/clases";

type PaginaBarberoProps = {
  params: Promise<{ barberoId: string }>;
  searchParams: Promise<{ mes?: string | string[] }>;
};

export default function PaginaBarbero({
  params,
  searchParams,
}: PaginaBarberoProps) {
  return (
    <main className={clasePagina}>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Suspense fallback={<p>Cargando desempeño…</p>}>
          <ContenidoBarbero params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoBarbero({
  params,
  searchParams,
}: PaginaBarberoProps) {
  const { barberoId } = await params;
  const { mes } = await searchParams;
  const consulta = typeof mes === "string" ? mes : undefined;

  return <PanelBarbero barberoId={barberoId} mes={consulta} />;
}
