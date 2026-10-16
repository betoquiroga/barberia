"use client";

import { useEffect, useState } from "react";
import { FormularioBarbero } from "@/components/administracion/formulario-barbero";
import { ListaBarberos } from "@/components/administracion/lista-barberos";
import { MensajeAdministracion } from "@/components/administracion/mensaje-administracion";
import { mensajeErrorBarbero } from "@/lib/barberos/mensajes-error-barbero";
import { crearBarbero, listarBarberos } from "@/lib/barberos/servicio-barberos";
import { claseBotonSecundario } from "@/lib/ui/clases";
import type { Barbero } from "@/types/barbero";

type Aviso = { tipo: "error" | "exito"; texto: string };

export function PanelBarberos() {
  const [barberos, setBarberos] = useState<Barbero[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);

  async function cargar() {
    setCargando(true);
    const resultado = await listarBarberos();

    if (!resultado.ok) {
      setErrorCarga(mensajeErrorBarbero(resultado.error));
      setCargando(false);
      return;
    }

    setBarberos(resultado.barberos);
    setErrorCarga(null);
    setCargando(false);
  }

  useEffect(() => {
    void cargar();
  }, []);

  async function guardar() {
    const nombreLimpio = nombre.trim();

    if (!nombreLimpio) {
      setAviso({
        tipo: "error",
        texto: mensajeErrorBarbero("entrada_invalida"),
      });
      return;
    }

    setEnviando(true);
    const resultado = await crearBarbero({ nombre: nombreLimpio, activo });
    setEnviando(false);

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorBarbero(resultado.error) });
      return;
    }

    setNombre("");
    setActivo(true);
    setAviso({ tipo: "exito", texto: "Barbero agregado." });
    await cargar();
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-xl font-semibold">Barberos</h2>
      <FormularioBarbero
        nombre={nombre}
        activo={activo}
        enviando={enviando}
        deshabilitado={cargando}
        onNombre={setNombre}
        onActivo={setActivo}
        onGuardar={() => {
          void guardar();
        }}
      />
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
        <ListaBarberos cargando={cargando} barberos={barberos} />
      )}
    </section>
  );
}
