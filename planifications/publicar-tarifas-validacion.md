# Validación: publicar tarifas

Puntaje: 10
Veredicto: aprobado

## Alcance

La implementación cubre el catálogo fijo, el formateo en pesos colombianos y la tarjeta de la landing. No hay API, migraciones, lectura de Supabase ni reutilización de `presentarSoles`.

## Evidencia

- `types/servicio.ts` exige `precio: number` junto a `id`, `nombre` y `descripcion`.
- `lib/landing/servicios.ts` asigna 18000, 12000 y 28000 a `corte-clasico`, `arreglo-barba` y `corte-y-barba`. Nombres, descripciones, orden y cantidad se mantienen. Sin formateo ni JSX.
- `lib/landing/presentar-pesos.ts` exporta `presentarPesos` y crea un solo `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 })`. No importa React ni `Servicio`.
- `components/landing/precio-servicio.tsx` recibe `{ precio: number }`, pinta un `p` con `mt-3 text-base font-semibold text-zinc-50` y muestra solo `presentarPesos(precio)`.
- `components/landing/tarjeta-servicio.tsx` monta `PrecioServicio` debajo de la descripción con `servicio.precio`. No llama a `Intl`.
- `components/landing/lista-servicios.tsx` sigue iterando y pasando cada servicio a `TarjetaServicio`.
- `app/page.tsx` sigue pasando `serviciosLanding` a `Landing`.
- `app/layout.tsx` usa la descripción pedida. El título sigue siendo `Barbería`.

## Criterios de aceptación

Todos se cumplen. El formateo vive fuera de la tarjeta, el tipo es único y no se agregaron dependencias, CSS ni SVG.

## Hallazgos

Ninguno que reste puntos.
