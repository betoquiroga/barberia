# Validación backend — horarios de atención

Plan: `planifications/horarios-atencion.md`

## Puntajes

| Parte | Puntaje | Veredicto |
| --- | --- | --- |
| Migraciones | 10 | aprobado |
| Lógica de negocio | 10 | aprobado |

## Migraciones

Evidencia en `supabase/migrations/20261016160000_crear_tabla_horarios_atencion.sql`:

- La tabla `public.horarios_atencion` tiene `id` (uuid, PK, `gen_random_uuid()`), `dia` (text not null), `abre` y `cierra` (time nullable), `cerrado` (boolean not null default false), `creado_en` y `actualizado_en` (timestamptz not null default now()). Sin FKs y sin semilla.
- Check `horarios_atencion_dia_valido` con los siete días en minúsculas y sin tilde.
- Check `horarios_atencion_horas_coherentes`: cerrado con ambas horas null, o abierto con ambas horas y `abre < cierra`.
- Índice único `horarios_atencion_dia_unico` sobre `dia`.
- Función `public.horarios_atencion_marcar_actualizado()` en plpgsql, `search_path = ''`, asigna `pg_catalog.now()` y retorna `new`. Trigger `horarios_atencion_antes_de_actualizar` before update, for each row.
- RLS activo. Políticas `horarios_atencion_anon_select`, `_insert`, `_update` y `_delete` solo para `anon`, con `using (true)` y `with check (true)` según el comando. No hay políticas de `authenticated` ni otras tablas.
- La migración de clientes sigue en su archivo y no se toca aquí.

## Lógica de negocio

Evidencia:

- `types/horario.ts` define `DiaSemana`, `Horario`, `EntradaHorario` (cerrado sin horas, o abierto con `abre` y `cierra`), `ErrorHorario` y los tres resultados. Sin funciones.
- `lib/horarios/validar-horario.ts` rechaza no-objetos y arrays, exige `cerrado` boolean, normaliza el día (incluye `miércoles` y `sábado`), ignora horas si está cerrado, exige `HH:MM` y `abre` anterior a `cierra` si está abierto, e ignora campos extra. Cualquier fallo es `null`.
- `lib/horarios/repositorio-horarios.ts` usa `leerEntorno` y `crearCliente`. Sin entorno responde `entorno_incompleto`. UUID inválido es `no_encontrado` sin consulta. Lista las columnas pedidas y ordena en memoria de lunes a domingo. Recorta horas a cinco caracteres. Insert y update persisten `null` si el día está cerrado. `23505` es `dia_duplicado`. Cero filas es `no_encontrado`. El borrado selecciona `id` y el éxito no devuelve horario. El resto de errores del SDK es `supabase_inalcanzable`.
- `app/api/horarios/route.ts` expone GET 200 y POST 201, y mapea 400, 409 y 503. Un JSON ilegible llega como `null` y termina en `entrada_invalida`.
- `app/api/horarios/[id]/route.ts` expone GET, PATCH y DELETE, y mapea 400, 404, 409 y 503. No hay otros métodos. Los handlers no validan ni crean el cliente.
