# Montescano — catálogo comercial

Next.js App Router, TypeScript, React, Motion for React, Embla Carousel React y Supabase. Catálogo público y solicitudes comerciales; sin checkout ni cuentas de clientes.

## Desarrollo

`npm ci`, copiar `.env.example` a `.env.local` y completar las variables; `npm run dev` inicia la aplicación. `npm run build` valida TypeScript y genera el sitio. El build requiere acceso a Supabase para el sitemap. `npx tsc --noEmit` verifica tipos. `node scripts/check-release.mjs` comprueba datos y assets en el entorno de importación local.

## Estructura

- `app/`: home, fichas por SKU, información del formulario, endpoint de leads y SEO.
- `components/`: experiencia interactiva, diálogo accesible y formulario.
- `lib/`: contrato público y consulta a Supabase.
- `supabase/migrations/`: tablas aisladas en `montescano`, permisos, RLS y API.
- `scripts/`: extracción, importación y verificaciones.
- `public/products/`: imágenes WebP extraídas de las fuentes, sin páginas completas.
- `docs/assets-provenance.json`: trazabilidad pública SKU–imagen–documento.

## Supabase

Proyecto PAKO (`diqbmyqvuyollvlvjniz`). Los cambios se limitan al esquema `montescano` y a dos RPC públicas con prefijo `montescano_`. No se modifican tablas de otros productos.

`montescano_catalog()` ejecuta con permisos del solicitante y RLS; devuelve solo campos comerciales de productos publicados. 399 referencias iniciales y 28 adicionales con `pending_review`. Las referencias ambiguas permanecen sin publicar. Ninguna cantidad exacta, costo, margen o clasificación interna forma parte del contrato de datos.

`montescano_submit_lead()` permite únicamente la creación controlada desde el servidor. Valida un token exclusivo, campos, producto público, idempotencia y un máximo de cinco solicitudes por huella por hora. No existen permisos públicos para leer, modificar o eliminar leads. El endpoint Next valida origen, tamaño y datos. La huella usa HMAC y no almacena la IP original.

## Variables

- `SUPABASE_URL`: URL de PAKO.
- `SUPABASE_PUBLISHABLE_KEY`: clave publicable; no es una clave de servicio.
- `MONTESCANO_LEAD_TOKEN`: secreto exclusivo del endpoint. Su SHA-256 se almacena en `montescano.api_config`, inaccesible al público.
- `SITE_URL`: origen público canónico, necesario para validación del formulario y SEO.

No se necesita `service_role`. Las variables no usan `NEXT_PUBLIC_`. `.env*`, auditorías y originales quedan excluidos de Git y Vercel.

## Imágenes e importación

`scripts/extract-catalog.py` requiere PyMuPDF, Pillow y openpyxl. Lee los originales locales y el listado auditado de 399 SKU; extrae las imágenes nativas por geometría del PDF. No inventa ni retoca productos. Genera un registro privado, contactos para revisión y WebP. `scripts/build-import.mjs` prepara SQL por lotes y el manifiesto de procedencia. Los SQL generados se ejecutan en Supabase únicamente tras revisar las asociaciones. Las 28 referencias de Excel no se publican automáticamente.

## Despliegue

Proyecto Vercel `montescano-catalogo-comercial`, vinculado a `pakostudio/Montescano-comercial`. Configurar las cuatro variables en Production y ejecutar `vercel --prod`. `scripts/configure-vercel-env.mjs` carga variables mediante stdin sin imprimir valores; usar solo después de verificar el proyecto vinculado.

## Verificación

Validar logo, fotos, carrusel, búsqueda, filtros, modal por teclado, ficha, formulario y tamaños móvil/tablet/desktop. En producción crear un lead de prueba claramente identificado y confirmar el registro en la base; comprobar además las denegaciones anónimas y que referencias ocultas no figuren en RPC ni sitemap. Un build correcto no sustituye estas comprobaciones.

Los originales y la antigua maqueta se conservan en `.audit/legacy/` localmente; no se publican.
