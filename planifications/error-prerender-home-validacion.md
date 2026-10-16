# Validación: error de prerender en la home

- Puntaje: 10
- Veredicto: aprobado

## Evidencia

`app/page.tsx` exporta `Home` síncrono. No importa `listarHorarios`. Arma `main` con las clases actuales y pasa a `Landing` los `serviciosLanding` y este nodo:

```tsx
<Suspense fallback={<HorarioPendiente />}>
  <HorariosLanding />
</Suspense>
```

`HorariosLanding` es hijo directo de `Suspense`, no un resultado ya esperado.

`components/landing/horarios-landing.tsx` es el único async de la home. Llama a `listarHorarios()` y devuelve `<SeccionHorarios resultado={resultado} />`. No tiene `"use cache"`. El `select` de horarios de `/` no aparece en otro componente de la landing.

`HorarioPendiente` mantiene la sección `#horario` y el texto «Cargando horario…». `Landing` recibe `horarios: ReactNode` y lo pinta entre `ListaServicios` y `SeccionReserva`. `SeccionHorarios` pinta el error «No pudimos cargar el horario», la lista vacía «Horario por confirmar» o las filas. `presentarHorarios` sigue usando «Cerrado» y la franja `abre a cierra`.

`GET /api/horarios` sigue llamando al mismo `listarHorarios` de `lib/horarios/repositorio-horarios.ts`. No hay `"use cache"`, `cacheLife`, `cacheTag`, `connection()` ni `instant` en la home ni en ese repositorio. No se crearon archivos de implementación ni componentes nuevos.

## Desvíos

Ninguno. No se recargó `/` en `next dev` en esta pasada; el criterio del overlay se cumple por el árbol que el plan fija como arreglo: el acceso sin caché queda dentro de `Suspense` y `Home` no espera la consulta.
