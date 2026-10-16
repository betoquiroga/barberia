import { validarAltaCita } from "@/lib/citas/validar-alta-cita";
import { enviarConfirmacionCita } from "@/lib/correos/enviar-confirmacion-cita";
import { crearCliente } from "@/lib/supabase/crear-cliente";
import { leerEntorno } from "@/lib/supabase/leer-entorno";
import type { CitaCreada, ResultadoAltaCita } from "@/types/cita-alta";

const DESFASE_LIMA = "-05:00";

export async function crearCita(cuerpo: unknown): Promise<ResultadoAltaCita> {
  const entrada = validarAltaCita(cuerpo);

  if (!entrada) {
    return { ok: false, error: "entrada_invalida" };
  }

  const entorno = leerEntorno();
  const claveCorreo = process.env.RESEND_API_KEY?.trim();
  const remitente = process.env.CORREO_REMITENTE?.trim();

  if (!entorno || !claveCorreo || !remitente) {
    return { ok: false, error: "entorno_incompleto" };
  }

  const consulta = await crearCliente(entorno)
    .from("servicios")
    .select("id, nombre")
    .eq("id", entrada.servicioId)
    .maybeSingle();

  if (consulta.error) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const servicio = consulta.data as { id: string; nombre: string } | null;

  if (!servicio) {
    return { ok: false, error: "servicio_desconocido" };
  }

  const iniciaEn = new Date(
    `${entrada.fecha}T${entrada.hora}:00${DESFASE_LIMA}`,
  ).toISOString();

  const insercion = await crearCliente(entorno)
    .from("citas")
    .insert({
      nombre: entrada.nombre,
      correo: entrada.correo,
      telefono: entrada.telefono,
      nota: entrada.nota,
      servicio_id: entrada.servicioId,
      inicia_en: iniciaEn,
      estado: "programada",
    })
    .select("id")
    .single();

  if (insercion.error || !insercion.data) {
    return { ok: false, error: "supabase_inalcanzable" };
  }

  const fila = insercion.data as { id: string };
  const cita: CitaCreada = {
    id: fila.id,
    nombre: entrada.nombre,
    correo: entrada.correo,
    telefono: entrada.telefono,
    servicio_id: entrada.servicioId,
    servicio_nombre: servicio.nombre,
    fecha: entrada.fecha,
    hora: entrada.hora,
    nota: entrada.nota,
    estado: "programada",
    correo_enviado: false,
  };

  const envio = await enviarConfirmacionCita(cita);

  if (!envio.ok) {
    return { ok: false, error: "correo_no_enviado", cita_id: cita.id };
  }

  return { ok: true, cita: { ...cita, correo_enviado: true } };
}
