"use client";

import { useEffect, useState } from "react";
import { EnlaceServicios } from "@/components/servidores/enlace-servicios";
import { FormularioServidor } from "@/components/servidores/formulario-servidor";
import type { ValoresFormularioServidor } from "@/components/servidores/formulario-servidor";
import { ListaServidores } from "@/components/servidores/lista-servidores";
import { MensajeServidor } from "@/components/servidores/mensaje-servidor";
import { mensajeErrorServidor } from "@/lib/servidores/mensajes-error-servidor";
import { claseBotonSecundario } from "@/lib/ui/clases";
import {
  actualizarServidor,
  borrarServidor,
  crearServidor,
  listarServidores,
} from "@/lib/servidores/servicio-servidores";
import type { Servidor } from "@/types/servidor";

const VACIO: ValoresFormularioServidor = {
  nombre: "",
  telefono: "",
  activo: true,
};

type Aviso = { tipo: "error" | "exito"; texto: string };

export function PanelServidores() {
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [valores, setValores] = useState<ValoresFormularioServidor>(VACIO);

  async function cargar() {
    setCargando(true);
    const resultado = await listarServidores();

    if (!resultado.ok) {
      setServidores([]);
      setErrorCarga(mensajeErrorServidor(resultado.error));
      setCargando(false);
      return;
    }

    setServidores(resultado.servidores);
    setErrorCarga(null);
    setCargando(false);
  }

  useEffect(() => {
    void cargar();
  }, []);

  function limpiarFormulario() {
    setValores(VACIO);
    setEditandoId(null);
  }

  async function guardar() {
    setEnviando(true);
    const entrada = {
      nombre: valores.nombre,
      telefono: valores.telefono,
      activo: valores.activo,
    };

    if (editandoId) {
      const resultado = await actualizarServidor(editandoId, entrada);
      setEnviando(false);

      if (!resultado.ok) {
        setAviso({
          tipo: "error",
          texto: mensajeErrorServidor(resultado.error),
        });

        if (resultado.error === "no_encontrado") {
          setServidores((actual) =>
            actual.filter((servidor) => servidor.id !== editandoId),
          );
          limpiarFormulario();
        }

        return;
      }

      setServidores((actual) =>
        actual.map((servidor) =>
          servidor.id === resultado.servidor.id ? resultado.servidor : servidor,
        ),
      );
      limpiarFormulario();
      setErrorCarga(null);
      setAviso({ tipo: "exito", texto: "Servidor actualizado." });
      return;
    }

    const resultado = await crearServidor(entrada);
    setEnviando(false);

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorServidor(resultado.error) });
      return;
    }

    setServidores((actual) => [resultado.servidor, ...actual]);
    limpiarFormulario();
    setErrorCarga(null);
    setAviso({ tipo: "exito", texto: "Servidor guardado." });
  }

  async function borrar(servidor: Servidor) {
    const confirmar = window.confirm(`¿Borrar a ${servidor.nombre}?`);

    if (!confirmar) {
      return;
    }

    setBorrandoId(servidor.id);
    const resultado = await borrarServidor(servidor.id);
    setBorrandoId(null);

    if (!resultado.ok && resultado.error !== "no_encontrado") {
      setAviso({ tipo: "error", texto: mensajeErrorServidor(resultado.error) });
      return;
    }

    setServidores((actual) => actual.filter((fila) => fila.id !== servidor.id));

    if (editandoId === servidor.id) {
      limpiarFormulario();
    }

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorServidor(resultado.error) });
      return;
    }

    setAviso({ tipo: "exito", texto: "Servidor borrado." });
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Servidores</h1>
        <EnlaceServicios />
      </div>
      <FormularioServidor
        valores={valores}
        editando={editandoId !== null}
        enviando={enviando}
        deshabilitado={cargando}
        onChange={setValores}
        onGuardar={() => {
          void guardar();
        }}
        onCancelar={limpiarFormulario}
      />
      {aviso ? <MensajeServidor tipo={aviso.tipo} texto={aviso.texto} /> : null}
      {cargando ? <p>Cargando servidores…</p> : null}
      {!cargando && errorCarga ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeServidor tipo="error" texto={errorCarga} />
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
      ) : null}
      {!cargando && !errorCarga ? (
        <ListaServidores
          servidores={servidores}
          editandoId={editandoId}
          borrandoId={borrandoId}
          onEditar={(servidor) => {
            setEditandoId(servidor.id);
            setValores({
              nombre: servidor.nombre,
              telefono: servidor.telefono,
              activo: servidor.activo,
            });
          }}
          onBorrar={(servidor) => {
            void borrar(servidor);
          }}
        />
      ) : null}
    </section>
  );
}
