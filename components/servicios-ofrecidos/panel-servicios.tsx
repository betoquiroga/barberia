"use client";

import { useEffect, useState } from "react";
import { EnlaceServidores } from "@/components/servicios-ofrecidos/enlace-servidores";
import { FormularioServicio } from "@/components/servicios-ofrecidos/formulario-servicio";
import type { ValoresFormularioServicio } from "@/components/servicios-ofrecidos/formulario-servicio";
import { ListaServicios } from "@/components/servicios-ofrecidos/lista-servicios";
import { MensajeServicio } from "@/components/servicios-ofrecidos/mensaje-servicio";
import { mensajeErrorServicioOfrecido } from "@/lib/servicios-ofrecidos/mensajes-error-servicio-ofrecido";
import {
  actualizarServicioOfrecido,
  borrarServicioOfrecido,
  crearServicioOfrecido,
  listarServiciosOfrecidos,
} from "@/lib/servicios-ofrecidos/servicio-servicios-ofrecidos";
import { mensajeErrorServidor } from "@/lib/servidores/mensajes-error-servidor";
import { listarServidores } from "@/lib/servidores/servicio-servidores";
import type { Servidor } from "@/types/servidor";
import type { ServicioOfrecido } from "@/types/servicio-ofrecido";

const VACIO: ValoresFormularioServicio = {
  nombre: "",
  precio: "",
  costo: "",
  servidorIds: [],
};

type Aviso = { tipo: "error" | "exito"; texto: string };

export function PanelServicios() {
  const [servicios, setServicios] = useState<ServicioOfrecido[]>([]);
  const [servidores, setServidores] = useState<Servidor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoServidores, setCargandoServidores] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorServidores, setErrorServidores] = useState<string | null>(null);
  const [valores, setValores] = useState<ValoresFormularioServicio>(VACIO);

  async function cargarServicios() {
    setCargando(true);
    const resultado = await listarServiciosOfrecidos();

    if (!resultado.ok) {
      setServicios([]);
      setErrorCarga(mensajeErrorServicioOfrecido(resultado.error));
      setCargando(false);
      return;
    }

    setServicios(resultado.servicios);
    setErrorCarga(null);
    setCargando(false);
  }

  async function cargarServidores() {
    setCargandoServidores(true);
    const resultado = await listarServidores();

    if (!resultado.ok) {
      setServidores([]);
      setErrorServidores(mensajeErrorServidor(resultado.error));
      setCargandoServidores(false);
      return;
    }

    setServidores(resultado.servidores);
    setErrorServidores(null);
    setCargandoServidores(false);
  }

  async function cargarTodo() {
    await Promise.all([cargarServicios(), cargarServidores()]);
  }

  useEffect(() => {
    void cargarTodo();
  }, []);

  function limpiarFormulario() {
    setValores(VACIO);
    setEditandoId(null);
  }

  function entrada() {
    return {
      nombre: valores.nombre,
      precio_pesos: Number(valores.precio),
      costo_pesos: Number(valores.costo),
      servidor_ids: valores.servidorIds,
    };
  }

  async function guardar() {
    setEnviando(true);
    const datos = entrada();

    if (editandoId) {
      const resultado = await actualizarServicioOfrecido(editandoId, datos);
      setEnviando(false);

      if (!resultado.ok) {
        setAviso({
          tipo: "error",
          texto: mensajeErrorServicioOfrecido(resultado.error),
        });

        if (resultado.error === "servidor_inexistente") {
          void cargarServidores();
        }

        if (resultado.error === "no_encontrado") {
          setServicios((actual) =>
            actual.filter((servicio) => servicio.id !== editandoId),
          );
          limpiarFormulario();
        }

        return;
      }

      setServicios((actual) =>
        actual.map((servicio) =>
          servicio.id === resultado.servicio.id ? resultado.servicio : servicio,
        ),
      );
      limpiarFormulario();
      setErrorCarga(null);
      setAviso({ tipo: "exito", texto: "Servicio actualizado." });
      return;
    }

    const resultado = await crearServicioOfrecido(datos);
    setEnviando(false);

    if (!resultado.ok) {
      setAviso({
        tipo: "error",
        texto: mensajeErrorServicioOfrecido(resultado.error),
      });

      if (resultado.error === "servidor_inexistente") {
        void cargarServidores();
      }

      return;
    }

    setServicios((actual) => [resultado.servicio, ...actual]);
    limpiarFormulario();
    setErrorCarga(null);
    setAviso({ tipo: "exito", texto: "Servicio guardado." });
  }

  async function borrar(servicio: ServicioOfrecido) {
    const confirmar = window.confirm(`¿Borrar el servicio ${servicio.nombre}?`);

    if (!confirmar) {
      return;
    }

    setBorrandoId(servicio.id);
    const resultado = await borrarServicioOfrecido(servicio.id);
    setBorrandoId(null);

    if (!resultado.ok && resultado.error !== "no_encontrado") {
      setAviso({
        tipo: "error",
        texto: mensajeErrorServicioOfrecido(resultado.error),
      });
      return;
    }

    setServicios((actual) => actual.filter((fila) => fila.id !== servicio.id));

    if (editandoId === servicio.id) {
      limpiarFormulario();
    }

    if (!resultado.ok) {
      setAviso({
        tipo: "error",
        texto: mensajeErrorServicioOfrecido(resultado.error),
      });
      return;
    }

    setAviso({ tipo: "exito", texto: "Servicio borrado." });
  }

  const mostrarSelector = !cargandoServidores && !errorServidores;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <EnlaceServidores />
      </div>
      <FormularioServicio
        valores={valores}
        servidores={servidores}
        editando={editandoId !== null}
        enviando={enviando}
        deshabilitado={cargando}
        mostrarSelector={mostrarSelector}
        onChange={setValores}
        onGuardar={() => {
          void guardar();
        }}
        onCancelar={limpiarFormulario}
      />
      {cargandoServidores ? <p>Cargando servidores…</p> : null}
      {!cargandoServidores && errorServidores ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeServicio tipo="error" texto={errorServidores} />
          <button
            type="button"
            className="rounded border border-zinc-700 px-3 py-1 text-sm"
            onClick={() => {
              void cargarServidores();
            }}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {aviso ? <MensajeServicio tipo={aviso.tipo} texto={aviso.texto} /> : null}
      {cargando ? <p>Cargando servicios…</p> : null}
      {!cargando && errorCarga ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeServicio tipo="error" texto={errorCarga} />
          <button
            type="button"
            className="rounded border border-zinc-700 px-3 py-1 text-sm"
            onClick={() => {
              void cargarTodo();
            }}
          >
            Reintentar
          </button>
        </div>
      ) : null}
      {!cargando && !errorCarga ? (
        <ListaServicios
          servicios={servicios}
          editandoId={editandoId}
          borrandoId={borrandoId}
          onEditar={(servicio) => {
            setEditandoId(servicio.id);
            setValores({
              nombre: servicio.nombre,
              precio: String(servicio.precio_pesos),
              costo: String(servicio.costo_pesos),
              servidorIds: servicio.servidores.map((servidor) => servidor.id),
            });
          }}
          onBorrar={(servicio) => {
            void borrar(servicio);
          }}
        />
      ) : null}
    </section>
  );
}
