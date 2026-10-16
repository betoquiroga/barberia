import { FormularioReserva } from "@/components/reservas/formulario-reserva";
import type { Servicio } from "@/types/servicio";

type SeccionReservaProps = {
  servicios: Servicio[];
};

export function SeccionReserva({ servicios }: SeccionReservaProps) {
  return (
    <section id="reserva" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Reservar cita</h2>
      <p className="mt-4 text-zinc-300">
        La cita se anota en esta pantalla y todavía no se guarda.
      </p>
      <FormularioReserva servicios={servicios} />
      <a className="mt-6 inline-block text-sm underline" href="#horario">
        Ver horario
      </a>
    </section>
  );
}
