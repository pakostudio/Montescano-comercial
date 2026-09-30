# Auditoría de catálogo: septiembre de 2026

Auditoría inicial 28/09; respaldo recuperado y fuentes verificadas por SHA-256 el 29/09/2026.

## Fuentes

GitHub pakostudio/Montescano-comercial (0597ffe), Supabase PAKO esquema montescano, CATÁLOGO WEB 0226 trabajo interno 24 sept.xlsx (INFO WEB), carpeta Imagenes actualizada.
Excel SHA-256: 028801dc4b06f5cba732037daa7709d40617f3ad26bce492b37b21645c715e55.

## Totales

- Productos actuales: 427; publicados: 393; ocultos: 34 (28 pendientes originales y seis exclusiones previas).
- Excel: 363 filas, 362 SKU únicos. Universo combinado: 535.
- Fotografías preparadas y previamente revisadas por SKU: 87.
- Fichas con información inequívoca actualizable: 243.
- Nuevos: 108, exclusivamente en revisión interna sin categoría inferida.
- Ausentes del Excel: 173, se conservan; el Excel es complementario según Linda.
- SKU con foto nueva por nombre: 161; sin nueva: 374. Esto no significa que falte la foto histórica.
- Archivos sin SKU identificable: 1; candidatos fuera del universo: 364.
- Duplicado Excel: TAID0836 (filas 359 y 360); no se selecciona una fila.
- Siete SKU con frontales múltiples: TADR1060, TAIDB09, TAIDB1090, TAIDB76, TAIDN04, TAIDN09, TARD5008.
- Alertas REQUIERE REVISIÓN en tabla: 288. Las alertas se superponen y no equivalen al número de registros ocultos.

## Publicación y privacidad

Publicados = is_public y approved. Revisión = ocultos y pending_review. Los 28 pendientes originales y seis exclusiones previas permanecen ocultos. Tras incorporar 108 nuevos, se esperan 535 productos, 393 publicados y 142 ocultos en revisión.
Ninguna ausencia causa eliminación o baja. Las fotos ambiguas conservan la imagen anterior; las alertas del CSV no autorizan retirada comercial.
Solo stock numérico inequívoco del 24/09 determina Disponible (>0) o No disponible (=0). Sin cantidades, costos, precios ni umbrales inventados. Es una instantánea, no inventario en tiempo real.
Las características Q:T se conservan textualmente y se omiten atributos vacíos. No se inventan vínculos entre variantes.

## Decisiones humanas

- VR5850: Linda confirma rojo; fotos azules con nombre incorrecto. Mantener oculto.
- VR5700: Asociación histórica ambigua. Mantener oculto hasta validar foto.
- RVR2692: Archivo -1 es reverso; conservar fotografía anterior.
- TAICB64: Foto nueva con logo BOSCH; no usar como producto genérico.
- WF03: Correa nueva distinta; confirmar variante.
- WFA03: Foto rosa y catálogo turquesa; confirmar variante.
- TADA2323: Excel describe carátula marmoleada; no confirmada en foto.
- SETMCW001B: Confirmar pluma sustituta y composición vigente.
- SETMCW002A: Confirmar pluma sustituta y composición vigente.
- SETMCW002B: Confirmar pluma sustituta y composición vigente.
- SETVC2202: Sin pluma según Linda; confirmar vigencia individual.

Confirmar también el duplicado TAID0836, distinguir los siete frontales múltiples y validar categoría/variante y fotografía de las altas nuevas antes de publicarlas. No es necesario confirmar los 173 ausentes para conservarlos.

## Trazabilidad

catalogo-imagenes-sept-2026.json contiene product_id, SKU, marca, categoría, archivo original, URL, dimensiones y hashes original/optimizado. Conversión WebP sin recorte, deformación, síntesis ni aumento artificial de resolución. Se mantienen ID y URL existentes. Supabase continúa como fuente operativa.
La tabla CSV contiene las diez columnas solicitadas. El respaldo y el plan SQL están en .audit/septiembre-2026, excluidos de Git. Nunca se copian credenciales ni inventario exacto al reporte.

## Ejecución y QA

Aplicación transaccional en Supabase: 30/09/2026. Resultado: 535 productos, 393 publicados y 142 en revisión. La función pública devuelve 393 registros; no expone pendientes ni claves de precio, costo, margen, stock o existencia. Las 87 imágenes WebP conservan URL, proporción y trazabilidad al archivo fuente.

QA local: lint y build PASS. Navegación, carrusel Embla (flechas, indicadores y drag), búsqueda, filtros, Quick View, foto, cotizador con SKU y ausencia de overflow/imágenes rotas PASS en escritorio, Android/Chrome, Safari móvil y reduced motion. No se enviaron formularios ni correos durante la prueba.

Producción: commit 94840be desplegado el 30/09/2026 en https://montescano-catalogo-comercial.vercel.app. La Home pública mostró 393 referencias, logo y fotografías sin errores de carga; carrusel, indicador, búsqueda exacta TACB7088 y Quick View se comprobaron directamente.
