# Validación: CRUD de clientes en el navegador

- Plan: `planifications/crud-clientes-frontend.md`
- Puntaje: **9**
- Veredicto: **aprobado**

## Evidencia

- `lib/clientes/servicio-clientes.ts` concentra `listarClientes`, `crearCliente`, `actualizarCliente` y `borrarCliente`. Usa `fetch` con `cache: "no-store"`, `Content-Type: application/json` en POST y PATCH, recorta nombre, correo y teléfono, omite `detalle` vacío y no llama a `GET /api/clientes/[id]`. JSON inválido, red caída y cuerpos desconocidos devuelven `supabase_inalcanzable`.
- `lib/clientes/mensajes-error-cliente.ts` mapea los cinco códigos de `ErrorCliente` a los textos del plan. Los tipos salen de `types/cliente.ts`.
- `app/clientes/page.tsx` es un Server Component sin fetch. Fondo `bg-white text-zinc-950` y contenedor `mx-auto max-w-xl px-4 py-8`.
- `components/clientes/panel-clientes.tsx` guarda lista, carga, envío, borrado, edición, aviso y valores del formulario. Al montar pide la lista una vez. Crear antepone la fila y muestra “Cliente guardado.”. Editar reemplaza la fila y muestra “Cliente actualizado.”. Cancelar limpia sin llamar a la API. Borrar pide `window.confirm`, quita la fila y, si era `no_encontrado`, muestra el mensaje de no encontrado.
- Formulario, campo, lista, fila y mensaje están separados. Campos en el orden y con los `maxLength` del plan. Botones Guardar / Actualizar / Guardando… y Cancelar solo en edición. Lista vacía: “Todavía no hay clientes.”. Carga: “Cargando clientes…”. Fallo inicial: mensaje y Reintentar. Detalle vacío: “Sin detalle”. Fila en edición con `ring-1 ring-zinc-300`. Borrar de esa fila pasa a “Borrando…” y deshabilita Editar y Borrar.
- No hay SVG, CSS propio ni íconos. `/` sigue mostrando Hola EDteam. No hay cambios en `app/api` ni dependencias nuevas en este alcance.

## Observación

Si al actualizar el servidor responde `no_encontrado`, se quita la fila y se sale del modo edición, pero los campos del formulario no se vacían. El siguiente Guardar crearía un cliente con esos valores. No baja el puntaje de 7.
