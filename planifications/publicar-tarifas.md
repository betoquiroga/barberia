# Publicar tarifas

## Objetivo

Mostrar en la landing el precio de cada servicio que ya existe, en pesos colombianos enteros. La tarifa vive junto al catálogo fijo de `serviciosLanding` y se pinta en la tarjeta de servicio. No hay catálogo en base de datos.

## Alcance

- Agregar `precio` al tipo `Servicio` y a las tres entradas de `lib/landing/servicios.ts`.
- Formatear el entero a texto de moneda en `lib/landing/`, sin React.
- Mostrar esa tarifa en la tarjeta, con un componente hijo propio.
- Ajustar la descripción del documento para que mencione las tarifas.

## Fuera de alcance

- Tabla de servicios, migraciones, API, Server Actions o lectura de Supabase.
- Cambiar nombres, descripciones, orden o cantidad de servicios.
- Reutilizar `presentarSoles` de `lib/desempeno/presentar-montos.ts`. Esa función formatea soles peruanos en centavos y pertenece al módulo de desempeño.
- Instalar dependencias, librerías de íconos, CSS propio o SVG.
- Editar horarios, reserva, clientes o desempeño.
- Commit o despliegue.

## Suposiciones

- La página de Notion «Publicar tarifas» no tiene cuerpo. El requerimiento es el título: publicar las tarifas en la interfaz.
- `precio` es un entero en pesos colombianos, sin centavos. No se divide entre 100.
- Tarifas fijas, en este orden:

  | id | nombre | precio |
  | --- | --- | ---: |
  | `corte-clasico` | Corte clásico | 18000 |
  | `arreglo-barba` | Arreglo de barba | 12000 |
  | `corte-y-barba` | Corte y barba | 28000 |

- El combo cuesta menos que la suma de corte y barba por separado (30000). El implementador usa exactamente estos tres números.
- El texto visible sale de `Intl.NumberFormat` con locale `es-CO`, `style: "currency"` y `currency: "COP"`. Con esos valores el resultado esperado es `$ 18.000`, `$ 12.000` y `$ 28.000` (el símbolo y el espacio los define `Intl`; no se arma el string a mano).
- `minimumFractionDigits` y `maximumFractionDigits` quedan en `0` para no mostrar decimales.
- No hay estado vacío ni de error de tarifas: los tres servicios siempre traen precio.
- `app/page.tsx` sigue pasando `serviciosLanding` a `Landing`. No hace falta otra prop.

## Archivos a modificar

### `types/servicio.ts`

Responsabilidad: contrato del servicio. Agregar `precio: number` a `Servicio`, junto a `id`, `nombre` y `descripcion`.

### `lib/landing/servicios.ts`

Responsabilidad: catálogo fijo de la landing. Asignar a cada objeto el `precio` de la tabla de suposiciones. Sin formateo ni JSX.

### `components/landing/tarjeta-servicio.tsx`

Responsabilidad: nombre, descripción y tarifa de un servicio. Debajo de la descripción monta `PrecioServicio` con `servicio.precio`. La tarjeta no llama a `Intl` ni concatena el símbolo de peso.

### `app/layout.tsx`

Responsabilidad: metadata. La `description` pasa a `Corte y arreglo de barba. Consulta servicios, tarifas y horario de atención.` El `title` y el resto del layout no cambian.

## Archivos a crear

### `lib/landing/presentar-pesos.ts`

Responsabilidad: convertir un entero de pesos a texto de moneda.

- Exporta `presentarPesos(pesos: number): string`.
- Usa un `Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0, maximumFractionDigits: 0 })` creado una sola vez en el módulo.
- No importa React ni conoce `Servicio`.

### `components/landing/precio-servicio.tsx`

Responsabilidad: pintar una sola tarifa.

- Props: `{ precio: number }`.
- Renderiza un `p` con `className="mt-3 text-base font-semibold text-zinc-50"`.
- El texto es el retorno de `presentarPesos(precio)`.
- No muestra etiqueta extra («Tarifa», «Precio»): el monto formateado basta.

`lista-servicios.tsx` no cambia. Sigue iterando `servicios` y pasando cada uno a `TarjetaServicio`.

## Comportamiento visible

En `#servicios`, cada tarjeta sigue mostrando el nombre y la descripción actuales. Debajo aparece la tarifa:

- Corte clásico: `$ 18.000`
- Arreglo de barba: `$ 12.000`
- Corte y barba: `$ 28.000`

El resto de la landing (encabezado, hero, horarios, reserva) se ve igual.

## Criterios de aceptación

- Los tres servicios de la home muestran el precio de la tabla, formateado en pesos colombianos sin decimales.
- `Servicio` exige `precio`. El catálogo y la tarjeta comparten ese tipo; no hay un segundo listado de precios.
- El formateo está en `lib/landing/presentar-pesos.ts`. La tarjeta no formatea.
- `PrecioServicio` vive en su propio archivo y solo recibe el número.
- No se agregaron archivos de API, migraciones ni consultas a la base.
- No se instalaron paquetes y no hay CSS ni SVG nuevos. Solo clases de Tailwind ya usadas en el tema oscuro (`zinc`).
- `yarn` no es necesario para este cambio: no hay dependencias nuevas.
