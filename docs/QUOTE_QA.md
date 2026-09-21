# Cotizador comercial — verificación 2026-09-21

Producción: https://montescano-catalogo-comercial.vercel.app/cotizador

- Build, TypeScript y ESLint: PASS.
- Caso A sin SKU: COT-2026-0001, guardado con cero productos; correos vendedor y prospecto entregados.
- Caso B desde SKU ASCB5626: COT-2026-0002, guardado con un producto; confirmación y WhatsApp correctos.
- Caso C en producción: empresa PRUEBA QA MONTESCANO, COT-2026-0003; dos productos ASCB5626 y ASDB5626 guardados, estado new.
- Producción: correo vendedor 01a0c498-0ef6-7579-88ec-a89ccb752bb7 y prospecto 01a0c498-0efd-7649-b790-c7387a075509 con estado delivered en Resend. Ambos contienen HTML y texto de respaldo.
- Logo del HTML entregado: URL pública HTTPS, carga confirmada en navegador (477 px naturales).
- Navegador móvil a 375 px: campos, edición, regreso, persistencia y envío confirmados; ancho documental 375 px sin desbordamiento. Botones accesibles al pie.
- WhatsApp posterior contiene folio, cantidad, ambos SKUs y número autorizado 525624492892. Se comprobó el enlace sin enviar mensajes.
- Tablas montescano.quote_requests y montescano.quote_request_items: RLS activo; anon sin SELECT/INSERT/UPDATE/DELETE directos. Creación mediante endpoint de servidor y RPC con token dedicado.
- El registro se confirma antes de notificar; fallo de correo conserva solicitud. Request ID, hash del contenido, bloqueo transaccional y clave de idempotencia por audiencia previenen duplicados.
- Se conserva el aviso existente /privacidad. No se agregó contenido legal, precios, carga de archivos ni personalizador.

Los registros de prueba están identificados; no se eliminaron datos.
