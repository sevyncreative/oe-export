/* ═══ CONFIG ══════════════════════════════════════════════════════ */
const CONFIG = {
  formspreeId: 'YOUR_FORMSPREE_ID',
  phone:       '(805) 503-2787',
  bookingUrl:  '#',
  slotsLeft:    6,
};

/* ═══ ZIP → STATE/REGION LOOKUP ══════════════════════════════════ */
const ZIP_MAP = (function(){
  const m = {};
  const caRegions = {
    '900':'Los Angeles','901':'Los Angeles','902':'Los Angeles','903':'Los Angeles',
    '904':'Los Angeles','905':'Los Angeles','906':'Los Angeles','907':'Los Angeles',
    '908':'Los Angeles','910':'Pasadena / SGV','911':'Pasadena / SGV','912':'Glendale',
    '913':'Burbank','914':'Van Nuys','915':'Riverside / IE','916':'Sacramento',
    '917':'Riverside / IE','918':'Riverside / IE','919':'San Diego','920':'San Diego',
    '921':'San Diego','922':'Palm Springs','923':'San Bernardino','924':'San Bernardino',
    '925':'Fresno','926':'Santa Ana / OC','927':'Santa Ana / OC','928':'Anaheim / OC',
    '930':'Oxnard / Ventura','931':'Santa Barbara','932':'Bakersfield','933':'Bakersfield',
    '934':'San Luis Obispo','935':'Mojave','936':'Fresno','937':'Fresno','938':'Fresno',
    '939':'Salinas / Monterey','940':'San Francisco','941':'San Francisco',
    '942':'Sacramento','943':'Palo Alto','944':'San Mateo','945':'Oakland / East Bay',
    '946':'Oakland / East Bay','947':'Berkeley','948':'Richmond / North Bay',
    '949':'San Jose','950':'San Jose','951':'San Jose','952':'Stockton',
    '953':'Stockton','954':'Santa Rosa','955':'Eureka','956':'Sacramento',
    '957':'Sacramento','958':'Sacramento','959':'Marysville','960':'Redding','961':'Redding',
  };
  for (const [pfx, region] of Object.entries(caRegions)) m[pfx] = { state:'CA', region };

  const nvRegions = {
    '889':'Las Vegas / Clark County','890':'Las Vegas / Clark County',
    '891':'Las Vegas / Clark County','893':'Reno / Washoe County',
    '894':'Reno / Washoe County','895':'Reno / Washoe County',
    '897':'Carson City','898':'Elko / Rural NV',
  };
  for (const [pfx, region] of Object.entries(nvRegions)) m[pfx] = { state:'NV', region };

  const azRegions = {
    '850':'Phoenix Metro','851':'Phoenix Metro','852':'Phoenix Metro','853':'Phoenix Metro',
    '855':'Mesa / East Valley','856':'Tucson','857':'Tucson','859':'Show Low',
    '860':'Flagstaff','863':'Prescott','864':'Prescott','865':'Yuma',
  };
  for (const [pfx, region] of Object.entries(azRegions)) m[pfx] = { state:'AZ', region };

  return m;
})();

function zipToStateRegion(zip) {
  if (!zip || zip.length < 3) return null;
  const pfx3 = zip.slice(0,3);
  const pfx2 = zip.slice(0,2);
  if (ZIP_MAP[pfx3]) return ZIP_MAP[pfx3];
  if (pfx2 >= '90' && pfx2 <= '96') return { state:'CA', region:'California' };
  if (pfx2 === '88' || pfx2 === '89') return { state:'NV', region:'Nevada' };
  if (pfx2 === '85' || pfx2 === '86') return { state:'AZ', region:'Arizona' };
  return null;
}

/* ═══ STATE INFO ══════════════════════════════════════════════════ */
const STATE_INFO = {
  CA: { label:'California',  resNote:'CA market rates',   comNote:'CA commercial rates' },
  NV: { label:'Nevada',      resNote:'NV market rates',   comNote:'NV commercial rates' },
  AZ: { label:'Arizona',     resNote:'AZ market rates',   comNote:'AZ commercial rates' },
};

