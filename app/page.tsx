import { Suspense } from "react";
import { HorarioPendiente } from "@/components/landing/horario-pendiente";
import { HorariosLanding } from "@/components/landing/horarios-landing";
import { Landing } from "@/components/landing/landing";
import { serviciosLanding } from "@/lib/landing/servicios";

export default function Home() {
  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <Landing
        servicios={serviciosLanding}
        horarios={
          <Suspense fallback={<HorarioPendiente />}>
            <HorariosLanding />
          </Suspense>
        }
      />
    </main>
  );
}
