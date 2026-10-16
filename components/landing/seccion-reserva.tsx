export function SeccionReserva() {
  return (
    <section id="reserva" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Reserva en el local</h2>
      <p className="mt-4 text-zinc-300">
        La reserva es presencial y se hace en el local, dentro del horario de
        atención.
      </p>
      <a className="mt-6 inline-block text-sm underline" href="#horario">
        Ver horario
      </a>
    </section>
  );
}