/* ═══ PROJECT DATA ════════════════════════════════════════════════ */
const RES_DATA = {
  'Detached ADU':          { emoji:'🏠', lifespan:'50+ yrs', best:'Rental income / multi-gen living' },
  'Garage Conversion ADU': { emoji:'🚗', lifespan:'40+ yrs', best:'Fastest & most cost-effective ADU' },
  'Basement ADU':          { emoji:'⬇️', lifespan:'50+ yrs', best:'In-law suite / private rental unit' },
  'Attached Addition':     { emoji:'🔗', lifespan:'50+ yrs', best:'Expanding primary living space' },
  'Junior ADU (JADU)':     { emoji:'🛏️', lifespan:'40+ yrs', best:'Low-cost entry-level ADU (max 500 sqft)' },
  'Above-Garage ADU':      { emoji:'🔝', lifespan:'45+ yrs', best:'High ROI where lot space is limited' },
};

const COM_DATA = {
  'Restaurant / Bar':           { emoji:'🍽️', lifespan:'15–20 yrs', best:'Full-service dining & hospitality',      excludes:'Equipment, hoods/vents, FF&E, liquor licensing, health dept fees' },
  'Coffee Shop / Café':         { emoji:'☕',  lifespan:'15–20 yrs', best:'Fast casual, espresso bars & bakeries',  excludes:'Espresso equipment, pastry cases, POS, furniture' },
  'Retail / Boutique':          { emoji:'🛍️', lifespan:'10–15 yrs', best:'Apparel, gifts & showroom spaces',       excludes:'Display fixtures, inventory, POS systems, signage' },
  'Salon / Med Spa':            { emoji:'💅',  lifespan:'12–18 yrs', best:'Hair, aesthetics & wellness services',   excludes:'Shampoo chairs, pedicure thrones, styling equipment, product inventory' },
  'Dental / Medical Office':    { emoji:'🦷',  lifespan:'20–25 yrs', best:'Healthcare & clinical environments',     excludes:'Dental chairs, x-ray/imaging equipment, sterilization units, medical supplies' },
  'General Office':             { emoji:'💼',  lifespan:'15–20 yrs', best:'Professional services & co-working',     excludes:'Furniture, AV equipment, structured cabling above rough-in' },
  'Gym / Fitness Studio':       { emoji:'🏋️', lifespan:'12–18 yrs', best:'Personal training, yoga & group classes',excludes:'All equipment, weights, machines, lockers' },
  'Nail Salon':                 { emoji:'💅🏼', lifespan:'10–15 yrs', best:'Nail, waxing & lash services',           excludes:'Pedicure chairs, UV lamps, nail product inventory' },
  'Childcare / Preschool':      { emoji:'👶',  lifespan:'15–20 yrs', best:'Licensed daycare & early education',     excludes:'Furniture, educational materials, outdoor play equipment, licensing fees' },
  'New Ground-Up Construction': { emoji:'🏗️', lifespan:'40–50 yrs', best:'Full site builds & commercial shells',   excludes:'Interior finish (priced separately), equipment, sitework, landscaping' },
};

/* ═══ STATE ═══════════════════════════════════════════════════════ */
let S = { step:1, track:null, state:null, region:null, zip:null, lead:{}, timeline:'', funding:'', owner:'' };

/* ═══ INIT ════════════════════════════════════════════════════════ */
document.getElementById('slots-count').textContent = CONFIG.slotsLeft;
document.getElementById('slots-remaining').textContent = CONFIG.slotsLeft;
document.getElementById('cta-book').href = CONFIG.bookingUrl;
updateProgress(1);

