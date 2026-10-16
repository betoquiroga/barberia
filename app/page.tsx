import { Suspense } from "react";
import { HorarioPendiente } from "@/components/landing/horario-pendiente";
import { HorariosLanding } from "@/components/landing/horarios-landing";
import { Landing } from "@/components/landing/landing";
import { clasePagina } from "@/lib/ui/clases";

export default function Home() {
  return (
    <main className={clasePagina}>
      <Landing
        horarios={
          <Suspense fallback={<HorarioPendiente />}>
            <HorariosLanding />
          </Suspense>
        }
      />
    </main>
  );
}
