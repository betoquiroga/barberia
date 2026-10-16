import { SeccionHorarios } from "@/components/landing/seccion-horarios";
import { listarHorarios } from "@/lib/horarios/repositorio-horarios";

export async function HorariosLanding() {
  const resultado = await listarHorarios();

  return <SeccionHorarios resultado={resultado} />;
}
