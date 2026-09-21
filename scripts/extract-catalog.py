"""Extract native product images with PDF coordinates; never export prices or stock."""
import csv, json, re, hashlib, io
from pathlib import Path
import pymupdf as fitz
from PIL import Image, ImageOps, ImageDraw
import openpyxl

root=Path.cwd(); audit=root/'.audit/catalog'; audit.mkdir(parents=True,exist_ok=True)
assets=root/'public/products'; assets.mkdir(parents=True,exist_ok=True)
rows=list(csv.DictReader(open(root/'.audit/fase1/sku-detected.csv')))
docs={}; records=[]; issues=[]
for r in rows:
    f=r['source']; sku=r['sku']; page=int(r['page']); slug=re.sub('[^a-z0-9]+','-',sku.lower()).strip('-')
    if f not in docs: docs[f]=fitz.open(root/f)
    p=docs[f][page-1]; boxes=p.search_for(sku)
    family=next(v for k,v in [('01 ','montescano'),('02 ','vizanti'),('03 ','kids'),('04 ','smart-watch'),('05 ','sets'),('06 ','plumas')] if k in f)
    brand='Montescano' if family in ('montescano','plumas') or (family=='sets' and page<=5) else 'Vizanti'
    # SKU row is directly beneath its image. Full-word matching excludes prefix variants.
    boxes=[b for b in boxes if p.get_textbox(b).strip()==sku]
    infos=[i for i in p.get_image_info(xrefs=True) if i['width']>45 and i['height']>70 and i['xref']]
    pairs=[]
    for box in boxes:
        cx=(box.x0+box.x1)/2
        for i in infos:
            b=fitz.Rect(i['bbox']); dx=abs((b.x0+b.x1)/2-cx); dy=box.y0-b.y1
            if -3<dy<130 and dx<95:
                pairs.append((dx+abs(dy)*.65,box,i))
    pairs.sort(key=lambda x:x[0]); chosen=pairs[0] if pairs else None
    image=None; gender=None; description=None; source_hash=hashlib.sha256((root/f).read_bytes()).hexdigest()
    review='approved'
    if chosen:
        score,box,info=chosen; b=fitz.Rect(info['bbox'])
        # Paired front/back photos: use the left (front) view of the SKU's cell.
        if family in ('kids','smart-watch'):
            cx=(box.x0+box.x1)/2
            candidates=[i for i in infos if abs((i['bbox'][1]+i['bbox'][3])/2-(b.y0+b.y1)/2)<25 and abs((i['bbox'][0]+i['bbox'][2])/2-cx)<100]
            if candidates: info=min(candidates,key=lambda i:i['bbox'][0])
        # Sets have a dedicated gift-box photograph in the second column.
        if family=='sets':
            candidates=[i for i in infos if abs((i['bbox'][1]+i['bbox'][3])/2-(b.y0+b.y1)/2)<45 and 210<i['bbox'][0]<270]
            if candidates: info=candidates[0]
            else: issues.append({'sku':sku,'reason':'set box missing'})
            row_text=p.get_textbox(fitz.Rect(0,box.y0,p.rect.width,min(box.y0+65,p.rect.height)))
            brand='Vizanti' if 'MARCA VIZANTI' in row_text.upper() else 'Montescano'
        raw=docs[f].extract_image(info['xref'])['image']; im=Image.open(io.BytesIO(raw)).convert('RGB')
        image=f'/products/{slug}.webp'; im.save(root/'public'/image.lstrip('/'), 'WEBP', quality=92)
        cx=(box.x0+box.x1)/2
        nearby=[w for w in p.get_text('words') if box.y1<w[1]<box.y1+55 and abs((w[0]+w[2])/2-cx)<65]
        for w in nearby:
            if w[4] in ['CABALLERO','DAMA','UNISEX','NIÑO','NIÑA']:
                gender={'CABALLERO':'Caballero','DAMA':'Dama','UNISEX':'Unisex','NIÑO':'Niños','NIÑA':'Niñas'}[w[4]]; break
        if family=='sets' and 'CABALLERO' in row_text: gender='Caballero'
        if score>65: issues.append({'sku':sku,'reason':'image distance','score':score})
        evidence={'sku_box':tuple(box),'image_box':info['bbox'],'image_xref':info['xref'],'width':im.width,'height':im.height,'score':score}
    else:
        issues.append({'sku':sku,'reason':'no geometric image match'}); evidence={}
    # Known ambiguous double-labelled image and sets with component substitution stay unpublished.
    public=bool(image) and sku not in ('VR5850','VR5700') and not (family=='sets' and page==8)
    description= {'montescano':'Reloj Montescano','vizanti':'Reloj Vizanti','kids':'Reloj Vizanti Kids','smart-watch':'Reloj inteligente Vizanti','sets':'Set de regalo','plumas':'Pluma Montescano'}[family]
    if gender: description+=' · '+gender.lower()
    records.append(dict(sku=sku,slug=slug,brand=brand,family=family,description=description,gender=gender,image=image,source_file=f,source_page=page,source_hash=source_hash,review_status=review,is_public=public,**evidence))

w=openpyxl.load_workbook(next(root.glob('*.xlsx')),data_only=True); displayed=set()
for row in w['Hoja1']:
    if len(row)>1 and row[1].value=='MODELO':
        displayed.update(str(c.value).strip() for c in row[2:] if c.value and re.fullmatch(r'(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]+',str(c.value)))
extras=sorted(displayed-{r['sku'] for r in records if r['family']=='montescano'})
assert len(records)==399 and len({r['sku'] for r in records})==399
assert len(extras)==28
for sku in extras:
    records.append(dict(sku=sku,slug=sku.lower(),brand='Montescano',family='montescano',description='Reloj Montescano',gender=None,image=None,source_file=next(root.glob('*.xlsx')).name,source_page=None,review_status='pending_review',is_public=False))
(audit/'records.json').write_text(json.dumps(records,ensure_ascii=False,indent=2))
(audit/'issues.json').write_text(json.dumps(issues,indent=2))
for n in range(0,399,60):
    sheet=Image.new('RGB',(1200,1200),'white'); draw=ImageDraw.Draw(sheet)
    for j,r in enumerate(records[n:n+60]):
        x=(j%10)*120; y=(j//10)*200
        if r['image']:
            im=Image.open(root/'public'/r['image'].lstrip('/')); im.thumbnail((105,155)); sheet.paste(im,(x+(120-im.width)//2,y+5))
        draw.text((x+3,y+165),r['sku'],fill='black'); draw.text((x+3,y+181),r['family'],fill='gray')
    sheet.save(audit/f'contact-{n//60}.jpg')
print(json.dumps({'total':len(records),'pdf':399,'review':len(extras),'images':sum(bool(r['image']) for r in records),'public_candidates':sum(r['is_public'] for r in records),'issues':issues},ensure_ascii=False))
