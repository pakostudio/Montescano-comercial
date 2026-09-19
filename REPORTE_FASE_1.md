# Montescano — reporte de Fase 1

19 de septiembre de 2026. Inspección local terminada. No se construyó la aplicación, no se cargó Supabase y no se desplegó. Los documentos se trataron como fuentes de datos; el alcance lo determina la solicitud del usuario.

## 1. Archivos y conteo

Se encontraron los 10 archivos indicados: ocho PDFs, un Excel y el logo PNG. Los dos PDFs Kids son idénticos por SHA-256: se cuentan una sola vez. Se extrajo texto de todas las páginas y se revisaron vistas generales de las 39 páginas no duplicadas, además de una muestra ampliada.

| Fuente | Extensión | SKU distintos detectados |
|---|---:|---:|
| CATALOGO IMAGENES 01 MONTESCANO 0826 SF.pdf | 8 páginas | 135 |
| CATALOGO IMAGENES 02 VIZANTI 0426 SF.pdf | 8 páginas | 144 |
| CATALOGO IMAGENES 03 VIZANTI KIDS 0426 SF.pdf | 6 páginas | 58 |
| CATALOGO IMAGENES 03 VIZANTI KIDS 0426 SF (1).pdf | 6 páginas | Duplicado exacto |
| CATALOGO IMAGENES 04 VIZANTI SMART WATCH 0426 SF.pdf | 1 página | 4 |
| CATALOGO IMAGENES 05 SETS Montescano y Vizanti 0526 SF.pdf | 12 páginas | 45 sets |
| CATALOGO IMAGENES 06 PLUMAS MONTESCANO SF.pdf | 2 páginas | 13 |
| Carta presentación Montescano SA de CV.pdf | 2 páginas | No aplica |
| CATALOGO IMAGENES 01 MONTESCANO 0426 CF Trabajo 0826.xlsx | 2 hojas | 163 en la presentación de Hoja1 |
| logo-montescano-final-1.png | 477 × 154 px | No aplica |

**Total de los seis catálogos: 399 SKU únicos.** El conteo conserva códigos con espacios, como `RVB 04` y `RVB 2642`. Corrige el conteo preliminar de 397, que no reconocía esos dos códigos. Son referencias detectadas, no productos aprobados para publicación.

Hoja1 contiene los 135 modelos del PDF Montescano y **28 adicionales**, de modo que el conjunto de catálogos más la presentación Excel reúne **427 referencias**. No se cuentan estuches sin código, servicios ni los relojes componentes de sets como sets adicionales. El PDF Vizanti incluye VR5850 y VR5700 en una misma zona de ficha: ambos códigos cuentan, pero su relación fotográfica requiere revisión individual.

Hoja2 es una tabla auxiliar más amplia: **728 registros y 724 códigos distintos**, con 496 filas rotuladas Montescano, 191 Vizanti, 25 Vizanti Kids y 16 sin marca. Esas etiquetas no equivalen a las seis familias comerciales. Incluye códigos con espacios y códigos sin dígitos; no debe usarse como catálogo público automático. Hay 487 códigos de esa hoja ausentes de los seis PDFs y 162 códigos de los PDFs ausentes de Hoja2. Los conteos son por código literal, sin fusionar variantes ni corregir nombres.

## 2. Información disponible y faltante

Disponible: fotografía, modelo, descripción y, en relojes/sets, género; precios y existencias como fotografía del momento de emisión. Montescano aporta grupos de acero sólido/convencional y parejas; Kids ofrece varias vistas de numerosos modelos; Sets documenta componentes; Plumas combina piezas individuales y juegos. Smart Watch incluye características, compatibilidad, materiales y garantía. Su advertencia de uso informativo, no médico, debe conservarse si se publican funciones de salud.

