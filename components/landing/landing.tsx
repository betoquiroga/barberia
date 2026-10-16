import type { ReactNode } from "react";
import { EncabezadoLanding } from "@/components/landing/encabezado-landing";
import { HeroLanding } from "@/components/landing/hero-landing";
import { ListaServicios } from "@/components/landing/lista-servicios";
import { SeccionReserva } from "@/components/landing/seccion-reserva";
import type { Servicio } from "@/types/servicio";

type LandingProps = {
  servicios: Servicio[];
  horarios: ReactNode;
};

export function Landing({ servicios, horarios }: LandingProps) {
  return (
    <>
      <EncabezadoLanding />
      <HeroLanding />
      <ListaServicios servicios={servicios} />
      {horarios}
      <SeccionReserva servicios={servicios} />
    </>
  );
}
