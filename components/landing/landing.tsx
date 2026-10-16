import { EncabezadoLanding } from "@/components/landing/encabezado-landing";
import { HeroLanding } from "@/components/landing/hero-landing";
import { ListaServicios } from "@/components/landing/lista-servicios";
import { SeccionHorarios } from "@/components/landing/seccion-horarios";
import { SeccionReserva } from "@/components/landing/seccion-reserva";
import type { ResultadoHorarios } from "@/types/horario";
import type { Servicio } from "@/types/servicio";

type LandingProps = {
  servicios: Servicio[];
  resultado: ResultadoHorarios;
};

export function Landing({ servicios, resultado }: LandingProps) {
  return (
    <>
      <EncabezadoLanding />
      <HeroLanding />
      <ListaServicios servicios={servicios} />
      <SeccionHorarios resultado={resultado} />
      <SeccionReserva servicios={servicios} />
    </>
  );
}