// ZIP live detection
function onZipInput(val) {
  const clean = val.replace(/\D/g,'');
  document.getElementById('zip').value = clean;
  const region = document.getElementById('region-display');
  if (clean.length >= 3) {
    const match = zipToStateRegion(clean);
    if (match) {
      region.value = match.state + ' — ' + match.region;
      region.style.color = '#fbbf24';
    } else {
      region.value = 'ZIP not in CA / NV / AZ';
      region.style.color = '#f87171';
    }
  } else {
    region.value = '';
    region.style.color = '';
  }
}

// Shell caveat toggle
document.querySelectorAll('input[name=com-type]').forEach(r => {
  r.addEventListener('change', () => {
    document.getElementById('shell-caveat').style.display =
      (document.querySelector('input[name=com-type]:checked')?.value === 'New Ground-Up Construction') ? 'block' : 'none';
  });
});

/* ═══ RANGE LABELS ════════════════════════════════════════════════ */
function updateRangeLabels() {
  const st = S.state.toLowerCase();
  ['r-det','r-gar','r-bas','r-att','r-jad','r-abv'].forEach(id => {
    const el = document.getElementById(id);
    const rng = document.getElementById('rng-' + id);
    if (!el || !rng) return;
    const base = parseFloat(el.dataset[st]);
    rng.textContent = '$' + Math.round(base*0.88) + '–$' + Math.round(base*1.14) + '/sqft';
  });
  ['c-rest','c-coff','c-retl','c-saln','c-dent','c-offi','c-gym','c-nail','c-child','c-shell'].forEach(id => {
    const el = document.getElementById(id);
    const rng = document.getElementById('rng-' + id);
    if (!el || !rng) return;
    const base = parseFloat(el.dataset[st]);
    rng.textContent = '$' + Math.round(base*0.85) + '–$' + Math.round(base*1.18) + '/sqft';
  });
  document.getElementById('res-state-label').textContent = S.region + ', ' + STATE_INFO[S.state].label;
  document.getElementById('com-state-label').textContent = S.region + ', ' + STATE_INFO[S.state].label;
}

/* ═══ PROGRESS ════════════════════════════════════════════════════ */
function updateProgress(step) {
  const pct = ((step-1)/4)*100;
  document.getElementById('progress-fill').style.width = pct + '%';
  for (let i=1;i<=5;i++) {
    const pd = document.getElementById('pdot-'+i);
    if (!pd) continue;
    pd.classList.remove('active','done');
    if (i < step) pd.classList.add('done');
    if (i === step) pd.classList.add('active');
  }
  for (let i=1;i<=4;i++) {
    const dl = document.getElementById('dline-'+i);
    if (dl) dl.classList.toggle('done', i < step);
  }
}

/* ═══ SHOW/HIDE ═══════════════════════════════════════════════════ */
function showStep(id) {
  ['step-1','step-2','step-3','step-4a','step-4b','step-5','step-disq'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) { el.style.display='block'; el.style.animation='none'; void el.offsetWidth; el.style.animation=''; }
  window.scrollTo({top:0,behavior:'smooth'});
}
function goBack(n) {
  const steps = {1:'step-1',2:'step-2',3:'step-3'};
  showStep(steps[n]); updateProgress(n);
}
function resetAll() { showStep('step-1'); updateProgress(1); }

/* ═══ VALIDATION HELPER ═══════════════════════════════════════════ */
function setErr(id, show) {
  const e = document.getElementById('err-'+id), i = document.getElementById(id);
  if (e) e.classList.toggle('show', show);
  if (i) i.classList.toggle('error', show);
}

