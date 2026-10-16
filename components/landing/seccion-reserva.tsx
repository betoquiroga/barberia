import { FormularioReserva } from "@/components/reservas/formulario-reserva";
import { claseEnlace, claseTextoSuave } from "@/lib/ui/clases";

type SeccionReservaProps = {
  servicios: { id: string; nombre: string }[];
};

export function SeccionReserva({ servicios }: SeccionReservaProps) {
  return (
    <section id="reserva" className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="text-2xl font-semibold">Reservar cita</h2>
      <p className={`mt-4 ${claseTextoSuave}`}>
        Elige estilo, fecha y hora. Al agendar te llevamos a la pasarela de pago.
      </p>
      <FormularioReserva servicios={servicios} />
      <a className={`mt-6 inline-block ${claseEnlace}`} href="#horario">
        Ver horario
      </a>
    </section>
  );
}
