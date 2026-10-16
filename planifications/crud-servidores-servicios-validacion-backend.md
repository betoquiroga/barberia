# Validación backend — CRUD de servidores y servicios

Plan: `planifications/crud-servidores-servicios.md`

## Migraciones

- Puntaje: **10**
- Veredicto: **aprobado**

Evidencia:

- Existe `supabase/migrations/20261016180000_crear_servidores_y_servicios_ofrecidos.sql` y no altera migraciones anteriores ni `public.servicios`, `public.barberos` ni `public.citas`.
- `servidores`: seis columnas (`id` uuid PK `gen_random_uuid()`, `nombre`, `telefono` default `''`, `activo` default `true`, `creado_en`, `actualizado_en`), checks `servidores_nombre_largo` y `servidores_telefono_largo`, trigger `servidores_antes_de_actualizar` con `search_path = ''` y `pg_catalog.now()`.
- `servicios_ofrecidos`: seis columnas, checks de largo, precio positivo, costo positivo y `precio_pesos >= costo_pesos`, índice único `servicios_ofrecidos_nombre_unico` sobre `(lower(btrim(nombre)))`, trigger `servicios_ofrecidos_antes_de_actualizar`.
- `servicio_ofrecido_servidor`: PK `(servicio_ofrecido_id, servidor_id)`, ambas FK `on delete cascade`, índice `servicio_ofrecido_servidor_servidor`.
- Semilla `Corte de cabello` con precio 15000 y costo 5000, sin filas en el puente.
- RLS activo en las tres tablas y las doce políticas `anon` con `using (true)` / `with check (true)`. Sin políticas `authenticated`.

## Lógica de negocio

- Puntaje: **9**
- Veredicto: **aprobado**

Evidencia:

- Tipos solo en `types/servidor.ts` y `types/servicio-ofrecido.ts`. `ServicioOfrecido.servidores` importa `Servidor`. Códigos de error y resultados coinciden con el plan.
- `lib/servidores/validar-servidor.ts` exige objeto, nombre recortado de 1 a 120, teléfono vacío o con 7–20 caracteres (`dígitos`, espacios, `+`, `-`) y `activo` boolean con default `true`.
- `lib/servicios-ofrecidos/validar-servicio-ofrecido.ts` exige enteros positivos con tope 100000000, `precio_pesos >= costo_pesos` y `servidor_ids` UUID sin duplicados (default `[]`).
- Repositorios usan `leerEntorno` y `crearCliente`. Sin entorno responden `entorno_incompleto`. Un id de ruta que no es UUID es `no_encontrado` sin consultar. Errores del SDK quedan en `supabase_inalcanzable`.
- Servidores: listado por `creado_en` descendente, alta, lectura, reemplazo en `PATCH` y borrado físico que distingue cero filas.
- Servicios: `select` anidado del puente hacia `servidores`, orden de servicios por `creado_en` descendente y de servidores por `nombre`. `23505` es `nombre_duplicado`. `23503` al vincular es `servidor_inexistente`: en el alta se borra el servicio recién creado; en el `PATCH` se reinsertan los vínculos previos.
- Handlers de `/api/servidores` y `/api/servicios-ofrecidos` (colección e `[id]`) solo leen el cuerpo y mapean `entrada_invalida` → 400, `no_encontrado` → 404, `nombre_duplicado` → 409, `servidor_inexistente` → 422 y el resto → 503, con 201 en los `POST`.

Nota menor (no baja de 7): el orden de servidores se aplica en memoria con `localeCompare("es")`, no en el `order` de PostgREST.