/* ═══ STEP 1 ══════════════════════════════════════════════════════ */
function submitStep1() {
  let ok = true;
  ['fname','lname','address','email','phone'].forEach(f => {
    const v = document.getElementById(f).value.trim();
    let bad = !v;
    if (f==='email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) bad=true;
    setErr(f,bad); if(bad) ok=false;
  });
  const cp = document.getElementById('contact-pref').value;
  setErr('contact',!cp); if(!cp) ok=false;

  const zipVal = document.getElementById('zip').value.trim();
  const zipErr = document.getElementById('err-zip');
  const zipMatch = /^\d{5}$/.test(zipVal) ? zipToStateRegion(zipVal) : null;
  if (!zipVal || !/^\d{5}$/.test(zipVal) || !zipMatch) {
    zipErr.classList.add('show');
    zipErr.textContent = !zipVal || !/^\d{5}$/.test(zipVal)
      ? 'Enter a valid 5-digit ZIP code'
      : 'ZIP not found in our service area (CA, NV, AZ)';
    document.getElementById('zip').classList.add('error');
    ok = false;
  } else {
    zipErr.classList.remove('show');
    document.getElementById('zip').classList.remove('error');
  }

  if (!ok) return;

  S.state  = zipMatch.state;
  S.region = zipMatch.region;
  S.zip    = zipVal;
  S.lead = {
    firstName:   document.getElementById('fname').value.trim(),
    lastName:    document.getElementById('lname').value.trim(),
    address:     document.getElementById('address').value.trim(),
    zip:         zipVal,
    state:       zipMatch.state,
    region:      zipMatch.region,
    email:       document.getElementById('email').value.trim(),
    phone:       document.getElementById('phone').value.trim(),
    contactPref: document.getElementById('contact-pref').value,
  };
  updateRangeLabels();
  showStep('step-2'); updateProgress(2);
}

/* ═══ STEP 2 ══════════════════════════════════════════════════════ */
function submitStep2() {
  const tl=document.querySelector('input[name=timeline]:checked');
  const fn=document.querySelector('input[name=funding]:checked');
  const ow=document.querySelector('input[name=owner]:checked');
  let ok=true;
  if(!tl){document.getElementById('err-timeline').classList.add('show');ok=false;}else document.getElementById('err-timeline').classList.remove('show');
  if(!fn){document.getElementById('err-funding').classList.add('show');ok=false;}else document.getElementById('err-funding').classList.remove('show');
  if(!ow){document.getElementById('err-owner').classList.add('show');ok=false;}else document.getElementById('err-owner').classList.remove('show');
  if(!ok) return;
  S.timeline=tl.value; S.funding=fn.value; S.owner=ow.value;
  if(tl.value==='Just browsing'||ow.value==='No'){showStep('step-disq');return;}
  showStep('step-3'); updateProgress(3);
}

/* ═══ STEP 3 ══════════════════════════════════════════════════════ */
function submitStep3() {
  const tr=document.querySelector('input[name=track]:checked');
  if(!tr){document.getElementById('err-track').classList.add('show');return;}
  document.getElementById('err-track').classList.remove('show');
  S.track=tr.value;
  showStep(S.track==='residential'?'step-4a':'step-4b'); updateProgress(4);
}

/* ═══ STEP 4 ══════════════════════════════════════════════════════ */
function submitStep4(track) {
  const stLow = S.state.toLowerCase();

  if (track==='residential') {
    const pt=document.querySelector('input[name=res-type]:checked');
    if(!pt){document.getElementById('err-res-type').classList.add('show');return;}
    document.getElementById('err-res-type').classList.remove('show');

    const sqft     = parseInt(document.getElementById('res-sqft').value);
    const finMult  = parseFloat(document.getElementById('res-finish').value);
    const finLabel = document.getElementById('res-finish').selectedOptions[0].text;
    const cx       = document.querySelector('input[name=res-cx]:checked');
    const cxMult   = parseFloat(cx?cx.dataset.mult:1.0);
    const cxVal    = cx?cx.value:'Medium';
    const prmtVal  = parseInt(document.getElementById('res-permit').value);
    const prmtLbl  = document.getElementById('res-permit').selectedOptions[0].text;
    const base     = parseFloat(pt.dataset[stLow]);
    const typeLabel= pt.value;

    const adjPSF = base * finMult * cxMult;
    const raw    = (adjPSF * sqft) + prmtVal;
    const low    = Math.round(raw*0.88/1000)*1000;
    const high   = Math.round(raw*1.14/1000)*1000;

    const breakdown = [
      { l:'Base construction ('+sqft.toLocaleString()+' sqft × $'+Math.round(base)+'/sqft)', v:fmtR(base*sqft*0.9, base*sqft*1.1) },
      { l:'Finish level', v: finMult===1?'Baseline':(finMult>1?'+':'')+Math.round((finMult-1)*100)+'%' },
      { l:'Complexity / site', v: cxMult===1?'Baseline':(cxMult>1?'+':'')+Math.round((cxMult-1)*100)+'%' },
      { l:'Permit & design services', v: prmtVal?fmt(prmtVal):'Not included' },
      { l:'Region', v: S.zip+' — '+S.region+', '+STATE_INFO[S.state].label },
    ];
    buildResult({ typeLabel, sqft, finLabel, cxVal, permitLbl:prmtLbl, low, high, breakdown, track:'residential', data:RES_DATA[typeLabel]||{} });

  } else {
    const pt=document.querySelector('input[name=com-type]:checked');
    if(!pt){document.getElementById('err-com-type').classList.add('show');return;}
    document.getElementById('err-com-type').classList.remove('show');

    const sqft     = parseInt(document.getElementById('com-sqft').value);
    const finMult  = parseFloat(document.getElementById('com-finish').value);
    const finLabel = document.getElementById('com-finish').selectedOptions[0].text;
    const cx       = document.querySelector('input[name=com-cx]:checked');
    const cxMult   = parseFloat(cx?cx.dataset.mult:1.0);
    const cxVal    = cx?cx.value:'Demo / Rework';
    const adaVal   = parseInt(document.getElementById('com-ada').value);
    const adaLbl   = document.getElementById('com-ada').selectedOptions[0].text;
    const prmtVal  = parseInt(document.getElementById('com-permit').value);
    const prmtLbl  = document.getElementById('com-permit').selectedOptions[0].text;
    const base     = parseFloat(pt.dataset[stLow]);
    const typeLabel= pt.value;

    const adjPSF = base * finMult * cxMult;
    const raw    = (adjPSF * sqft) + adaVal + prmtVal;
    const low    = Math.round(raw*0.85/1000)*1000;
    const high   = Math.round(raw*1.20/1000)*1000;

    const breakdown = [
      { l:'Build-out labor & materials ('+sqft.toLocaleString()+' sqft × $'+Math.round(base)+'/sqft base)', v:fmtR(base*sqft*0.85, base*sqft*1.18) },
      { l:'Finish level', v: finMult===1?'Baseline':(finMult>1?'+':'')+Math.round((finMult-1)*100)+'%' },
      { l:'Site condition adjustment', v: cxMult===1?'Baseline':(cxMult>1?'+':'')+Math.round((cxMult-1)*100)+'%' },
      { l:'ADA compliance', v: adaVal?'~'+fmt(adaVal):'None required' },
      { l:'Permit & architecture', v: prmtVal?fmt(prmtVal):'Not included' },
      { l:'Region', v: S.zip+' — '+S.region+', '+STATE_INFO[S.state].label },
      { l:'⚠ Excludes', v:(COM_DATA[typeLabel]||{}).excludes||'FF&E, equipment, signage', note:true },
    ];
    buildResult({ typeLabel, sqft, finLabel, cxVal, adaLbl, permitLbl:prmtLbl, low, high, breakdown, track:'commercial', data:COM_DATA[typeLabel]||{} });
  }
}

/* ═══ BUILD RESULT ════════════════════════════════════════════════ */
function buildResult(est) {
  document.getElementById('result-range').textContent = fmt(est.low)+' – '+fmt(est.high);
  document.getElementById('result-meta').textContent  = '📍 '+S.region+', '+STATE_INFO[S.state].label+' ('+S.zip+') · '+est.sqft.toLocaleString()+' sqft · '+(est.track==='residential'?'Residential':'Commercial');
  document.getElementById('result-badge').textContent = est.typeLabel;
  document.getElementById('result-emoji').textContent = est.data.emoji||'🏗️';
  document.getElementById('result-img-label').textContent = est.typeLabel+' — Representative';

  const facts = [
    { val:est.data.lifespan||'—', label:est.track==='residential'?'Est. Lifespan':'Typ. Lifecycle' },
    { val:'5yr Labor', label:'Labor Warranty' },
    { val:est.sqft.toLocaleString()+' sqft', label:'Square Footage' },
  ];
  document.getElementById('key-facts-row').innerHTML = facts.map(f=>
    `<div class="fact-box"><div class="fact-val">${f.val}</div><div class="fact-label">${f.label}</div></div>`
  ).join('');

  const bHTML = est.breakdown.map(r=>
    `<div class="br-row${r.note?' note-row':''}"><span class="br-l">${r.l}</span><span class="br-v">${r.v}</span></div>`
  ).join('')+`<div class="br-row total"><span class="br-l">Ballpark Total Range</span><span class="br-v">${fmt(est.low)} – ${fmt(est.high)}</span></div>`;
  document.getElementById('breakdown-card').innerHTML = `<div class="breakdown-title">ESTIMATED COST BREAKDOWN</div>${bHTML}`;

  document.getElementById('result-com-caveat').style.display = est.track==='commercial'?'block':'none';

  const rows = [
    ['Client', S.lead.firstName+' '+S.lead.lastName],
    ['Property', S.lead.address],
    ['ZIP / Region', S.zip+' — '+S.region+', '+STATE_INFO[S.state].label],
    ['Project Category', est.track==='residential'?'Residential ADU':'Commercial Build-Out'],
    ['Project Type', est.typeLabel],
    ['Square Footage', est.sqft.toLocaleString()+' sqft'],
    ['Finish Level', est.finLabel],
    ['Site Condition', est.cxVal],
  ];
  if (est.adaLbl) rows.push(['ADA Scope', est.adaLbl]);
  rows.push(['Permit & Design', est.permitLbl],['Timeline', S.timeline],['Funding', S.funding],['Ballpark Range', fmt(est.low)+' – '+fmt(est.high)]);
  if (est.data.best) rows.push(['Best Suited For', est.data.best]);
  document.getElementById('summary-table').innerHTML = rows.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('');

  showStep('step-5'); updateProgress(5);
  sendLead(est);
}

/* ═══ HELPERS ═════════════════════════════════════════════════════ */
function fmt(n){ return '$'+Math.round(n).toLocaleString(); }
function fmtR(lo,hi){ return '$'+Math.round(lo/1000)*1000 .toLocaleString()+' – $'+Math.round(hi/1000)*1000 .toLocaleString(); }

/* ═══ FORMSPREE ═══════════════════════════════════════════════════ */
async function sendLead(est) {
  const statusEl = document.getElementById('lead-status');
  try {
    const res = await fetch(`https://formspree.io/f/${CONFIG.formspreeId}`,{
      method:'POST', headers:{'Content-Type':'application/json','Accept':'application/json'},
      body: JSON.stringify({
        ...S.lead, track:est.track, projectType:est.typeLabel,
        zip:S.zip, state:S.state, region:S.region,
        sqft:est.sqft, finishLevel:est.finLabel, siteCondition:est.cxVal,
        permitDesign:est.permitLbl, timeline:S.timeline, funding:S.funding,
        estimateLow:fmt(est.low), estimateHigh:fmt(est.high), timestamp:new Date().toISOString(),
      }),
    });
    if (res.ok) {
      statusEl.className='status-msg success';
      statusEl.textContent='✓ Estimate sent to our team. A specialist will call you within 2 hours to schedule your free site visit — that\'s where we lock in your real number.';
    } else throw new Error();
  } catch {
    statusEl.className='status-msg error';
    statusEl.textContent='Note: Email notification failed — our team will still follow up via your booking.';
  }
}
