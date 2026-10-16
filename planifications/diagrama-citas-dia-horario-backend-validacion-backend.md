# Validación backend — diagrama de citas por día y por horario

Plan: `planifications/diagrama-citas-dia-horario-backend.md`

## Puntajes

| Parte | Puntaje | Veredicto |
| --- | --- | --- |
| Plan vs migración | 10 | aprobado |
| Plan vs lógica | 10 | aprobado |

## Migraciones

No se creó ningún archivo nuevo en `supabase/migrations`. Siguen solo:

- `20261016150000_crear_tabla_clientes.sql`
- `20261016160000_crear_tabla_horarios_atencion.sql`
- `20261016170000_crear_desempeno_barberos.sql`

En `20261016170000_crear_desempeno_barberos.sql`, `public.citas` conserva `inicia_en timestamptz not null`, `estado text not null`, el check `citas_estado_valido` (`programada`, `completada`, `cancelada`), las FK a `barberos` y `servicios`, el índice `citas_barbero_inicia` sobre `(barbero_id, inicia_en)`, RLS activo y `citas_anon_select` con `using (true)`. No hay columnas, índices, vistas, funciones ni políticas nuevas.

## Lógica

- `types/citas-diagrama.ts` declara `DiaCitas`, `HoraCitas`, `HorarioPico`, `ErrorCitasDiagrama` (`mes_invalido`, `entorno_incompleto`, `supabase_inalcanzable`) y `ResultadoCitasDiagrama`. No hay `no_encontrado`.
- `lib/citas/agrupar-citas.ts` cuenta solo `programada` y `completada`, parte fecha y hora con `Intl` en `America/Lima` (`en-CA` y `en-US` + `hourCycle: "h23"`), descarta fechas que no empiezan por `mes-`, arma todos los días civiles del mes (gregoriano, ceros incluidos), deja horas con `cantidad > 0` ordenadas `00`–`23` y elige el pico por mayor cantidad, con empate a la hora más temprana porque las horas ya van en orden lexicográfico y el empate no reemplaza.
- `lib/citas/repositorio-citas-diagrama.ts` llama `validarMes`, `leerEntorno` (sin consultar si es `null`), `crearCliente`, `from("citas").select("inicia_en, estado").gte(...).lt(...)` y `agruparCitas`. El `mes` de éxito es `intervalo.mes`. El error del SDK no se reenvía. `validarMes` ya trata vacío como mes actual de Lima y `9999-12` / formato inválido como `mes_invalido`.
- `app/api/citas/route.ts` solo exporta `GET`, lee `mes` con `searchParams.get("mes")`, llama `leerDiagramaCitas` y responde `200` / `400` / `503` según el resultado.
- No existen `servicio-citas-diagrama.ts`, `clase-barra.ts`, `presentar-eje.ts` ni otros métodos en la ruta.
