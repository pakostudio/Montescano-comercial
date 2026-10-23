import {NextResponse} from 'next/server';
import sharp from 'sharp';

export const runtime='nodejs';
const photos:Record<string,string>={
  ascb5626:'products/1026/ascb5626-1.jpg',
  ab5341:'products/1026/ab5341-1.jpg'
};

/** Removes only the photographic backdrop connected to the image edges.
 * Internal white watch dials remain intact. Source photography is unmodified.
 */
export async function GET(_request:Request,{params}:{params:Promise<{sku:string}>}){
 const {sku}=await params;
 const source=photos[sku.toLowerCase()];
 if(!source)return new NextResponse('Not found',{status:404});
 try{
  const {join}=await import('node:path');
  const {readFile}=await import('node:fs/promises');
  const image=await readFile(join(process.cwd(),'public',source));
  const {data,info}=await sharp(image).rotate().resize({width:850,height:950,fit:'inside',withoutEnlargement:true}).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const {width:w,height:h,channels:c}=info;
  const n=w*h;
  const transparent=new Uint8Array(n),queue=new Int32Array(n);
  let start=0,end=0;
  const backdrop=(i:number)=>{
   const k=i*c,r=data[k],g=data[k+1],b=data[k+2];
   return Math.min(r,g,b)>225 && Math.max(r,g,b)-Math.min(r,g,b)<38;
  };
  const add=(i:number)=>{if(!transparent[i]&&backdrop(i)){transparent[i]=1;queue[end++]=i;}};
  for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
  for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
  while(start<end){
   const i=queue[start++],x=i%w,y=Math.floor(i/w);
   if(x>0)add(i-1);
   if(x<w-1)add(i+1);
   if(y>0)add(i-w);
   if(y<h-1)add(i+w);
  }
  const out=Buffer.alloc(n*4);
  for(let i=0;i<n;i++){
   const k=i*c,j=i*4;
   out[j]=data[k];out[j+1]=data[k+1];out[j+2]=data[k+2];
   out[j+3]=transparent[i]?0:255;
  }
  const png=await sharp(out,{raw:{width:w,height:h,channels:4}}).png({compressionLevel:9,palette:false}).toBuffer();
  return new NextResponse(new Uint8Array(png),{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=3600, s-maxage=604800','X-Content-Type-Options':'nosniff'}});
 }catch(error){
  console.error('Hero background processing failed',error instanceof Error?error.message:'unknown');
  return new NextResponse('Image unavailable',{status:503});
 }
}
