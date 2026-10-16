# Montescano × Luxrio — mapa de rediseño

## Principio técnico

Luxrio se usará como **referencia visual y de interacción**, no como sustituto de la arquitectura actual.

Se conserva:
- Next.js actual.
- Supabase como fuente operativa.
- API pública `montescano_catalog()`.
- Catálogo, filtros, detalle de producto, cotizador, formularios y rutas actuales.
- GitHub + Vercel.

No se importa:
- PHP de contacto de Envato.
- carrito/checkout estáticos de Luxrio.
- imágenes demo de Envato.
- inventario exacto, costos internos ni archivos de saldos internos.

## Fuente visual Luxrio

Base: `index-3.html` del ZIP de Luxrio.

### 1. Header Luxrio → Header Montescano

Navegación propuesta:

`INICIO · MONTESCANO · VIZANTI · VIZANTI KIDS · SMART WATCH · SETS · SALDOS · CORPORATIVO · CONTACTO`

CTA derecho: `SOLICITAR INFORMACIÓN ↗`

### SALDOS: tratamiento obligatorio

`SALDOS` no se verá como una categoría más.

- Botón/píldora con fondo verde Montescano y texto blanco.
- Separación visual respecto de SETS y CORPORATIVO.
- En móvil: bloque propio `VENTA DE SALDOS`.
- Ruta independiente: `/saldos`.
- La página conservará identidad Montescano, pero con encabezado claramente distinto: `VENTA DE SALDOS` / `SELECCIÓN ESPECIAL`.
- No mezclar saldos en el catálogo normal.

## 2. Hero `hero-layout3` → Posicionamiento Montescano

Luxrio: `Time Travel`.

Montescano:
- Eyebrow: `RELOJERÍA MEXICANA DESDE 1998`.
- Título principal orientado a marca y producto.
- Producto real destacado desde Supabase.
- CTA 1: `VER COLECCIONES`.
- CTA 2: `SOLICITAR INFORMACIÓN`.
- Todas las imágenes se sustituyen por producto real Montescano/Vizanti.

## 3. `banner-layout1` → Novedades + Promociones

Dos banners editoriales:
- `NOVEDADES` → productos con `is_new`.
- `PROMOCIONES` → productos con precio promocional validado.

No se mostrarán descuentos inventados.

## 4. `High Class Timekeepers` → Colecciones destacadas

Tres bloques visuales de entrada al catálogo:
- Montescano.
- Vizanti.
- Smart Watch.

Cada bloque enlaza al catálogo ya filtrado.

## 5. `CUSTOM WATCHES` → Compra por tipo

Reutilizar la composición de tarjetas Luxrio para:
- Caballero.
- Dama.
- Vizanti Kids.
- Sets / Regalos.

Los filtros siguen siendo los actuales; solo cambia la presentación.

## 6. `process-layout1` → Corporativo y personalización

Sustituir `customize wrist watch` por:

**Proyectos corporativos y personalización**

Contenido:
- relojes, plumas y sets;
- distribuidores;
- reconocimientos e incentivos;
- personalización según modelo y cotización.

CTA principal: `COTIZAR PROYECTO ↗`.
CTA secundario: `SOLICITAR INFORMACIÓN`.

## 7. Product section Luxrio → Catálogo comercial completo

El grid Luxrio se adaptará al catálogo real de Supabase.

Debe conservar:
- búsqueda por SKU/modelo;
- filtros;
- categorías;
- Todos / Novedades / Promociones;
- ficha rápida;
- precio normal y promo cuando exista;
- disponibilidad pública;
- detalle completo;
- solicitud de información;
- cotizador.

No se trasladará el carrito de Luxrio.

## 8. Segunda zona de producto → Entrada editorial a SALDOS

En lugar de duplicar productos normales, se usará como teaser de `VENTA DE SALDOS`:

- visual claramente diferente;
- máximo 3–4 productos destacados de saldos;
- CTA: `VER VENTA DE SALDOS →`;
- nunca mezclar estos productos con el catálogo comercial normal.

## 9. `testi-layout2` → Herencia / razones para elegir Montescano

No usar testimonios ficticios.

Reconvertir el módulo en una franja editorial con información validada:
- empresa mexicana fundada en 1998;
- movimiento japonés Miyota en la línea descrita por Montescano;
- acero inoxidable en la línea principal;
- experiencia en regalos y proyectos corporativos.

## 10. Footer Luxrio → Footer Montescano

Columnas:
- Colecciones.
- Montescano.
- Corporativo.
- Contacto.
- Privacidad / información del formulario.

Mantener acceso visible a `VENTA DE SALDOS`, sin convertirlo en categoría regular.

## Rutas que se conservan

- `/`
- `/productos/[slug]`
- `/saldos`
- `/saldos/[slug]`
- `/cotizador`
- `/privacidad`

## Datos

El rediseño debe consumir exactamente la misma fuente pública de Supabase que el sitio actual. No duplicar un catálogo estático dentro del frontend.

## Orden de implementación

1. Header + navegación + SALDOS destacado.
2. Hero Luxrio adaptado.
3. Novedades / promociones.
4. Colecciones destacadas.
5. Catálogo completo.
6. Corporativo.
7. Teaser y página SALDOS.
8. Footer.
9. Responsive y accesibilidad.
10. QA contra datos actuales antes de despliegue.
