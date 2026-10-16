import { claseTextoSuave } from "@/lib/ui/clases";

export function HorarioPendiente() {
  return (
    <section id="horario" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Horario</h2>
      <p className={`mt-6 ${claseTextoSuave}`}>Cargando horario…</p>
    </section>
  );
}
