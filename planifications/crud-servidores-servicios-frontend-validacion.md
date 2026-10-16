# Validación: CRUD de servidores y servicios (frontend)

- Puntaje: 9
- Veredicto: aprobado

## Evidencia

El alcance del plan está en los archivos previstos. Las páginas `app/servidores/page.tsx` y `app/servicios-ofrecidos/page.tsx` son Server Components y solo montan el panel. Las llamadas `fetch` viven en `lib/servidores/servicio-servidores.ts` y `lib/servicios-ofrecidos/servicio-servicios-ofrecidos.ts` (`cache: "no-store"`, JSON inválido o red caída como `supabase_inalcanzable`, forma de éxito validada). Los mapas de error coinciden con los textos del plan.

`/servidores` lista, crea (antepone la fila), edita con `PATCH` del recurso completo, cancela sin API y borra tras `window.confirm`. Teléfono vacío se omite del cuerpo. La fila muestra «Sin teléfono», «Activo» o «Inactivo», anillo de edición y «Borrando…». `no_encontrado` quita la fila.

`/servicios-ofrecidos` pide servicios y servidores en paralelo. Placeholders «Corte de cabello», «15000» y «5000». Precio y costo se formatean con `presentarPesos`. `servidor_ids` sale de las casillas, incluido `[]`. `nombre_duplicado` y `entrada_invalida` conservan el formulario. `servidor_inexistente` refresca servidores. El fallo del GET de servicios reintenta ambos; el de servidores reintenta solo servidores.

No hay SVG, CSS propio ni dependencias nuevas en estos archivos. Los tipos de dominio no se duplican.

## Desvíos menores

El error del GET de servidores se muestra junto al formulario y oculta el selector, en lugar de vivir dentro de las casillas. El formulario de servicios sigue habilitado mientras cargan los servidores (el envío manda `servidor_ids` vacío). No baja el cumplimiento de los criterios de aceptación.