La carta acredita empresa mexicana, fundación en 1998 y las marcas Montescano y Vizanti. Contiene contactos y clientes históricos: falta confirmar vigencia de contactos y autorización de referencias comerciales. La afirmación general de Miyota/5 ATM no se propagará a todos los SKU. El PDF Montescano, p. 4, documenta Miyota y características para el grupo de acero sólido; debe conservarse esa procedencia y alcance.

**Personalización sí está documentada:** PDF Montescano, p. 3, menciona contratapa/carátula, logotipos, leyendas o nombres y procesos de láser, serigrafía o tampógrafo, sobre cotización. Esto respalda una sección comercial; no identifica todos los modelos compatibles. No se encontraron mínimos, plazos, capacidad de producción ni base suficiente para prometer desarrollo de producto a medida. Plumas menciona promociones por volumen.

Faltan datos normalizados por SKU: dimensiones en gran parte del catálogo, materiales completos, movimiento y resistencia específicos, relaciones de variantes/parejas confirmadas, elegibilidad de personalización, vigencia de productos y disponibilidad actual. Tampoco hay autorización de precios públicos ni de clientes, aviso de privacidad para leads, destinatario comercial confirmado o especificación oficial del verde. Se conservarán NULL y borradores donde falte evidencia.

## 3. Fotografías e identidad

| Fuente | Objetos de imagen extraíbles* | Lado largo nativo |
|---|---:|---:|
| Montescano PDF | 146 | 141–283 px |
| Vizanti PDF | 148 | 111–283 px |
| Kids PDF, sin duplicado | 115 | 180–318 px |
| Smart Watch PDF | 9 | 264–452 px |
| Sets PDF | 186 | 233–372 px |
| Plumas PDF | 16 | 322–572 px |
| Excel | 170 archivos / 173 colocaciones | 220–590 px |

\*Incluyen estuches, componentes, otras vistas y recursos repetidos; no equivalen a fotografías únicas de producto.

Hay material real utilizable para miniaturas y presentación contenida. La resolución limita detalle ampliado, pantallas de alta densidad y portada a gran formato. Excel ofrece mejores originales para Montescano, aunque tampoco fotografía de alta resolución. Renderizar un PDF más grande no recupera detalle. No se generarán imágenes ni se reconstruirán productos.

La asociación SKU–fotografía es recuperable por página/bloque y por ancla de imagen del Excel. La asignación individual completa y su validación visual se proponen para Fase 2; aún no hay una biblioteca de assets validada para publicación. Registrar fuente, página/celda, hash, dimensiones, vista y revisión. Derivados futuros: `products/<id-estable>/<sku-slug>/<image-id>/{thumb,catalog,detail}.webp`; original en almacenamiento privado. No ampliar por encima del original; `detail` solo cuando aporte calidad. Campo privado `needs_replacement_photo` para piezas insuficientes.

El logo entregado tiene transparencia y trazos blancos: desaparece sobre blanco. Conservarlo intacto exige un soporte con contraste, o recibir una versión oficial oscura. No redibujar ni recolorear por inferencia. El verde del catálogo es una referencia visual, no una especificación de marca confirmada.

## 4. Inconsistencias y tratamiento

- Excel Hoja1: 136 celdas con `#N/A`, 121 con `#DIV/0!` y 3 con `#VALUE!` en valores guardados. Hoja2: 1,262 celdas con `#N/A`. No se recalculó ni modificó el archivo.
- Hay vínculos a otros libros no proporcionados; los valores guardados no certifican vigencia. Hoja2 repite `TACB9002A`, `TADP9002A`, `TAIC6134` y `TAFC4935`; resolver antes de importar.
- El PDF Montescano conserva descripciones `#N/D`; no convertirlas en texto comercial. Los sufijos de nombres de archivo no garantizan ausencia de datos sensibles: hay precios, existencias y codificación de colores.
- Los 28 modelos adicionales del Excel deben revisarse antes de sumarlos al surtido publicado; no inferir que el PDF los elimina por error.
- Sets, p. 8, advierte sustitución de una pluma agotada. La foto no garantiza la composición actual; validar antes de publicar cada conjunto afectado.
- Plumas distingue juegos BP/RP y existencias dependientes de componentes. No confundir un juego con una pluma individual ni calcular disponibilidad pública desde estas cifras históricas.
- La copia de auditoría y los originales permanecerán fuera del repositorio público, del directorio `public/` y de cualquier bucket público. Solo podrán publicarse fotografías y campos aprobados.

