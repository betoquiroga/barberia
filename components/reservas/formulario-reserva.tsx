"use client";

import { useState, type FormEvent } from "react";
import { CampoReserva } from "@/components/reservas/campo-reserva";
import { MensajeReserva } from "@/components/reservas/mensaje-reserva";
import { SelectorServicio } from "@/components/reservas/selector-servicio";
import { validarReserva } from "@/lib/reservas/validar-reserva";
import type { ErroresReserva, ValoresReserva } from "@/types/reserva";
import type { Servicio } from "@/types/servicio";

type FormularioReservaProps = {
  servicios: Servicio[];
};

const valoresVacios: ValoresReserva = {
  nombre: "",
  telefono: "",
  servicioId: "",
  fecha: "",
  hora: "",
  nota: "",
};

export function FormularioReserva({ servicios }: FormularioReservaProps) {
  const [valores, setValores] = useState<ValoresReserva>(valoresVacios);
  const [errores, setErrores] = useState<ErroresReserva>({});
  const [intento, setIntento] = useState(false);
  const [confirmacion, setConfirmacion] = useState<string | null>(null);
  const [reservando, setReservando] = useState(false);

  function actualizar(campo: keyof ValoresReserva, valor: string) {
    const siguientes = { ...valores, [campo]: valor };

    setValores(siguientes);
    setReservando(false);
    setConfirmacion(null);

    if (!intento) {
      return;
    }

    const resultado = validarReserva(siguientes, servicios);
    setErrores(resultado.ok ? {} : resultado.errores);
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntento(true);

    const resultado = validarReserva(valores, servicios);

    if (!resultado.ok) {
      setErrores(resultado.errores);
      setConfirmacion(null);
      setReservando(false);
      return;
    }

    const servicio = servicios.find(
      (item) => item.id === valores.servicioId,
    );

    setErrores({});
    setIntento(false);
    setValores(valoresVacios);
    setReservando(true);
    setConfirmacion(
      `Listo. Anotamos tu cita en esta pantalla. Aún no queda guardada. ${servicio?.nombre ?? ""}, ${valores.fecha}, ${valores.hora}.`,
    );
  }

  return (
    <form className="mt-6 flex flex-col gap-4" noValidate onSubmit={enviar}>
      {confirmacion ? (
        <MensajeReserva tipo="confirmacion" texto={confirmacion} />
      ) : null}
      <CampoReserva
        control="input"
        id="reserva-nombre"
        etiqueta="Nombre"
        type="text"
        required
        maxLength={120}
        valor={valores.nombre}
        error={errores.nombre}
        deshabilitado={false}
        onChange={(valor) => actualizar("nombre", valor)}
      />
      <CampoReserva
        control="input"
        id="reserva-telefono"
        etiqueta="Teléfono"
        type="tel"
        required
        maxLength={20}
        valor={valores.telefono}
        error={errores.telefono}
        deshabilitado={false}
        onChange={(valor) => actualizar("telefono", valor)}
      />
      <SelectorServicio
        servicios={servicios}
        valor={valores.servicioId}
        error={errores.servicioId}
        deshabilitado={false}
        onChange={(valor) => actualizar("servicioId", valor)}
      />
      <CampoReserva
        control="input"
        id="reserva-fecha"
        etiqueta="Fecha"
        type="date"
        required
        valor={valores.fecha}
        error={errores.fecha}
        deshabilitado={false}
        onChange={(valor) => actualizar("fecha", valor)}
      />
      <CampoReserva
        control="input"
        id="reserva-hora"
        etiqueta="Hora"
        type="time"
        required
        valor={valores.hora}
        error={errores.hora}
        deshabilitado={false}
        onChange={(valor) => actualizar("hora", valor)}
      />
      <CampoReserva
        control="textarea"
        id="reserva-nota"
        etiqueta="Nota"
        maxLength={300}
        rows={3}
        valor={valores.nota}
        error={errores.nota}
        deshabilitado={false}
        onChange={(valor) => actualizar("nota", valor)}
      />
      <button
        type="submit"
        className="rounded bg-zinc-50 px-4 py-2 text-sm text-zinc-950 disabled:opacity-50"
        disabled={reservando}
      >
        {reservando ? "Reservando…" : "Reservar"}
      </button>
    </form>
  );
}
