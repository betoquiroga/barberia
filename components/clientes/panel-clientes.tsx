"use client";

import { useEffect, useState } from "react";
import { FormularioCliente } from "@/components/clientes/formulario-cliente";
import type { ValoresFormularioCliente } from "@/components/clientes/formulario-cliente";
import { ListaClientes } from "@/components/clientes/lista-clientes";
import { MensajeCliente } from "@/components/clientes/mensaje-cliente";
import { mensajeErrorCliente } from "@/lib/clientes/mensajes-error-cliente";
import { claseBotonSecundario } from "@/lib/ui/clases";
import {
  actualizarCliente,
  borrarCliente,
  crearCliente,
  listarClientes,
} from "@/lib/clientes/servicio-clientes";
import type { Cliente } from "@/types/cliente";

const VACIO: ValoresFormularioCliente = {
  nombre: "",
  correo: "",
  telefono: "",
  detalle: "",
};

type Aviso = { tipo: "error" | "exito"; texto: string };

export function PanelClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [valores, setValores] = useState<ValoresFormularioCliente>(VACIO);

  async function cargar() {
    setCargando(true);
    const resultado = await listarClientes();

    if (!resultado.ok) {
      setClientes([]);
      setErrorCarga(mensajeErrorCliente(resultado.error));
      setCargando(false);
      return;
    }

    setClientes(resultado.clientes);
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
      correo: valores.correo,
      telefono: valores.telefono,
      detalle: valores.detalle,
    };

    if (editandoId) {
      const resultado = await actualizarCliente(editandoId, entrada);
      setEnviando(false);

      if (!resultado.ok) {
        setAviso({
          tipo: "error",
          texto: mensajeErrorCliente(resultado.error),
        });

        if (resultado.error === "no_encontrado") {
          setClientes((actual) =>
            actual.filter((cliente) => cliente.id !== editandoId),
          );
          setEditandoId(null);
        }

        return;
      }

      setClientes((actual) =>
        actual.map((cliente) =>
          cliente.id === resultado.cliente.id ? resultado.cliente : cliente,
        ),
      );
      limpiarFormulario();
      setAviso({ tipo: "exito", texto: "Cliente actualizado." });
      return;
    }

    const resultado = await crearCliente(entrada);
    setEnviando(false);

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorCliente(resultado.error) });
      return;
    }

    setClientes((actual) => [resultado.cliente, ...actual]);
    limpiarFormulario();
    setErrorCarga(null);
    setAviso({ tipo: "exito", texto: "Cliente guardado." });
  }

  async function borrar(cliente: Cliente) {
    const confirmar = window.confirm(`¿Borrar a ${cliente.nombre}?`);

    if (!confirmar) {
      return;
    }

    setBorrandoId(cliente.id);
    const resultado = await borrarCliente(cliente.id);
    setBorrandoId(null);

    if (!resultado.ok && resultado.error !== "no_encontrado") {
      setAviso({ tipo: "error", texto: mensajeErrorCliente(resultado.error) });
      return;
    }

    setClientes((actual) => actual.filter((fila) => fila.id !== cliente.id));

    if (editandoId === cliente.id) {
      limpiarFormulario();
    }

    if (!resultado.ok) {
      setAviso({ tipo: "error", texto: mensajeErrorCliente(resultado.error) });
      return;
    }

    setAviso({ tipo: "exito", texto: "Cliente borrado." });
  }

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <FormularioCliente
        valores={valores}
        editando={editandoId !== null}
        enviando={enviando}
        deshabilitado={cargando}
        onChange={(campo, valor) =>
          setValores((actual) => ({ ...actual, [campo]: valor }))
        }
        onGuardar={() => {
          void guardar();
        }}
        onCancelar={limpiarFormulario}
      />
      {aviso ? <MensajeCliente tipo={aviso.tipo} texto={aviso.texto} /> : null}
      {cargando ? <p>Cargando clientes…</p> : null}
      {!cargando && errorCarga ? (
        <div className="flex flex-col items-start gap-2">
          <MensajeCliente tipo="error" texto={errorCarga} />
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
        <ListaClientes
          clientes={clientes}
          editandoId={editandoId}
          borrandoId={borrandoId}
          onEditar={(cliente) => {
            setEditandoId(cliente.id);
            setValores({
              nombre: cliente.nombre,
              correo: cliente.correo,
              telefono: cliente.telefono,
              detalle: cliente.detalle,
            });
          }}
          onBorrar={(cliente) => {
            void borrar(cliente);
          }}
        />
      ) : null}
    </section>
  );
}
