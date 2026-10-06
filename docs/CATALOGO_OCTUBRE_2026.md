# Catálogo actualizado — octubre de 2026

Actualización del 6 de octubre de 2026 sobre el catálogo existente. Supabase sigue siendo la fuente operativa; la app conserva navegación, categorías y cotizador.

## Fuentes y publicación

Se cotejaron los cuatro archivos originales `CATALOGO IMAGENES 01 MONTESCANO 1026 SF.xlsx`, `02 VIZANTI 1026 SF.xlsx`, `03 VIZANTI KIDS 1026 SF.xlsx` y `04 VIZANTI SMART WATCH 1026 SF.xlsx`. El maestro generado en el chat anterior no estaba adjunto. La extracción identifica 331 modelos con SKU, sin duplicados; servicios y estuches sin SKU no se cuentan como relojes.

Se actualizan 323 productos con 382 imágenes originales, 151 promociones y 4 novedades. Los Smart Watch muestran el precio normal confirmado; no se inventa una promoción. Se conservan 128 productos previamente publicados que no aparecen en los nuevos archivos. La ausencia en una fuente no causa baja.

Resultado de la consulta pública: 451 productos: Montescano 181, Vizanti 153, Kids 59, Smart Watch 4, Sets 41 y Plumas 13. Los 128 conservados mantienen su información anterior y no reciben precios de octubre inferidos.

Fuera de publicación:
- Sin existencia: TACB3525, TACB7088 y RVTD3751.
- Género contradictorio: VKO8217FR, VKO8206AS, VKO8217AF, VKO8206BS y VKL8217. Requieren confirmación de Linda.

El archivo `07 SALDO Trabajo interno.xlsx` no se importa ni publica. Inventario exacto, costos, hojas originales y respaldos permanecen fuera de Git y del sitio. Las imágenes se extrajeron sin síntesis ni aumento de resolución. `catalog-1026-public.json` registra la procedencia, fila y SHA-256 de cada imagen pública.

## Configuración

- GitHub: https://github.com/pakostudio/Montescano-comercial
- Vercel: proyecto `montescano-catalogo-comercial`, equipo `sm-soluciones-projects`.
- URL: https://montescano-catalogo-comercial.vercel.app
- Supabase: proyecto PAKO (`diqbmyqvuyollvlvjniz`), esquema `montescano`.
- `SUPABASE_URL`: `https://diqbmyqvuyollvlvjniz.supabase.co`
- `SUPABASE_PUBLISHABLE_KEY`: clave pública del proyecto; configurada en Vercel, valor no incluido en el repositorio.
- `SITE_URL`: `https://montescano-catalogo-comercial.vercel.app`
- Se conservan `MONTESCANO_LEAD_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL` y `MONTESCANO_LEAD_EMAIL`, utilizados por los formularios existentes. Sus valores no se modifican ni se publican.
- `NEXT_PUBLIC_MONTESCANO_WHATSAPP` y `NEXT_PUBLIC_MONTESCANO_EMAIL` son opciones del proyecto, pero no están configuradas en producción. No se inventaron contactos oficiales.

La API `public.montescano_catalog()` mantiene `SECURITY INVOKER` y devuelve únicamente productos públicos aprobados, con precio/promo/novedad. RLS permanece habilitado. `anon` no tiene INSERT, UPDATE ni DELETE sobre productos, imágenes, leads o solicitudes. No se necesita clave de servicio para leer el catálogo.

## Repetición y validación

La migración `20261006003916_october_catalog.sql` agrega campos y actualiza la función pública. Se aplicó en transacción. `node scripts/build-october-import.mjs` valida conteos, precios, SKU únicos y hashes, y genera `.audit/import/october.sql`. La importación preserva IDs y slugs, y es repetible sobre esta instantánea. Ejecutarla con permisos administrativos solo después de desplegar los recursos de imagen.

Verificaciones: TypeScript, lint y build correctos; dependencias de producción sin vulnerabilidades reportadas después de actualizar Next.js a 16.3.6 y source-map-js a la versión corregida. Cotejo de 323 registros contra sus fuentes y 510 URLs de imagen con respuesta 200. La lectura de Supabase usa `cache: no-store` para evitar mostrar una instantánea anterior tras una actualización; React deduplica la consulta dentro de cada petición.

No se enviaron correos ni solicitudes de cotización de prueba a terceros durante esta actualización.
