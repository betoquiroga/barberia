import { Suspense } from "react";
import { PanelDesempeno } from "@/components/desempeno/panel-desempeno";

type PaginaDesempenoProps = {
  searchParams: Promise<{ mes?: string | string[] }>;
};

export default function PaginaDesempeno({
  searchParams,
}: PaginaDesempenoProps) {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Suspense fallback={<p>Cargando desempeño…</p>}>
          <ContenidoDesempeno searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoDesempeno({
  searchParams,
}: PaginaDesempenoProps) {
  const { mes } = await searchParams;
  const consulta = typeof mes === "string" ? mes : undefined;

  return <PanelDesempeno mes={consulta} />;
}
