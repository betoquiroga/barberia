import type { ReactNode } from "react";
import { ExperienciaCliente } from "@/components/estilos/experiencia-cliente";
import { EncabezadoLanding } from "@/components/landing/encabezado-landing";
import { HeroLanding } from "@/components/landing/hero-landing";

type LandingProps = {
  horarios: ReactNode;
};

export function Landing({ horarios }: LandingProps) {
  return (
    <>
      <EncabezadoLanding />
      <HeroLanding />
      <ExperienciaCliente horarios={horarios} />
    </>
  );
}
