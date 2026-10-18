# Montescano — Benchmark, auditoría y rediseño
**Fecha:** 18 de octubre de 2026  
**Ambiente:** rama `benchmark-auditoria-2026` (sin promover a producción).  
**Objetivo:** experiencia visual sobresaliente, catálogo comercial usable y seguridad razonable y verificable.

## 1. Benchmark de referencia

| Referente | Mercado | Práctica observada | Aplicación a Montescano |
|---|---|---|---|
| [Casio México](https://www.casio.com/mx/watches/) | México | Filtros completos de materiales, correa, funciones y precio | Filtrar sin recorrer todas las fichas |
| [Citizen México](https://www.citizenwatch.com/mx/es/home/) | México | Lanzamientos, colecciones, vista rápida, acceso a hombre y mujer | Producto real primero y rutas comerciales inequívocas |
| [Tissot México](https://www.tissotwatches.com/es-mx/collection.html) | México | Rejillas ordenables, especificaciones comparables y comparación | Información y precio estructurados, ordenar resultados |
| [Peyrelongue Chronos](https://www.chronos.com.mx/rolex/) | México | Fotografía editorial, historia y contacto para asesoría | Inspiración editorial sin fingir posicionamiento de Rolex |
| [NOMOS Glashütte](https://nomos-glashuette.com/en/store/watches) | Internacional | Filtros por tamaño, movimiento, función, color y material | Ficha rica y navegación de producto basada en atributos |
| [Swatch](https://www.swatch.com/en-us/watches/) | Internacional | Catálogo muy visual, filtros y ordenamiento claros | Combinación de diversión e identificación SKU |
| [TAG Heuer](https://www.tagheuer.com/mx/es/) | Internacional / MX | Colecciones y servicios separados, fotografía y branding | Marca, colecciones, Saldos y Corporativo bien diferenciados |
| [Fossil oficial](https://www.fossil.com/es-es/) | Internacional | Familias reconocibles y narrativas de campañas | Home con mensajes y productos verificables, sin IA genérica |

**Criterio:** estudiar patrones, no copiar diseños, fotografías ajenas, logos, claims o precios.

## 2. Inventario observado (Supabase, consulta de sólo lectura)

- **405** productos públicos aprobados para catálogo regular.
- **46** productos públicos aprobados para Venta de Saldos.
- **451** productos públicos aprobados en total.
- La tabla `montescano.products` posee 546 registros de distinto estado; no todos están aprobados para publicación.
- El RPC público `montescano_catalog()` excluye Saldos; `montescano_saldos()` los incluye por separado.
- No publicar existencias exactas, costos internos, márgenes, identificadores de clientes ni secretos.

## 3. Cambios implementados en esta rama

- Basado en **el catálogo comercial anterior**, sin reinstalar Luxrio.
- Hero animado que muestra **tres modelos reales aprobados**, foto/SKU coincidentes y enlaces reales a ficha. No sólo varía el fondo; hay pausa, controles de teclado, cambio manual y respeto a `prefers-reduced-motion`.
- Arial/Helvetica; contraste verde profundo + blanco y fotografías aprobadas. Motion controlado, nada de arte generativo.
- Filtros adicionales por **material y movimiento**, orden por novedades/precio y microinteracciones de navegación.
- Acceso a **Venta de Saldos** como componente React nativo, en escritorio/móvil/pie; se retiró la dependencia de `MutationObserver` para inyectar enlaces.
- Cotizador de Saldos ahora preserva su SKU y obtiene modelos de `getSaldos()`, sin intentar encontrarlos en `getCatalog()`.
- Validación de origen exacto same-origin para formularios en producción y Preview, sin depender de `SITE_URL` para la llamada POST.
- Gestión defensiva de fallos de comunicación/aviso por email: un lead registrado no debe aparecer como fallido porque el correo no se envió.
- Encabezados HTTP: `nosniff`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS y no-index en Preview.
- Se retiró el correo personal de estudio usado como fallback público, a falta de confirmación del contacto corporativo.
- Se incorporaron pruebas automáticas sin escritura a la base: **contratos de origen y validador de cotizaciones** antes del build.

## 4. Hallazgos y límites de la auditoría de seguridad

### Verificado
- Tablas privadas de leads, cotizaciones, inventario y tokens con **RLS habilitado** y sin acceso directo a roles anónimos.
- Los RPC de escritura `montescano_submit_lead`, `montescano_submit_quote` y `montescano_quote_notification` son `SECURITY DEFINER` ejecutables por roles públicos; **comprueban hash de token exclusivo del servidor** antes de escribir.
- Rate-limit para leads y cotizaciones en la función de Supabase (cinco por huella por hora), idempotencia por `request_id`, validaciones en HTTP y SQL.
- Variables secretas del entorno **no** se guardan en código: `.gitignore` excluye archivos `.env*` salvo ejemplo vacío. Este chequeo no sustituye revisar todo el historial del repositorio.
- Respuesta pública del cotizador devuelve un folio, no los datos personales completos de la solicitud.

### Riesgos y siguientes verificaciones
1. **Alta:** evaluar si los RPC `SECURITY DEFINER` requieren privilegios todavía más acotados. No revocar `anon EXECUTE` sin rediseñar el acceso del servidor: hoy el endpoint utiliza una clave publicable y token firmado.
2. **Alta:** validar, con prueba de extremo a extremo autorizada, registro, reintento, folio y entrega de notificaciones por Resend **sin contaminar leads reales**.
3. **Alta:** preparar un **aviso de privacidad integral** con datos legales correctos del responsable y mecanismo ARCO; el texto actual es informativo, no un dictamen jurídico.
4. **Alta:** confirmar WhatsApp y email **oficiales de Montescano** antes de publicarlo como contacto principal.
5. **Media:** probar accesibilidad con lector de pantalla, teclado, estado de formularios, contrastes, viewport 360–1920 y preferencia de movimiento reducido.
6. **Media:** auditar Lighthouse/Core Web Vitals y peso real de fotografías en móvil; optimizar sin falsificar la apariencia del producto.
7. **Media:** evaluar CSP estricta con nonce/permisos compatibles con Next.js y Resend; no introducir una política que rompa hidratación o scripts legítimos sin pruebas.
8. **Media:** análisis de dependencias (`npm audit`/Dependabot) y escáner dinámico controlado (OWASP ZAP) previo a producción.
9. **Media:** revisar historial de commits y protecciones de repositorio; ausencia de secretos en archivos actuales no demuestra ausencia histórica.
10. **Alta:** realizar QA con aprobación comercial del contenido y licencias de fotografía/video.

## 5. Estado de verificación

| Prueba | Estado |
|---|---|
| Validación del contrato de cotización y controles de origen | Automática dentro de `npm run build` |
| Compilación Next/TypeScript en Preview | Confirmar commit final Vercel `READY` |
| Conteos catálogo/Saldos y revisión de RLS/RPC | Revisado mediante SQL de sólo lectura |
| Hero / filtros / navegación visibles en sitio | Implementado; revisión visual humana pendiente |
| Enviar, registrar y notificar una solicitud real | Pendiente de E2E controlado |
| Pentest de penetración / ausencia absoluta de filtraciones | **No certificado** |
| Producción | **No modificada** |

## 6. Puerta de lanzamiento

No promover a producción hasta aprobar: (a) preview visual en móvil y desktop, (b) cotizador con prueba de notificación, (c) contactos y aviso de privacidad, (d) verificación de seguridad y performance con resultados medidos. Un build verde no equivale a una auditoría total aprobada.
