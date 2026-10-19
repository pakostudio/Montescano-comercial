import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const base=process.env.MOBILE_QA_URL;
if(!base || !base.startsWith('https://'))throw Error('MOBILE_QA_URL must be an HTTPS preview URL');
const safe=new URL(base);
const auth=safe.search;
const destination=(path)=>new URL(path+auth,safe.origin).href;
const widths=[320,375,390,430,768];
const routes=['/','/saldos','/productos/tasac3521','/saldos/asdb7197','/privacidad'];
await fs.mkdir('mobile-qa-artifacts',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const failures=[];const report=[];
const wait=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
try{
for(const width of widths){
  const context=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,isMobile:width<=430,hasTouch:width<=430});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/favicon|vercel-toolbar/i.test(m.text()))errors.push(m.text())});
  for(const route of routes){
    let row={width,route,ok:true};
    try{
      const response=await page.goto(destination(route),{waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('body').waitFor({timeout:10000});
      await wait(600);
      const met=await page.evaluate(()=>{
        const el=(selector)=>{const node=document.querySelector(selector);if(!node)return null;const r=node.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),display:getComputedStyle(node).display}};
        const offscreen=[...document.querySelectorAll('main h1, main h2, header a, main .cinema-cta, main .search-row, main .sort-box')].filter(n=>{const r=n.getBoundingClientRect();return getComputedStyle(n).display!=='none'&&r.width>0&&(r.right>innerWidth+4||r.left<-4)}).map(n=>({tag:n.tagName,text:(n.textContent||'').trim().slice(0,55),right:Math.round(n.getBoundingClientRect().right)}));
        return {viewport:innerWidth,htmlWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,font:getComputedStyle(document.body).fontFamily,h1:el('main h1'),hamburger:el('.menu-toggle'),saldosHero:el('main section'),offscreen:offscreen.slice(0,8),brokenLoadedImages:[...document.querySelectorAll('img')].filter(n=>n.complete&&!n.naturalWidth).slice(0,8).map(n=>n.getAttribute('src'))};
      });
      row.status=response?.status()??null;row.metrics=met;
      assert.equal(row.status,200,'HTTP status');
      assert(met.htmlWidth<=width+2,'Horizontal page overflow '+met.htmlWidth+'px > '+width+'px');
      assert(met.bodyWidth<=width+2,'Horizontal body overflow '+met.bodyWidth+'px > '+width+'px');
      assert(met.h1?.w>0,'Primary heading not visible');
      assert(met.offscreen.length===0,'Key text/link outside viewport '+JSON.stringify(met.offscreen));
      assert(met.brokenLoadedImages.length===0,'Broken loaded images '+JSON.stringify(met.brokenLoadedImages));
      if(route==='/'){
        assert(met.hamburger?.w>=40,'Mobile menu target less than 40px');
        await page.locator('.menu-toggle').click({timeout:10000});
        const mobile=page.locator('.mobile-nav');await mobile.waitFor({state:'visible',timeout:7000});
        assert(await mobile.getByRole('link',{name:/VENTA DE SALDOS/i}).isVisible(),'Saldos absent from mobile menu');
        const dlg=page.locator('dialog[open]');assert(await dlg.count()>0,'Menu modal not opened');
        await page.keyboard.press('Escape');await wait(150);
        assert(await page.locator('.mobile-nav').count()===0,'Menu does not close with Escape');
      }
      if(route==='/saldos'){
        const field=page.locator('input[type=search]').first();await field.fill('ASDB7197');
        const cards=page.locator('article');await cards.first().waitFor({state:'visible',timeout:5000});
        assert((await cards.count())>=1,'Saldos search did not find ASDB7197');
        assert((await cards.first().innerText()).includes('ASDB7197'),'Saldos search showed wrong model');
        await field.fill('');
      }
      if(route==='/productos/tasac3521'||route==='/saldos/asdb7197'){
        const gallery=page.locator('button[aria-label^="Ampliar fotografía"]');
        await gallery.waitFor({state:'visible',timeout:7000});
        await gallery.click({timeout:7000});
        assert(await page.locator('dialog[open]').count()>0,'Product zoom not opening');
        await page.keyboard.press('Escape');
      }
      if((width===320||width===390||width===430)&&['/','/saldos','/productos/tasac3521'].includes(route)){
        const name=route==='/'?'home':route.split('/').filter(Boolean).join('-');
        await page.screenshot({path:`mobile-qa-artifacts/${width}-${name}.png`,fullPage:false,animations:'disabled'});
      }
      row.jsErrors=errors.splice(0);
      assert(row.jsErrors.length===0,'JavaScript errors '+row.jsErrors.join(' | ').slice(0,300));
    }catch(e){row.ok=false;row.error=String(e.message||e);failures.push({width,route,error:row.error});}
    report.push(row);console.log(JSON.stringify(row));
  }
  await context.close();
}
await fs.writeFile('mobile-qa-artifacts/report.json',JSON.stringify({timestamp:new Date().toISOString(),failureCount:failures.length,report},null,2));
if(failures.length)throw Error('Mobile QA failed: '+JSON.stringify(failures));
console.log('PASS MOBILE QA: '+report.length+' viewport-route combinations');
}finally{await browser.close()}
