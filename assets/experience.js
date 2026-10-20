(function(){
  'use strict';
  const toggle=document.querySelector('.nav-toggle');
  const menu=document.querySelector('.mobile-nav');
  if(toggle&&menu){
    function closeMenu(restore){menu.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open menu');document.body.classList.remove('menu-open');if(restore)toggle.focus();}
    toggle.addEventListener('click',function(){if(!menu.hidden){closeMenu(true);return;}menu.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close menu');document.body.classList.add('menu-open');menu.querySelector('a').focus();});
    menu.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu(false);});
    document.addEventListener('keydown',function(e){if(menu.hidden)return;if(e.key==='Escape'){closeMenu(true);return;}if(e.key==='Tab'){const items=[toggle,...menu.querySelectorAll('a,button')];const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
    matchMedia('(min-width:761px)').addEventListener('change',function(e){if(e.matches)closeMenu(false);});
  }
  if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion:reduce)').matches){
    document.documentElement.classList.add('motion-ready');
    const io=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}});},{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
  }
  const preview=document.querySelector('.service-preview');
  if(preview){document.querySelectorAll('.service-row').forEach(function(row){function show(){document.querySelectorAll('.service-row').forEach(r=>r.classList.remove('is-active'));row.classList.add('is-active');preview.querySelector('h3').textContent=row.dataset.heading;preview.querySelector('p').textContent=row.dataset.description;preview.querySelector('.preview-label').textContent=row.dataset.label;preview.querySelector('img').src=row.dataset.image;preview.querySelector('img').alt=row.dataset.alt;preview.querySelector('.image-caption').textContent=row.dataset.caption;preview.querySelector('.preview-estimate').href='estimators/estimate.html?service='+row.dataset.service;preview.querySelector('.preview-detail').href=row.href;}row.addEventListener('mouseenter',show);row.addEventListener('focus',show);});}
  const load=document.querySelector('[data-load-reviews]');
  if(load){load.addEventListener('click',function(){const status=document.querySelector('.review-status');load.disabled=true;load.textContent='Loading Google reviews…';status.textContent='You can also read the reviews directly on Google.';const mount=document.getElementById('wally-embed');mount.setAttribute('data-wally-widget',(window.OE_CONFIG||{}).wallyWidgetId||'6987a2f9bdb8740014d7ce91');const script=document.createElement('script');script.src='https://embed.getwally.net/embed.js';script.async=true;script.onload=function(){load.hidden=true;status.textContent='If the review widget does not appear, use the Google reviews link above.';};script.onerror=function(){load.hidden=true;status.textContent='Reviews could not load here. Read them directly on Google using the link above.';};document.head.appendChild(script);});}
})();
