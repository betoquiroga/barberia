# Validación: módulo administrativo barberos y precios

- Plan: `planifications/modulo-administrativo-barberos-precios-frontend.md`
- Puntaje: **9**
- Veredicto: **aprobado**

## Alcance

La pantalla `/administracion` existe como Server Component sin `fetch`. El panel cliente compone barberos y precios. Los servicios HTTP viven en `lib/barberos/servicio-barberos.ts` y `lib/servicios/servicio-precio.ts`. El catálogo se lee con `obtenerCatalogo` de `lib/servicios/servicio-catalogo.ts` (`GET /api/servicios`), que es la función real del archivo; el plan la nombra `leerCatalogo`. No hay enlace nuevo hacia `/administracion` en el resto de `app/`.

## Criterios

| Criterio | Resultado |
| --- | --- |
| Ruta `/administracion` y archivos del plan | Cumple |
| `POST /api/barberos` con `{ nombre, activo }` y `trim` | Cumple |
| Nombre vacío: sin `fetch`, texto de `entrada_invalida` | Cumple |
| Lista en orden de la API, `Activo`/`Inactivo`, sin editar ni borrar | Cumple |
| Carga, vacío, error y `Reintentar` en barberos | Cumple |
| Precios con `presentarSoles`, `PATCH` solo de la fila y `{ precio_centavos }` | Cumple |
| `centavosDesdeSoles`: `30` → `3000`, coma o punto, máximo dos decimales, `null` si no es entero `> 0` | Cumple |
| `0`, vacío, tres decimales o texto: sin `fetch` y mensaje de precio inválido | Cumple |
| Errores de red o JSON inválido → `supabase_inalcanzable` | Cumple |
| `CasillaActivo` reutilizada; sin hooks, íconos, CSS propio ni cliente de Supabase en la UI | Cumple |
| Un aviso por sección que no pisa el de la otra | Cumple con matiz |

## Matiz

En barberos, el aviso del formulario y el error de carga pueden verse a la vez: el fallo del `GET` no reemplaza un aviso de alta ya mostrado. El alta y el precio siguen con un aviso propio cada uno.

## Fuera de alcance

No se revisó el comportamiento en el navegador. La comparación es de código contra el plan.
