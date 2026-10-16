"use client";

import { useEffect, useState, type ReactNode } from "react";
import { MensajeCatalogo } from "@/components/estilos/mensaje-catalogo";
import { ListaServicios } from "@/components/landing/lista-servicios";
import { SeccionReserva } from "@/components/landing/seccion-reserva";
import { obtenerCatalogo } from "@/lib/servicios/servicio-catalogo";
import type { EstiloPublico } from "@/types/catalogo-servicio";

type ExperienciaClienteProps = {
  horarios: ReactNode;
};

type EstadoCatalogo =
  | { fase: "carga" }
  | { fase: "error" }
  | { fase: "listo"; servicios: EstiloPublico[] };

export function ExperienciaCliente({ horarios }: ExperienciaClienteProps) {
  const [estado, setEstado] = useState<EstadoCatalogo>({ fase: "carga" });

  useEffect(() => {
    let vigente = true;

    obtenerCatalogo().then((resultado) => {
      if (!vigente) {
        return;
      }

      if (resultado.ok) {
        setEstado({ fase: "listo", servicios: resultado.servicios });
        return;
      }

      setEstado({ fase: "error" });
    });

    return () => {
      vigente = false;
    };
  }, []);

  return (
    <>
      {estado.fase === "listo" ? (
        <ListaServicios servicios={estado.servicios} />
      ) : (
        <section id="servicios" className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-semibold">Servicios</h2>
          <div className="mt-6">
            <MensajeCatalogo fase={estado.fase === "error" ? "error" : "carga"} />
          </div>
        </section>
      )}
      {horarios}
      {estado.fase === "listo" ? (
        <SeccionReserva servicios={estado.servicios} />
      ) : null}
    </>
  );
}
