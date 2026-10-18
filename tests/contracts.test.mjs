import test from 'node:test';
import assert from 'node:assert/strict';
import {isSameOriginFormPost} from '../lib/security.ts';
import {emptyQuote,parseQuote,quoteError} from '../lib/quote.ts';

const request=(url,origin,site='same-origin')=>new Request(url,{
  method:'POST',
  headers:{...(origin?{origin}:{}),'sec-fetch-site':site,'content-type':'application/json'},
});
test('production and preview accept only their own exact HTTPS origin',()=>{
  assert.equal(isSameOriginFormPost(request('https://montescano.example/api/cotizador','https://montescano.example')),true);
  assert.equal(isSameOriginFormPost(request('https://branch-abc.vercel.app/api/leads','https://branch-abc.vercel.app')),true);
  assert.equal(isSameOriginFormPost(request('https://branch-abc.vercel.app/api/leads','https://montescano.example')),false);
  assert.equal(isSameOriginFormPost(request('https://montescano.example/api/leads','https://montescano.example.attacker.tld')),false);
  assert.equal(isSameOriginFormPost(request('https://montescano.example/api/leads',null)),false);
  assert.equal(isSameOriginFormPost(request('https://montescano.example/api/leads','https://montescano.example','cross-site')),false);
  assert.equal(isSameOriginFormPost(request('http://localhost:3000/api/leads','http://localhost:3000')),true);
});

const valid={
 ...emptyQuote,
 project_type:'Compra por volumen',
 product_interest:['Relojes'],
 approx_quantity:'24',
 customer_name:'Cliente Ejemplo',
 company:'Empresa de prueba',
 email:'PRUEBA@EXAMPLE.COM',
 phone:'5512345678',
 consent:true,
};
const id='123e4567-e89b-42d3-a456-426614174000';
test('cotizador valida una solicitud válida sin registrar nada',()=>{
  assert.equal(quoteError(valid),null);
  const result=parseQuote({...valid,request_id:id,website:''});
  assert.equal(result.email,'prueba@example.com');
  assert.equal(result.approx_quantity,'24');
});
test('cotizador rechaza solicitudes inválidas antes de la base',()=>{
  assert.match(quoteError({...valid,consent:false}),/privacidad/);
  assert.match(quoteError({...valid,approx_quantity:'0'}),/cantidad/);
  assert.throws(()=>parseQuote({...valid,request_id:'fake',website:''}));
  assert.throws(()=>parseQuote({...valid,request_id:id,website:'spam'}));
  assert.throws(()=>parseQuote({...valid,request_id:id,customer_name:'a'.repeat(121)}));
});
test('cotizador evita seleccionar más de veinte modelos',()=>{
  const items=Array.from({length:21},(_,i)=>({product_id:`123e4567-e89b-42d3-a456-${String(i).padStart(12,'0')}`}));
  assert.match(quoteError({...valid,items}),/20 modelos/);
});
