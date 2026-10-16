# Validación backend — correo de confirmación al agendar

Plan: `planifications/correo-confirmacion-cita.md`

## Migraciones

Puntaje: **10**

Veredicto: **aprobado**

Evidencia:

- `supabase/migrations/20261016223000_citas_datos_de_quien_reserva.sql` es el archivo nuevo que pide el plan y su SQL coincide: `barbero_id` deja de ser obligatorio, se agregan `nombre`, `correo`, `telefono` y `nota` (default `''`), y los checks `citas_nombre_largo`, `citas_telefono_largo`, `citas_nota_larga`, `citas_correo_minusculas` y `citas_correo_forma`.
- El índice `citas_correo` se crea sin `unique`.
- No se toca `20261016170000_crear_desempeno_barberos.sql`. Ahí siguen `citas_estado_valido`, el índice `citas_barbero_inicia` y las políticas `citas_anon_select`, `citas_anon_insert` y `citas_anon_update`.
- `lib/citas/repositorio-citas-diagrama.ts` sigue haciendo `select("inicia_en, estado")`.
- La migración `20261016223000` ya está aplicada en el remoto (historial `citas_datos_de_quien_reserva`). No se reejecuta `20261016170000`.

## Lógica de negocio

Puntaje: **9**

Veredicto: **aprobado**

Evidencia:

- Tipos en `types/cita-alta.ts` coinciden con el plan, incluido `cita_id` opcional solo en el sobre de error.
- `validarAltaCita` recorta, exige nombre 1–120, correo en minúsculas (máx. 254) con la misma forma que `lib/clientes/validar-cliente.ts`, teléfono 7–20 con dígitos, espacios, `+` y `-`, los tres `servicioId`, fecha real `AAAA-MM-DD` mayor o igual que hoy en `America/Lima`, hora `00:00`–`23:59` y nota ausente, `null` o texto de hasta 300 (vacía queda `''`). Cualquier fallo devuelve `null`.
- `POST` en `app/api/citas/route.ts` lee el JSON como clientes, llama a `crearCita` y responde `201`, `400`, `502` o `503` según el error. `GET` no cambia.
- `crearCita` valida, exige `leerEntorno()`, `RESEND_API_KEY` y `CORREO_REMITENTE` antes de insertar, distingue error de SDK (`supabase_inalcanzable`) de fila nula (`servicio_desconocido`), arma `inicia_en` con desfase fijo `-05:00` (`2026-10-20` y `15:30` → `2026-10-20T20:30:00.000Z`), inserta sin `barbero_id` y con `estado: "programada"`, y si Resend falla devuelve `correo_no_enviado` con `cita_id` sin borrar la fila.
- `enviarConfirmacionCita` hace `POST` a `https://api.resend.com/emails` con remitente, destinatario, asunto y texto en el orden pedido (saludo, servicio, fecha, hora, `America/Lima`, `programada` y `Nota:` solo si hay nota). `ok: true` solo en HTTP 2xx. No registra la clave ni el cuerpo de error.
- `lib/citas/agrupar-citas.ts` agrupa por `America/Lima`, así que `GET /api/citas?mes=2026-10` cuenta esa cita en el día y la hora de Lima.

No se ejecutó un `POST` real contra Resend ni contra la base. El puntaje mide el cumplimiento del código frente al plan.
