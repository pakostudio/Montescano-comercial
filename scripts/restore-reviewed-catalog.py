"""Restore the September audit from the private, reviewed plan. No stock/prices exported."""
import csv, hashlib, json, os, re
from pathlib import Path
from collections import defaultdict
from PIL import Image, ImageOps
import openpyxl

root = Path(__file__).resolve().parents[1]
source = Path(os.environ['MONTESCANO_SOURCE'])
plan = json.loads((root/'.audit/change-plan.json').read_text())
db = json.loads((root/'.audit/db-before.json').read_text())
book = source/plan['source']
assert hashlib.sha256(book.read_bytes()).hexdigest() == plan['source_hash'], 'Workbook changed'
sheet = openpyxl.load_workbook(book, read_only=True, data_only=True)['INFO WEB']
excel = defaultdict(list)
for row in sheet.iter_rows(min_row=5, values_only=True):
    sku = str(row[2] or '').strip().upper()
    if sku and re.fullmatch(r'[A-Z0-9]+', sku) and any(c.isdigit() for c in sku):
        excel[sku].append(str(row[9] or '').strip())
products = {p['sku']:p for p in db['products']}
universe = set(products)|set(excel)
assert len(universe)==535 and len(excel)==362
photos=defaultdict(list); unidentified=[]; outside=[]
for file in sorted((source/'Imagenes actualizada').iterdir()):
    if file.suffix.lower() not in {'.jpg','.jpeg','.png','.webp'}: continue
    tokens=re.findall(r'[A-Z]+[A-Z0-9]*\d[A-Z0-9]*',file.stem.upper())
    tokens=[t for t in tokens if not t.startswith('X1215')]
    matched=set(tokens)&universe
    for sku in matched: photos[sku].append(file.name)
    if not tokens: unidentified.append(file.name)
    elif not matched: outside.append(file.name)
conflicts={
 'VR5850':'Linda confirma rojo; fotos azules con nombre incorrecto. Mantener oculto.',
 'VR5700':'Asociación histórica ambigua. Mantener oculto hasta validar foto.',
 'RVR2692':'Archivo -1 es reverso; conservar fotografía anterior.',
 'TAICB64':'Foto nueva con logo BOSCH; no usar como producto genérico.',
 'WF03':'Correa nueva distinta; confirmar variante.',
 'WFA03':'Foto rosa y catálogo turquesa; confirmar variante.',
 'TADA2323':'Excel describe carátula marmoleada; no confirmada en foto.',
 'SETMCW001B':'Confirmar pluma sustituta y composición vigente.',
 'SETMCW002A':'Confirmar pluma sustituta y composición vigente.',
 'SETMCW002B':'Confirmar pluma sustituta y composición vigente.',
 'SETVC2202':'Sin pluma según Linda; confirmar vigencia individual.'}
multiple={'TADR1060','TAIDB09','TAIDB1090','TAIDB76','TAIDN04','TAIDN09','TARD5008'}
updated={p['sku'] for p in plan['updates']}
approved={p['sku'] for p in plan['images']}
images={p['product_id']:p for p in db['images'] if p['is_approved']}
for item in plan['images']:
    original=source/'Imagenes actualizada'/item['original_file']
    assert hashlib.sha256(original.read_bytes()).hexdigest()==item['original_sha256']
    target=root/item['optimized_file']
    im=ImageOps.exif_transpose(Image.open(original)).convert('RGB')
    im.save(target,'WEBP',quality=90,method=6)
    assert hashlib.sha256(target.read_bytes()).hexdigest()==item['optimized_sha256'],item['sku']
rows=[]
for sku in sorted(universe):
    p=products.get(sku); es=excel.get(sku,[]); notes=[]; actions=[]
    if not p: actions+=['NUEVO PRODUCTO','REQUIERE REVISIÓN'];notes+=['Alta interna oculta; categoría y variantes pendientes.']
    if p and not es: actions+=['FALTA EN EXCEL ACTUALIZADO','REQUIERE REVISIÓN'];notes+=['Ausencia no prueba retiro; conservar publicación anterior.']
    if len(es)>1: actions+=['POSIBLE DUPLICADO','REQUIERE REVISIÓN'];notes+=['No elegir una fila arbitrariamente.']
    if sku in conflicts: actions+=['CONFLICTO DE SKU','REQUIERE REVISIÓN'];notes+=[conflicts[sku]]
    if sku in multiple: actions+=['POSIBLE DUPLICADO','REQUIERE REVISIÓN'];notes+=['Varios frontales; conservar imagen anterior.']
    if sku in updated: actions+=['ACTUALIZAR INFORMACIÓN'];notes+=['Fuente INFO WEB Q:T. Disponibilidad comercial sin cantidades.']
    if sku in approved: actions+=['ACTUALIZAR FOTOGRAFÍA']
    if not photos[sku]: actions+=['FALTA FOTOGRAFÍA'];notes+=['Falta foto nueva con SKU exacto; conservar anterior.']
    if p and not p['is_public']: actions+=['REQUIERE REVISIÓN'];notes+=['Permanece oculto.']
    rows.append(dict(sku=sku,brand=(p or {}).get('brand') or (es[0] if len(es)==1 else ''),category=(p or {}).get('family',''),current_status=('published' if p['is_public'] else 'review' if p['review_status']=='pending_review' else 'unpublished') if p else 'no existe',excel_status='POSIBLE DUPLICADO' if len(es)>1 else 'ENCONTRADO' if es else 'FALTA EN EXCEL ACTUALIZADO',image_status='VALIDADA' if sku in approved else 'CANDIDATA; REQUIERE REVISIÓN' if photos[sku] else 'FALTA FOTOGRAFÍA ACTUALIZADA',current_image=images.get((p or {}).get('id'),{}).get('storage_path',''),new_image='; '.join(photos[sku]),action='; '.join(dict.fromkeys(actions)) or 'OK',notes=' '.join(notes)))
