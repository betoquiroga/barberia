"use client";

import { useState, type FormEvent } from "react";
import { CampoReserva } from "@/components/reservas/campo-reserva";
import { MensajeReserva } from "@/components/reservas/mensaje-reserva";
import { SelectorServicio } from "@/components/reservas/selector-servicio";
import { mensajeErrorAlta } from "@/lib/citas/mensajes-error-alta";
import { enviarAltaCita } from "@/lib/citas/servicio-alta-cita";
import { obtenerPago } from "@/lib/pagos/servicio-pago";
import { validarReserva } from "@/lib/reservas/validar-reserva";
import { claseBotonPrincipal } from "@/lib/ui/clases";
import type { EntradaAltaCita } from "@/types/cita-alta";
import type { ErroresReserva, ValoresReserva } from "@/types/reserva";

type FormularioReservaProps = {
  servicios: { id: string; nombre: string }[];
};

const valoresVacios: ValoresReserva = {
  nombre: "",
  correo: "",
  telefono: "",
  servicioId: "",
  fecha: "",
  hora: "",
  nota: "",
};

function entradaAlta(valores: ValoresReserva): EntradaAltaCita {
  return {
    nombre: valores.nombre.trim(),
    correo: valores.correo.trim().toLowerCase(),
    telefono: valores.telefono.trim(),
    servicioId: valores.servicioId,
    fecha: valores.fecha,
    hora: valores.hora,
    nota: valores.nota.trim(),
  };
}

function esUrlAbsoluta(valor: string): boolean {
  try {
    const url = new URL(valor);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function FormularioReserva({ servicios }: FormularioReservaProps) {
  const [valores, setValores] = useState<ValoresReserva>(valoresVacios);
  const [errores, setErrores] = useState<ErroresReserva>({});
  const [intento, setIntento] = useState(false);
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo: keyof ValoresReserva, valor: string) {
    const siguientes = { ...valores, [campo]: valor };

    setValores(siguientes);

    if (enviando) {
      return;
    }

    setErrorAlta(null);

    if (!intento) {
      return;
    }

    const resultado = validarReserva(siguientes, servicios);
    setErrores(resultado.ok ? {} : resultado.errores);
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setIntento(true);

    const resultado = validarReserva(valores, servicios);

    if (!resultado.ok) {
      setErrores(resultado.errores);
      setErrorAlta(null);
      return;
    }

    setErrores({});
    setErrorAlta(null);
    setEnviando(true);

    const alta = await enviarAltaCita(entradaAlta(valores));

    if (alta.ok) {
      if (
        alta.cita.pago.estado === "pendiente" &&
        esUrlAbsoluta(alta.cita.pago.url_pasarela)
      ) {
        window.location.assign(alta.cita.pago.url_pasarela);
        return;
      }

      setErrorAlta(mensajeErrorAlta("supabase_inalcanzable"));
      setEnviando(false);
      return;
    }

    if (alta.error === "correo_no_enviado") {
      const pago = await obtenerPago(alta.pago_id);

      if (
        pago.ok &&
        pago.pago.estado === "pendiente" &&
        typeof pago.pago.url_pasarela === "string" &&
        pago.pago.url_pasarela.length > 0
      ) {
        window.location.assign(pago.pago.url_pasarela);
        return;
      }

      setErrorAlta(mensajeErrorAlta("correo_no_enviado"));
      setEnviando(false);
      return;
    }

    setErrorAlta(mensajeErrorAlta(alta.error));
    setEnviando(false);
  }

  return (
    <form className="mt-6 flex flex-col gap-4" noValidate onSubmit={enviar}>
      {errorAlta ? <MensajeReserva tipo="error" texto={errorAlta} /> : null}
      <CampoReserva
        control="input"
        id="reserva-nombre"
        etiqueta="Nombre"
        type="text"
        required
        maxLength={120}
        valor={valores.nombre}
        error={errores.nombre}
        deshabilitado={enviando}
        onChange={(valor) => actualizar("nombre", valor)}
      />
      <CampoReserva
        control="input"
        id="reserva-correo"
        etiqueta="Correo"
        type="email"
        required
        maxLength={254}
        valor={valores.correo}
        error={errores.correo}
        deshabilitado={enviando}
        onChange={(valor) => actualizar("correo", valor)}
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
        deshabilitado={enviando}
        onChange={(valor) => actualizar("telefono", valor)}
      />
      <SelectorServicio
        servicios={servicios}
        valor={valores.servicioId}
        error={errores.servicioId}
        deshabilitado={enviando}
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
        deshabilitado={enviando}
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
        deshabilitado={enviando}
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
        deshabilitado={enviando}
        onChange={(valor) => actualizar("nota", valor)}
      />
      <button type="submit" className={claseBotonPrincipal} disabled={enviando}>
        {enviando ? "Agendando…" : "Agendar y pagar"}
      </button>
    </form>
  );
}
