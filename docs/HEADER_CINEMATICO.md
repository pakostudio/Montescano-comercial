# Header cinematográfico · Luz y metal

Alcance: navegación principal y primera pantalla de inicio. Catálogo, datos, precios, fotografías de fichas y cotizador conservados.

- Protagonista: modelo Montescano TASAC3521 del catálogo publicado.
- Entrada coordinada de tipografía y producto, profundidad con cursor, flotación y luz ambiental.
- Tres ambientes de iluminación (no representan variantes de producto): azul nocturno, verde profundo y luz de plata. Disponibles con botones y gesto horizontal sobre el escenario.
- Pausa explícita, animación ambiental suspendida fuera de pantalla y respeto de `prefers-reduced-motion`.
- Composición específica para móvil; imagen servida con optimización y tamaños adaptables de Next.js.
- Sin nuevas dependencias ni variables de entorno.

## Procedencia del recurso visual

Original: `public/products/1026/tasac3521-1.jpg` (351 × 453 px), procedente del material de catálogo suministrado.
Recurso de portada: `public/hero/tasac3521-cutout.png` (1104 × 1425 px). Adaptación generada mediante la herramienta integrada `image_gen` para aislar el producto sobre transparencia. Es una adaptación promocional de la fotografía, no una nueva toma de alta resolución; la herramienta puede reinterpretar detalles finos. La fotografía original se mantiene en las fichas.

Prompt utilizado:

> Use case: background-extraction. Edit target: supplied actual Montescano TASAC3521 wristwatch catalog photo. Remove ONLY the white backdrop and make it truly transparent, clean precise silhouette. Preserve the EXACT existing watch product: blue cushion bezel, steel bracelet, dark blue textured dial, crown, hands at their existing positions, indices and Montescano logo/lettering unchanged. Same straight-on front view and complete entire bracelet, same proportions. No invented details, no new reflections, no new parts, no redesign, no text outside product, no backdrop, no cast shadow. High-quality clean edges for dark-background website hero. Output a single centered isolated watch with alpha transparency.

## Validación local

- `npm run lint`, `npm run typecheck` y `npm run build`: correctos.
- Navegador: escritorio 1440 × 900, tableta 768 × 1024, móvil 390 × 844 y 320 × 740.
- Sin desbordamiento horizontal en los tamaños revisados.
- Cambio de iluminación y pausa: estado actualizado correctamente.
- Menú móvil → Montescano: cierra el diálogo y selecciona 181 modelos.
- Catálogo completo: 451 productos cargados.
