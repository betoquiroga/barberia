# Validación: desempeño mensual de barberos (frontend)

- Plan: `planifications/desempeno-mensual-barberos-frontend.md`
- Puntaje: **9**
- Veredicto: **aprobado**

## Qué se cruzó

Servicio HTTP, mensajes, montos, mover mes, resumen de filas, páginas `/desempeno` y `/desempeno/[barberoId]`, y los componentes del panel, selector, resumen, tabla, fila, ficha y mensaje. `types/desempeno.ts` se reutiliza y no se redefine.

## Corrección revisada

`components/desempeno/tabla-desempeno.tsx` importa el tipo como `TipoFilaDesempeno` y el componente como `FilaDesempeno`. `fila-desempeno.tsx` importa el tipo como `DatosFila`. El choque de nombres que impedía `tsc` queda resuelto. El typecheck informado (`yarn tsc --noEmit`) pasa.

## Criterios

| Criterio | Estado |
| --- | --- |
| Listado sin query llama `GET /api/desempeno` sin `mes` y el selector usa el mes de la respuesta | Cumple |
| Cambiar el mes hace `router.replace` a `?mes=` si el valor es `AAAA-MM` | Cumple |
| `filas: []` muestra «No hay barberos en este mes.» y el resumen en cero | Cumple |
| Céntimos a soles con `Intl.NumberFormat("es-PE")` en `presentar-montos.ts` | Cumple |
| Totales e ticket del local con división entera en `resumir-filas.ts` | Cumple |
| `activo: false` muestra «Inactivo» | Cumple |
| El nombre enlaza al detalle y esa página llama `leerDesempenoBarbero` | Cumple |
| `no_encontrado` muestra el texto del código y «Volver al mes» al listado del mismo query | Cumple |
| Error con «Reintentar» que repite la misma petición | Cumple |
| Sin dependencias nuevas, CSS propio, SVG ni cambios de API en este módulo de UI | Cumple |

## Huecos que no bajan de 7

- El reintento arma la petición otra vez en el manejador del botón, en paralelo al efecto. El comportamiento pedido se cumple.
- La tabla añade bordes de Tailwind además de `w-full text-left text-sm`. No cambia el contrato.
