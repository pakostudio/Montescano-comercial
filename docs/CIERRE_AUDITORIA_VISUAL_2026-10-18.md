# Montescano · cierre de auditoría de sitio público (sin cotizador)

**Fecha:** 18 de octubre de 2026  
**Rama aislada:** `benchmark-auditoria-2026`  
**Entorno:** Vercel Preview. Producción **no** se ha promovido.  
**Exclusión solicitada:** la verificación transaccional del cotizador (envío, folio, Resend y almacenamiento de solicitudes) se pospone. No se enviaron solicitudes de prueba.

## 1. Benchmark y dirección de diseño

Referencias de prácticas —no copia de elementos—: [Casio México](https://www.casio.com/mx/watches/), [Citizen México](https://www.citizenwatch.com/mx/es/home/), [Tissot](https://www.tissotwatches.com/es-mx/), [Swatch](https://www.swatch.com/), [NOMOS Glashütte](https://nomos-glashuette.com/en/), [TAG Heuer](https://www.tagheuer.com/mx/es/) y [Fossil](https://www.fossil.com/).

Objetivo de ejecución: una marca mexicana comercial y creíble; **Arial**, excelente contraste, fotografía real, hero dinámico reversible, movimientos cortos y útiles, filtros auténticos y **Venta de Saldos** diferenciada.

## 2. Entregables implementados

- **Home dinámica:** hero con tres SKUs aprobados, fotografías oficiales del catálogo y vínculos a ficha; carrusel automático/manual, pausa, cambio por teclado, interacción de puntero y reducción de movimiento para quienes la solicitan. El usuario puede explorar sin scroll inicial.
- **Catálogo comercial:** búsqueda por SKU/marca/descripción, categorías, filtros por género, marca, colección y disponibilidad, ordenamiento por precio o novedades, tarjetas con animación discreta.
- **Dato honesto:** retirados los filtros de movimiento y material (no aplicables con el contenido actual); no se han inventado especificaciones faltantes.
- **Saldos diferenciado:** home /saldos propia con paleta terracota+verde, fotografía de producto real, búsqueda, filtro de marca, ordenamiento y carga progresiva de tarjetas. `/saldos/[slug]` mantiene ficha aislada del catálogo regular. No mostrar simultáneamente etiquetas “Promoción” y “Saldo”.
- **Fichas de producto:** fotografías ampliables y miniaturas si existen varias fotos aprobadas, sin imágenes generadas o vistas artificiales.
- **Navegación:** eliminado el script basado en MutationObserver para insertar Saldos; enlaces ahora son parte declarativa del UI React (escritorio, móvil y pie).
- **Seguridad HTTP y rastreo:** encabezados `nosniff`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy`, HSTS, COOP y política CSP básica (`frame-ancestors`, `base-uri`, `object-src`, `form-action`). Preview: `X-Robots-Tag` y `robots.txt` no indexables.
- **Continuidad:** tiempo límite de 12 s en lectura del catálogo, sin reescribir base de datos ni credenciales. Los cambios previos de ruta origen del cotizador permanecen en la rama, pero sus pruebas E2E están aplazadas.

## 3. Auditoría de datos de catálogo (Supabase + GitHub)

| Verificación | Resultado |
|---|---|
| Referencias publicadas aprobadas | 451 |
| Catálogo regular | 405 |
| Venta de Saldos | 46 |
| Fotografías aprobadas referenciadas | 510 |
| Fotografías faltantes al contrastar rutas con archivos GitHub | **0** |
| Modelos publicados con más de una foto | 58 |
| Modelos publicados con una foto | 393 |
| Catálogo regular con género informado | 392/405 |
| Catálogo regular con material informado | 4/405 |
| Catálogo regular con movimiento informado | 0/405 |
| Descripciones vacías, precios negativos, promos que superan precio regular o estatus de disponibilidad fuera de contrato | 0 en los registros públicos revisados |
| Piezas públicas con precios visibles (regular) | 323 |
| Promociones regulares válidas | 151 |

**Conclusión UX:** sólo mantener filtros con suficientes datos. El futuro enriquecimiento de material/movimiento sería trabajo editorial pendiente, no error técnico.

## 4. Seguridad — evidencia y límites

- Supabase: RLS activo para datos de catálogo y tablas privadas; roles `anon`/`authenticated` no tienen lectura directa sobre `montescano.leads`, `montescano.quote_requests`, `montescano.quote_request_items` ni `montescano.inventory_snapshot`.
- Los RPC de ingreso de datos montescano_* se exponen con `SECURITY DEFINER` y actualmente validan token de servidor mediante hash. Esto requiere un modelo de permisos más robusto si se reemplaza la arquitectura backend. **No se revocaron privilegios sin rediseñar el contrato de llamada**, evitando romper producción u otros proyectos Supabase.
- La clave publicable de Supabase no da equivalencia a `service_role`; la app usa variables de servidor para tokens de envío.
- Los registros públicos conservan `source_file/source_page` en la tabla interna. El RPC del catálogo NO expone esas columnas, pero conviene aplicar privilegios de columna mínimos si en algún momento se expone el esquema `montescano` directamente a PostgREST.
- `SITE_URL` se mantiene para SEO/canonical. Se usa comparación estricta de origen para formularios, compatible con host de Preview y producción.
- La CSP básica restringe framing, objetos, URL base y destino de formularios; **no equivale a una CSP completa basada en nonces**, que exigiría más instrumentación y pruebas.
- No se ha ejecutado un pentest externo con OWASP ZAP ni un escaneo activo exhaustivo. Tampoco se han validado secretos históricos, cabezales HTTP por navegador físico o datos del responsable legal.

## 5. Validación observable

- Build y tests de contratos integrados en Vercel: estado `READY` / chequeo de commit exitoso.
- Firecrawl live fetch, dentro de Preview: **200 OK** en `/`, `/saldos`, `/productos/tasac3521` y `/saldos/asdb7197`. Se verificó presencia del SKU, contenido y visualizador de fotografía.
- Pruebas de interacción automatizada amplia: intento realizado, **agotó tiempo**; no se puede declarar aprobada.
- No se enviaron formularios ni se modificaron datos comerciales.
- El conector de Vercel devolvió **403** al consultar registros agrupados de errores/visualización de despliegues. Esta telemetría no puede contarse como revisada.
- Se generó captura del viewport móvil vía navegador remoto, pero no fue posible inspeccionarla directamente en esta sesión. No certificamos revisión visual humana exhaustiva.

## 6. Estado de cierre y condiciones de lanzamiento

**Cerrados en código + verificación parcial en vivo:** catálogo, separación Saldos, consistencia comercial de etiquetas, fotos existentes, módulos de galería, navegación, SEO Preview, protecciones HTTP base y datos de publicación.

**No certificados aún (fuera del alcance acordado o limitación de acceso):** cotizador E2E, auditoría legal del aviso de privacidad con denominación/RFC/domicilio ARCO, pentest externo, pruebas móviles visuales manuales multi-dispositivo, Core Web Vitals/Lighthouse medidos y telemetría privada Vercel.

**Decisión de release:** no promover a producción sin aceptación visual del responsable y cierre de seguridad externa relevante. No anunciar "100% libre de vulnerabilidades" sin una prueba que pueda fundamentarlo.
