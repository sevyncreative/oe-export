(function(){
  const nav = document.querySelector('header.nav .container');
  if(!nav) return;

  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  const links = [
    {href:'index.html',        label:'Home'},
    {href:'electrical.html',   label:'Electrical'},
    {href:'hvac.html',         label:'HVAC'},
    {href:'roofing.html',      label:'Roofing'},
    {href:'kitchen-bath.html', label:'Kitchen & Bath'},
    {href:'adu.html',          label:'ADU'},
    {href:'commercial.html',   label:'Commercial'},
  ];

  const burger = document.createElement('button');
  burger.className = 'nav-burger';
  burger.setAttribute('aria-label','Open menu');
  burger.setAttribute('aria-expanded','false');
  burger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(burger);

  const drawer = document.createElement('div');
  drawer.className = 'mnav';
  drawer.innerHTML = `
    <div class="mnav-scrim"></div>
    <aside class="mnav-panel" role="dialog" aria-label="Site menu">
      <div class="mnav-head">
        <a class="mnav-logo" href="index.html"><img src="assets/oe-logo-2026.png" alt="OE Services"/></a>
        <button class="mnav-close" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <nav class="mnav-links">
        ${links.map(l=>`<a href="${l.href}" class="${l.href.toLowerCase()===here?'is-active':''}">${l.label}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></a>`).join('')}
      </nav>
      <div class="mnav-cta">
        <a href="electrical.html" class="btn btn-primary btn-lg" style="width:100%;justify-content:center">Get instant estimate →</a>
      </div>
      <div class="mnav-contact">
        <a href="tel:18055032787">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.86 19.86 0 0 1 2.13 4.18 2 2 0 0 1 4.12 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          (805) 503-2787
        </a>
        <a href="mailto:ahernandez@oeservices.us">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
          ahernandez@oeservices.us
        </a>
      </div>
      <div class="mnav-lic">NV #0093240 · CA #1057069 · AZ ROC #354397</div>
    </aside>
  `;
  document.body.appendChild(drawer);

  const open  = () => { drawer.classList.add('is-open'); burger.classList.add('is-open'); burger.setAttribute('aria-expanded','true'); document.body.style.overflow='hidden'; };
  const close = () => { drawer.classList.remove('is-open'); burger.classList.remove('is-open'); burger.setAttribute('aria-expanded','false'); document.body.style.overflow=''; };

  burger.addEventListener('click', () => drawer.classList.contains('is-open') ? close() : open());
  drawer.querySelector('.mnav-scrim').addEventListener('click', close);
  drawer.querySelector('.mnav-close').addEventListener('click', close);
  window.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
})();