## 5. Arquitectura propuesta

**Next.js + TypeScript + React + Tailwind**, con Supabase como única fuente de productos. Una aplicación modular, sin carrito, checkout ni panel administrativo en esta etapa.

Navegación fija: Inicio; Colecciones (Montescano, Vizanti, Vizanti Kids, Smart Watch, Sets, Plumas); Institucional / Personalización; Contacto. Las nueve áreas solicitadas quedan accesibles, agrupando familias para evitar saturar la barra.

- `/`: portada con producto real, presentación breve, colecciones, sección corporativa y contacto. CTA «Ver colecciones» y «Soluciones corporativas».
- `/colecciones/[slug]`: selección editorial inicial, búsqueda por SKU y filtros sustentados por datos.
- `/productos/[slug]`: ficha con URL propia para compartir y SEO; foto, datos conocidos, relacionados verificados y solicitud con SKU preseleccionado.
- `/institucional`: procesos documentados, modelos aptos cuando se confirmen y CTA «Cotizar proyecto».
- `/contacto`: formulario y confirmación de recepción solo después de guardar el lead.

Contenido renderizado en servidor; interactividad limitada a búsqueda, filtros, galería y formulario. Metadata, Open Graph, sitemap solo de productos públicos, robots, imágenes dimensionadas, carga diferida, foco visible, navegación por teclado y respeto a movimiento reducido. Fondo claro, tipografía sans-serif, grafito y acentos moderados; la portada debe ajustarse a la calidad real de las fotos.

Flujo de leads: navegador → endpoint del servidor con validación, límites de tamaño, control de abuso e idempotencia → tabla privada. Sin email, WhatsApp o CRM externo hasta autorización. La futura administración podrá usar las mismas entidades con permisos propios.

## 6. Esquema Supabase propuesto, sin ejecutar

IDs UUID, claves foráneas, timestamps y restricciones. SKU original preservado; slug separado para URLs. Validar unicidad por marca y SKU antes de definir la restricción final. Una variante con SKU propio es un producto propio vinculado, para no duplicar inventario.

| Entidad | Contenido / relaciones |
|---|---|
| `brands` | Nombre, slug; inicialmente Montescano y Vizanti. Kids/Smart Watch como líneas/categorías, sujeto a aprobación. |
| `categories` | Nombre, slug, jerarquía, orden. |
| `products` | `id`, `sku`, `brand_id`, `category_id`, `slug`, `name`, `description`, `gender`, `material`, `movement`, `water_resistance`, `availability_status`, `public_price`, `show_price`, `is_public`, `is_featured`, `sort_order`, `created_at`, `updated_at`. |
| `product_images` | Producto, ruta del derivado aprobado, vista, alt, dimensiones y orden. |
| `product_variants` | Producto, producto relacionado, grupo y tipo de relación confirmada. |
| `product_features` | Producto, característica, valor/unidad y orden. Procedencia asociada en esquema privado. |
| `commercial_collections` + `collection_products` | Colecciones editoriales y relación muchos a muchos con productos. |
| `product_components` | Set/juego, componente, cantidad y observación aprobada. Permite componentes documentados aún sin SKU. |
| `corporate_projects` + `corporate_project_products` | Soluciones corporativas editoriales y modelos compatibles aprobados. No datos de pedidos o clientes privados. |
| `public_references` | Caso autorizado, texto/logo, `public_reference=false` por defecto. Evidencia de autorización en esquema privado. |
| `site_content` | Empresa, bloques comerciales y contactos editables/aprobados. |
| `private.leads` | Nombre, empresa, cargo, email, teléfono, tipo de interés, mensaje, producto opcional, fecha y versión del aviso/consentimiento. |
| `private.product_internal` | Existencias exactas, costos, márgenes, clasificación, ventas y observaciones, separado del producto público. |
| `private.source_documents`, `private.source_records`, `private.asset_sources` | Huella del original, página/celda, datos fuente, incidencias, asociación fotográfica y estado de revisión. |

