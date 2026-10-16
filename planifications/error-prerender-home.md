# Error de prerender en la home

## Objetivo

La ruta `/` debe prerenderizar su shell con Cache Components (`cacheComponents: true` en `next.config.ts`) y mostrar el horario de atención cuando llegue. El aviso `blocking-prerender-dynamic` («uncached data during prerendering», `fetch` o `connection()` fuera de `<Suspense>`) deja de aparecer. El resto de la landing (encabezado, hero, servicios, reserva) no espera a Supabase.

## Decisión

Arreglo **stream**, el que documenta Next en `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` y en el texto de `createDynamicBodyError` (`node_modules/next/dist/server/app-render/blocking-route-messages.js`): el acceso sin caché va dentro de `<Suspense fallback={...}>`.

- **`"use cache"` no.** `listarHorarios` también lo usa `GET /api/horarios`. Cachearlo en el repositorio cambiaría lecturas de administración. Cachearlo solo en la landing exigiría `cacheLife` y, para no servir un horario viejo tras un alta o un cambio, invalidación en las escrituras. Eso es backend nuevo.
- **`export const instant = false` no.** La guía de `instant` (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md`) lo define como permitir que el segmento bloquee y, si es el `instant` más alto del árbol, saltarse la validación del shell estático. La home seguiría esperando la consulta antes de pintar. No se pone en `app/layout.tsx`: un `false` ahí apaga la validación de toda la app.

El patrón a copiar es el de `app/citas/page.tsx`: la página es un Server Component síncrono; el hijo async que lee datos es hijo directo de `Suspense`.

## Alcance

- Dejar `app/page.tsx` síncrono. `Home` no llama a `listarHorarios` ni a otra función que hable con Supabase.
- El único acceso a horarios de `/` sigue en `components/landing/horarios-landing.tsx`, renderizado como hijo directo de `<Suspense fallback={<HorarioPendiente />}>`.
- Reutilizar `HorarioPendiente`, `HorariosLanding`, `SeccionHorarios`, `Landing` y `listarHorarios`.

## Fuera de alcance

- Rutas que no sean `/`: `/api/horarios`, `/citas`, `/desempeno`, CRUD de horarios.
- `lib/horarios/repositorio-horarios.ts`, el cliente de Supabase, migraciones y `next.config.ts`.
- `"use cache"`, `cacheLife`, `cacheTag`, `connection()` e `instant`.
- Componentes, tipos o librerías nuevos. Sin CSS propio ni SVG.
- Commit o despliegue.

## Suposiciones

- El stack del ticket (`Home` en `app/page.tsx` llamando a `listarHorarios`) describe la página cuando el `await` estaba en `Home`. El árbol actual ya movió ese `await` a `HorariosLanding` y lo envolvió en `Suspense`. El trabajo es dejar ese árbol como estado final y comprobar que el aviso ya no sale. Si `Home` vuelve a esperar la consulta, hay que volver al árbol de abajo.
- Pasar el nodo de `Suspense` por la prop `horarios` de `Landing` es válido: el límite queda en el árbol que arma `Home`, y `Landing` solo lo pinta. No hace falta un `loading.tsx`.
- Los textos de horario no cambian: «Cargando horario…», «No pudimos cargar el horario», «Horario por confirmar», «Cerrado» y la franja `abre a cierra`.

## Archivos

No se crean archivos. No se toca el repositorio ni la API.

### `app/page.tsx`

Server Component síncrono. Arma `main` con las clases actuales y renderiza `Landing`. Servicios: `serviciosLanding`. Horarios: este nodo, sin `await` en `Home`.

```tsx
<Suspense fallback={<HorarioPendiente />}>
  <HorariosLanding />
</Suspense>
```

`HorariosLanding` es hijo directo de `Suspense`, no un resultado ya esperado.

### `components/landing/horarios-landing.tsx`

Sigue siendo el único async de la home. Llama a `listarHorarios()` y devuelve `<SeccionHorarios resultado={resultado} />`. Sin `"use cache"` y sin lógica de presentación.

### Sin cambios de comportamiento

- `components/landing/horario-pendiente.tsx`: fallback, sección `#horario`, «Cargando horario…».
- `components/landing/landing.tsx`: recibe `horarios: ReactNode` y lo pinta entre `ListaServicios` y `SeccionReserva`.
- `components/landing/seccion-horarios.tsx`: pinta éxito, lista vacía o error a partir de `ResultadoHorarios`.

## Comportamiento visible

1. La primera pintura de `/` incluye encabezado, hero, servicios y reserva, más la sección `#horario` en «Cargando horario…».
2. Al resolver la consulta, esa sección pasa al horario, a «Horario por confirmar» o a «No pudimos cargar el horario». El ancla `#horario` existe en el fallback y en el contenido resuelto.
3. Un fallo de Supabase no tumba el resto de la página.
4. El overlay de desarrollo no muestra `blocking-prerender-dynamic` para `/`.

## Criterios de aceptación

- `app/page.tsx` no importa `listarHorarios` y `Home` no es `async`.
- El `select` de `horarios_atencion` de la home solo corre dentro de `HorariosLanding`, y ese componente solo se monta bajo el `Suspense` de `app/page.tsx`.
- Recargar `/` en `next dev` no muestra el error «uncached data during prerendering» ni el code frame de `repositorio-horarios.ts` atribuido a `Home`.
- Con la red lenta o el inspector de navegación en pausa, se lee «Cargando horario…» y el hero ya está visible.
- Con datos, la lista de días sustituye al fallback. Con lista vacía, «Horario por confirmar». Con entorno incompleto o Supabase inalcanzable, «No pudimos cargar el horario».
- `GET /api/horarios` sigue llamando al mismo `listarHorarios` sin caché de Next.
