import { Landing } from "@/components/landing/landing";
import { listarHorarios } from "@/lib/horarios/repositorio-horarios";
import { serviciosLanding } from "@/lib/landing/servicios";

export default async function Home() {
  const resultado = await listarHorarios();

  return (
    <main className="min-h-dvh bg-zinc-950 text-zinc-50">
      <Landing servicios={serviciosLanding} resultado={resultado} />
    </main>
  );
}