`availability_status`: `available`, `limited`, `on_request`, `unavailable`; la ausencia de dato queda NULL y la UI invita a consultar sin afirmar stock. No automatizar estado desde inventarios históricos. Precios deshabilitados por defecto (`show_price=false`, `public_price=NULL`); un precio futuro publicable incluirá moneda y tratamiento fiscal confirmado. Restricción para impedir conservar `public_price` no nulo cuando `show_price=false`; precios no publicables siempre privados.

**Acceso:** RLS y permisos explícitos; lectura pública únicamente de filas publicadas. Imágenes, características y relaciones deben exigir que sus productos vinculados también sean públicos. Sin escrituras anónimas sobre el catálogo, sin lectura pública de leads y sin acceso de `anon`/`authenticated` a esquemas privados. Autenticarse no concede administración. Ninguna clave privilegiada en navegador. Fotos públicas solo una vez aprobadas; despublicación debe retirar también el asset público cuando corresponda.

RLS filtra filas, no sustituye la separación de columnas confidenciales. Las vistas, si se utilizan, deberán respetar RLS y permisos. Base técnica consultada: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security) y [seguridad de la API](https://supabase.com/docs/guides/api/securing-your-api). En implementación se probarán denegaciones reales por API, no solo el ocultamiento visual.

## 7. Repositorio propuesto

```text
src/app/                  rutas públicas, metadata y endpoint de leads
src/components/           navegación, catálogo, ficha, formularios
src/features/catalog/     consultas y contratos de datos
src/features/leads/       validación y persistencia
src/lib/supabase/          clientes y configuración de servidor
src/content/              estructura de contenido, sin catálogo hardcodeado
supabase/migrations/      esquema, permisos y políticas versionados
supabase/tests/           pruebas de privacidad y publicación
scripts/import/           extracción, validación y carga explícita
docs/                     arquitectura, diccionario y procedimiento editorial
public/brand/             únicamente identidad aprobada
.env.example              nombres de variables, nunca secretos
README.md                 instalación, datos, imágenes, variables y despliegue
```

GitHub para código y migraciones; Vercel para aplicación; Supabase para datos y Storage. Originales, auditorías con información interna, exportaciones y secretos excluidos de Git y despliegue. Variables previstas: URL Supabase, clave publicable, secreto únicamente de servidor para operaciones acotadas y URL canónica del sitio. Los recursos remotos no se han creado ni modificado.

## 8. Decisiones para aprobar antes de Fase 2

1. **Surtido base:** propongo 399 referencias de los PDFs como universo inicial de revisión; 28 adicionales del Excel pendientes. Ninguna se publica automáticamente por aparecer en una fuente.
2. **Presentación fotográfica:** avanzar con las fotos reales a tamaño contenido, marcando reposición futura; no prometer zoom ni portada sobredimensionada. Confirmar si existen originales mejores.
3. **Identidad:** facilitar versión oficial oscura del logo o aprobar un soporte de contraste para el PNG blanco existente; confirmar verde oficial.
4. **Datos públicos:** propongo precios ocultos, cantidades exactas privadas y referencias de clientes desactivadas. Confirmar contactos vigentes y contenido del aviso de privacidad antes de habilitar leads.
5. **Arquitectura:** aprobar navegación y separación público/privado propuestas. La Fase 2 comenzaría con conciliación de datos, biblioteca SKU–imagen validada y diseño revisable; sin despliegue ni carga remota automática.

**Detención solicitada:** Fase 1 finalizada. Se requiere aprobación del usuario para continuar.
