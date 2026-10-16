import { claseBotonPrincipal, claseTextoSuave } from "@/lib/ui/clases";

export function HeroLanding() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Barbería</h1>
      <p className={`mt-4 text-lg ${claseTextoSuave}`}>
        Corte y arreglo de barba, con hora de atención clara
      </p>
      <a
        className={`${claseBotonPrincipal} mt-8 inline-block`}
        href="#reserva"
      >
        Ver cómo reservar
      </a>
    </section>
  );
}
