'use strict';
(() => {
  const gallery=document.querySelector('[data-gallery]');
  if (!gallery) return;
  const viewport=gallery.querySelector('.compact-window');
  const track=gallery.querySelector('.compact-track');
  const group=gallery.querySelector('.compact-group');
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const duplicate=group.cloneNode(true);
  duplicate.classList.add('compact-duplicate');
  duplicate.setAttribute('aria-hidden','true');
  duplicate.inert=true;
  duplicate.querySelectorAll('[data-original]').forEach(card=>card.removeAttribute('data-original'));
  track.append(duplicate);
  const originalCards=[...group.children];
  function sizeFlow(){
    while(group.getBoundingClientRect().width<viewport.clientWidth+1){
      originalCards.forEach(card=>{const copy=card.cloneNode(true);copy.removeAttribute('data-original');copy.setAttribute('aria-hidden','true');copy.inert=true;group.append(copy);});
    }
    duplicate.replaceChildren(...[...group.children].map(card=>{const copy=card.cloneNode(true);copy.removeAttribute('data-original');return copy;}));
    const speed=window.innerWidth<=600?27.076923:32.307692;
    gallery.style.setProperty('--gallery-duration',`${group.getBoundingClientRect().width/speed}s`);
  }
  sizeFlow();
  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(sizeFlow,150);});
  gallery.classList.add('is-ready');
  function manual(){
    if(gallery.classList.contains('is-manual'))return;
    const transform=getComputedStyle(track).transform;
    let offset=0;
    if(transform!=='none'){
      const matrix=new DOMMatrixReadOnly(transform);
      offset=((Math.abs(matrix.m41)%group.getBoundingClientRect().width)||0);
    }
    gallery.classList.add('is-manual');
    viewport.scrollLeft=offset;
  }
  function resume(){
    if(motion.matches||gallery.contains(document.activeElement))return;
    viewport.scrollLeft=0;
    gallery.classList.remove('is-manual');
  }
  gallery.addEventListener('focusin',manual);
  gallery.addEventListener('focusout',()=>setTimeout(resume,0));
  viewport.addEventListener('pointerdown',manual,{passive:true});
  document.addEventListener('pointerdown',event=>{if(!gallery.contains(event.target))resume();},{passive:true});
  viewport.addEventListener('keydown',event=>{
    const step=window.innerWidth<=600?176:210;
    if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      event.preventDefault();manual();
      if(event.key==='Home')viewport.scrollTo({left:0,behavior:'auto'});
      else if(event.key==='End')viewport.scrollTo({left:viewport.scrollWidth,behavior:'auto'});
      else viewport.scrollBy({left:event.key==='ArrowRight'?step:-step,behavior:motion.matches?'auto':'smooth'});
    }
  });
  function visibility(){gallery.classList.toggle('is-hidden',document.hidden);}
  document.addEventListener('visibilitychange',visibility);
  motion.addEventListener('change',()=>{viewport.scrollLeft=0;if(motion.matches)gallery.classList.add('is-manual');else resume();});
  if(motion.matches)gallery.classList.add('is-manual');
  visibility();

  // No gallery buttons, expansion, or duplicate visible section.
})();


// Main-product prices are supplied by Impultienda. Optional add-ons stay in checkout.
(() => {
  document.addEventListener('impultienda:upsells-ready', event => {
    const main = event.detail && event.detail.main;
    if (!main || !Number.isFinite(main.price)) return;
    const values = document.querySelector('[data-price-values]');
    const reference = document.querySelector('[data-reference-price]');
    if (values) values.hidden = false;
    if (reference) reference.hidden = !(Number.isFinite(main.original_price) && main.original_price > main.price);
    const fallback = document.querySelector('.price-fallback');
    if (fallback) fallback.hidden = true;
  });
})();

// Same UTMify configuration as the Spanish, English and German cake pages.
// Like the German edition, load advertising scripts only after consent.
(() => {
  const panel=document.getElementById('consent-panel');
  const reopen=document.getElementById('privacy-settings');
  const key='cake-it-consent-v1';
  let current=null,loaded=false;
  try{current=localStorage.getItem(key);}catch{}
  function startTracking(){
    if(loaded||current!=='accepted')return;
    loaded=true;
    window.pixelId='6ad940bb506346904dbb45fd';
    for(const path of ['pixel/pixel.js','utms/latest.js']){
      const script=document.createElement('script');
      script.src='https://cdn.utmify.com.br/scripts/'+path;
      script.async=true;script.defer=true;
      script.dataset.utmifyLoad='loading';
      script.addEventListener('load',()=>{script.dataset.utmifyLoad='loaded';});
      script.addEventListener('error',()=>{script.dataset.utmifyLoad='error';});
      if(path.startsWith('utms/'))script.setAttribute('data-utmify-prevent-subids','');
      document.head.appendChild(script);
    }
  }
  if(!['accepted','rejected'].includes(current))panel.hidden=false;
  else startTracking();
  reopen.addEventListener('click',()=>{panel.hidden=false;panel.querySelector('button').focus();});
  panel.querySelectorAll('[data-consent]').forEach(button=>button.addEventListener('click',()=>{
    const previous=current;
    current=button.dataset.consent;
    try{localStorage.setItem(key,current);}catch{}
    panel.hidden=true;
    if(current==='rejected'&&loaded){location.reload();return;}
    startTracking();
    if(previous)reopen.focus();
  }));
})();

