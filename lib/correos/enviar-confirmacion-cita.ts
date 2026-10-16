export type DatosConfirmacionCita = {
  nombre: string;
  correo: string;
  servicio_nombre: string;
  fecha: string;
  hora: string;
  nota: string;
};

export async function enviarConfirmacionCita(
  cita: DatosConfirmacionCita,
): Promise<{ ok: true } | { ok: false }> {
  const clave = process.env.RESEND_API_KEY?.trim();
  const remitente = process.env.CORREO_REMITENTE?.trim();

  if (!clave || !remitente) {
    return { ok: false };
  }

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clave}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: remitente,
        to: [cita.correo],
        subject: "Confirmación de tu cita",
        text: textoConfirmacion(cita),
      }),
    });

    if (respuesta.status < 200 || respuesta.status > 299) {
      return { ok: false };
    }

    return { ok: true };
  } catch {
    return { ok: false };
  }
}

function textoConfirmacion(cita: DatosConfirmacionCita): string {
  const lineas = [
    `Hola ${cita.nombre}`,
    `Servicio: ${cita.servicio_nombre}`,
    `Fecha: ${cita.fecha}`,
    `Hora: ${cita.hora}`,
    "Zona: America/Lima",
    "Estado: programada",
  ];

  if (cita.nota !== "") {
    lineas.push(`Nota: ${cita.nota}`);
  }

  return lineas.join("\n");
}
