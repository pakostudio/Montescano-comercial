'use client';

import {useEffect} from 'react';

export default function SaldosNavLink(){
  useEffect(()=>{
    const addLinks=()=>{
      document.querySelectorAll<HTMLElement>('nav.desktop-nav').forEach(nav=>{
        if(nav.querySelector('[data-saldos-link]')) return;
        const link=document.createElement('a');
        link.href='/saldos';
        link.textContent='SALDOS';
        link.setAttribute('data-saldos-link','true');
        const before=[...nav.querySelectorAll('a')].find(a=>a.textContent?.trim()==='CORPORATIVO');
        nav.insertBefore(link,before??null);
      });
      document.querySelectorAll<HTMLElement>('nav.mobile-nav').forEach(nav=>{
        if(nav.querySelector('[data-saldos-link]')) return;
        const link=document.createElement('a');
        link.href='/saldos';
        link.textContent='Saldos';
        link.setAttribute('data-saldos-link','true');
        const before=[...nav.querySelectorAll('a')].find(a=>a.textContent?.trim()==='Corporativo');
        nav.insertBefore(link,before??null);
      });
    };
    addLinks();
    const observer=new MutationObserver(addLinks);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);
  return null;
}
