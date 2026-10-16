export function HeroLanding() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">Barbería</h1>
      <p className="mt-4 text-lg text-zinc-300">
        Corte y arreglo de barba, con hora de atención clara
      </p>
      <a
        className="mt-8 inline-block rounded-md bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-950"
        href="#reserva"
      >
        Ver cómo reservar
      </a>
    </section>
  );
}
