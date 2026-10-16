"use client";

import { useEffect, useState } from "react";
import { ListaPrecios } from "@/components/administracion/lista-precios";
import { MensajeAdministracion } from "@/components/administracion/mensaje-administracion";
import { centavosDesdeSoles } from "@/lib/administracion/centavos-desde-soles";
import { mensajeErrorCatalogo } from "@/lib/servicios/mensajes-error-catalogo";
import { mensajeErrorPrecio } from "@/lib/servicios/mensajes-error-precio";
import { obtenerCatalogo } from "@/lib/servicios/servicio-catalogo";
import { actualizarPrecio } from "@/lib/servicios/servicio-precio";
import { claseBotonSecundario } from "@/lib/ui/clases";
import type { EstiloPublico } from "@/types/catalogo-servicio";

type Aviso = { tipo: "error" | "exito"; texto: string };

function solesIniciales(centavos: number): string {
  return (centavos / 100).toFixed(2);
}

export function PanelPrecios() {
  const [servicios, setServicios] = useState<EstiloPublico[]>([]);
  const [textos, setTextos] = useState<Record<string, string>>({});
  const [cargando, setCargando] = useState(true);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  async function cargar() {
    setCargando(true);
    const resultado = await obtenerCatalogo();

    if (!resultado.ok) {
      setErrorCarga(mensajeErrorCatalogo(resultado.error));
      setCargando(false);
      return;
    }

    const siguientes: Record<string, string> = {};

    for (const servicio of resultado.servicios) {
      siguientes[servicio.id] = solesIniciales(servicio.precio_centavos);
    }

    setServicios(resultado.servicios);
    setTextos(siguientes);
    setErrorCarga(null);
    setCargando(false);
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function guardar(id: string) {
    const centavos = centavosDesdeSoles(textos[id] ?? "");

    if (centavos === null) {
      setAviso({
        tipo: "error",
        texto: mensajeErrorPrecio("entrada_invalida"),
      });
      return;
    }

    setGuardandoId(id);
    const resultado = await actualizarPrecio(id, { precio_centavos: centavos });
    setGuardandoId(null);

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorPrecio(resultado.error) });
      return;
    }

    setServicios((actual) =>
      actual.map((servicio) =>
        servicio.id === resultado.servicio.id ? resultado.servicio : servicio,
      ),
    );
    setTextos((actual) => ({
      ...actual,
      [resultado.servicio.id]: solesIniciales(resultado.servicio.precio_centavos),
    }));
    setAviso({ tipo: "exito", texto: "Precio actualizado." });
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Precios</h2>
      {aviso ? (
        <MensajeAdministracion tipo={aviso.tipo} texto={aviso.texto} />
      ) : null}
      {!cargando && errorCarga ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeAdministracion tipo="error" texto={errorCarga} />
          <button
            type="button"
            className={claseBotonSecundario}
            onClick={() => {
              void cargar();
            }}
          >
            Reintentar
          </button>
        </div>
      ) : (
        <ListaPrecios
          cargando={cargando}
          servicios={servicios}
          textos={textos}
          guardandoId={guardandoId}
          onChange={(id, texto) => {
            setTextos((actual) => ({ ...actual, [id]: texto }));
          }}
          onGuardar={(id) => {
            void guardar(id);
          }}
        />
      )}
    </section>
  );
}
