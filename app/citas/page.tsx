import { Suspense } from "react";
import { PanelCitas } from "@/components/citas/panel-citas";

type PaginaCitasProps = {
  searchParams: Promise<{ mes?: string | string[] }>;
};

export default function PaginaCitas({ searchParams }: PaginaCitasProps) {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Suspense fallback={<p>Cargando citas…</p>}>
          <ContenidoCitas searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function ContenidoCitas({ searchParams }: PaginaCitasProps) {
  const { mes } = await searchParams;
  const consulta = typeof mes === "string" ? mes : undefined;

  return <PanelCitas mes={consulta} />;
}