docs=root/'docs'
with (docs/'CATALOGO_AUDITORIA_SEPT_2026.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
(docs/'catalogo-imagenes-sept-2026.json').write_text(json.dumps(plan['images'],ensure_ascii=False,indent=2)+'\n')
(docs/'catalogo-fotos-sin-asociacion.json').write_text(json.dumps({'no_identificables':unidentified,'candidatos_fuera_universo':outside},ensure_ascii=False,indent=2)+'\n')
report=f'''# Auditoría de catálogo: septiembre de 2026

Auditoría inicial 28/09; respaldo recuperado y fuentes verificadas por SHA-256 el 29/09/2026.

## Fuentes

GitHub pakostudio/Montescano-comercial (0597ffe), Supabase PAKO esquema montescano, {plan['source']} (INFO WEB), carpeta Imagenes actualizada.
Excel SHA-256: {plan['source_hash']}.

## Totales

- Productos actuales: 427; publicados: 393; ocultos: 34 (28 pendientes originales y seis exclusiones previas).
- Excel: 363 filas, 362 SKU únicos. Universo combinado: 535.
- Fotografías preparadas y previamente revisadas por SKU: 87.
- Fichas con información inequívoca actualizable: 243.
- Nuevos: 108, exclusivamente en revisión interna sin categoría inferida.
- Ausentes del Excel: 173, se conservan; el Excel es complementario según Linda.
- SKU con foto nueva por nombre: {sum(bool(photos[s]) for s in universe)}; sin nueva: {sum(not photos[s] for s in universe)}. Esto no significa que falte la foto histórica.
- Archivos sin SKU identificable: {len(unidentified)}; candidatos fuera del universo: {len(outside)}.
- Duplicado Excel: TAID0836 (filas 359 y 360); no se selecciona una fila.
- Siete SKU con frontales múltiples: {', '.join(sorted(multiple))}.
- Alertas REQUIERE REVISIÓN en tabla: {sum('REQUIERE REVISIÓN' in r['action'] for r in rows)}. Las alertas se superponen y no equivalen al número de registros ocultos.

## Publicación y privacidad

Publicados = is_public y approved. Revisión = ocultos y pending_review. Los 28 pendientes originales y seis exclusiones previas permanecen ocultos. Tras incorporar 108 nuevos, se esperan 535 productos, 393 publicados y 142 ocultos en revisión.
Ninguna ausencia causa eliminación o baja. Las fotos ambiguas conservan la imagen anterior; las alertas del CSV no autorizan retirada comercial.
Solo stock numérico inequívoco del 24/09 determina Disponible (>0) o No disponible (=0). Sin cantidades, costos, precios ni umbrales inventados. Es una instantánea, no inventario en tiempo real.
Las características Q:T se conservan textualmente y se omiten atributos vacíos. No se inventan vínculos entre variantes.

## Decisiones humanas

'''+ '\n'.join('- '+s+': '+v for s,v in conflicts.items())+'''

Confirmar también el duplicado TAID0836, distinguir los siete frontales múltiples y validar categoría/variante y fotografía de las altas nuevas antes de publicarlas. No es necesario confirmar los 173 ausentes para conservarlos.

## Trazabilidad

catalogo-imagenes-sept-2026.json contiene product_id, SKU, marca, categoría, archivo original, URL, dimensiones y hashes original/optimizado. Conversión WebP sin recorte, deformación, síntesis ni aumento artificial de resolución. Se mantienen ID y URL existentes. Supabase continúa como fuente operativa.
La tabla CSV contiene las diez columnas solicitadas. El respaldo y el plan SQL están en .audit/septiembre-2026, excluidos de Git. Nunca se copian credenciales ni inventario exacto al reporte.

## Ejecución y QA

Pendientes de aplicación y verificación; este reporte no acredita despliegue.
'''
(docs/'CATALOGO_AUDITORIA_SEPT_2026.md').write_text(report)
print({'reviewed':len(rows),'images':len(approved),'updates':len(updated),'new':len(plan['new_products'])})
