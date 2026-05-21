/* OE Services — Estimator UI Controller */

var S = {
  first:'', last:'', phone:'', email:'',
  street:'', city:'', state:'', zip:'',
  service:'', details:{}, result:{}
};
var currentStep = 1;
var region = null;

/* ── Init ──────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {
  // deep link ?service=...
  var params = new URLSearchParams(window.location.search);
  var svc = params.get('service');
  if (svc) {
    var card = document.querySelector('.svc-card[data-svc="' + svc + '"]');
    if (card) { card.classList.add('on'); S.service = svc; }
  }

  // phone formatter
  var phoneEl = document.getElementById('phone');
  if (phoneEl) phoneEl.addEventListener('input', function() { formatPhone(this); });

  // ZIP live region detection
  var zipEl = document.getElementById('zip');
  if (zipEl) zipEl.addEventListener('input', function() {
    var z = this.value.replace(/\D/g,'').slice(0,5);
    this.value = z;
    if (z.length === 5) {
      region = resolveZip(z);
      var tag = document.getElementById('regionTag');
      if (tag) { tag.textContent = '📍 ' + region.name; tag.style.display = 'inline-block'; }
    }
  });

  // service card clicks (step 2)
  document.querySelectorAll('.svc-card').forEach(function(c) {
    c.addEventListener('click', function() {
      document.querySelectorAll('.svc-card').forEach(function(x){ x.classList.remove('on'); });
      c.classList.add('on');
      S.service = c.dataset.svc;
    });
  });

  // chip toggles
  document.querySelectorAll('.chips').forEach(function(group) {
    group.addEventListener('click', function(e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      chip.classList.toggle('on');
      if (group.id === 'kb-room-chips') updateKbScopes();
    });
  });

  // ropt single-select
  document.querySelectorAll('.ropt-group').forEach(function(group) {
    group.addEventListener('click', function(e) {
      var opt = e.target.closest('.ropt');
      if (!opt) return;
      group.querySelectorAll('.ropt').forEach(function(r){ r.classList.remove('on'); });
      opt.classList.add('on');
    });
  });

  // scope card single-select
  document.querySelectorAll('.scope-grid').forEach(function(grid) {
    grid.addEventListener('click', function(e) {
      var card = e.target.closest('.scope-card');
      if (!card) return;
      grid.querySelectorAll('.scope-card').forEach(function(c){ c.classList.remove('on'); });
      card.classList.add('on');
    });
  });

  // shell caveat for commercial type
  var comTypeGroup = document.getElementById('com-type');
  if (comTypeGroup) {
    comTypeGroup.addEventListener('click', function(e) {
      var opt = e.target.closest('.ropt');
      if (!opt) return;
      var caveat = document.getElementById('shell-caveat');
      if (caveat) caveat.style.display = opt.dataset.val === 'shell' ? 'block' : 'none';
    });
  }

  goStep(1);
});

/* ── Phone formatter ───────────────────────────────────────────────── */
function formatPhone(el) {
  var digits = el.value.replace(/\D/g,'').slice(0,10);
  var fmt = digits;
  if (digits.length >= 7) fmt = '(' + digits.slice(0,3) + ') ' + digits.slice(3,6) + '-' + digits.slice(6);
  else if (digits.length >= 4) fmt = '(' + digits.slice(0,3) + ') ' + digits.slice(3);
  else if (digits.length >= 1) fmt = '(' + digits;
  el.value = fmt;
}

/* ── Step navigation ───────────────────────────────────────────────── */
function goStep(n) {
  currentStep = n;
  document.querySelectorAll('.est-step').forEach(function(s){ s.classList.remove('active'); });
  var step = document.getElementById('s' + n);
  if (step) step.classList.add('active');
  // progress bar
  var fill = document.getElementById('progFill');
  if (fill) fill.style.width = (n / 5 * 100) + '%';
  // pips
  for (var i = 1; i <= 5; i++) {
    var pip = document.getElementById('pip' + i);
    if (!pip) continue;
    pip.className = 'est-pip';
    if (i < n) { pip.classList.add('done'); pip.textContent = '✓'; }
    else if (i === n) { pip.classList.add('active'); pip.textContent = i; }
    else { pip.textContent = i; }
  }
  window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ── Step 1: Your info ─────────────────────────────────────────────── */
function step1Next() {
  var first  = v('first'), last = v('last');
  var phone  = v('phone'), email = v('email');
  var street = v('street'), city = v('city');
  var state  = v('state').toUpperCase(), zip = v('zip');
  var ok = true;
  se('err-name',   !first || !last,  'Please enter your first and last name.');
  if (!first || !last) ok = false;
  se('err-contact', !phone && !email, 'Please enter a phone number or email address.');
  if (!phone && !email) ok = false;
  se('err-street',  !street, 'Please enter your street address.');
  if (!street) ok = false;
  se('err-city',    !city,   'Please enter your city.');
  if (!city) ok = false;
  se('err-state',   !/^[A-Za-z]{2}$/.test(state), 'Please enter a 2-letter state code (e.g. NV).');
  if (!/^[A-Za-z]{2}$/.test(state)) ok = false;
  se('err-zip',     !/^\d{5}$/.test(zip), 'Please enter a valid 5-digit ZIP code.');
  if (!/^\d{5}$/.test(zip)) ok = false;
  if (!ok) return;
  S.first = first; S.last = last; S.phone = phone; S.email = email;
  S.street = street; S.city = city; S.state = state; S.zip = zip;
  region = resolveZip(zip);
  goStep(2);
}

/* ── Step 2: Service ───────────────────────────────────────────────── */
function step2Next() {
  if (!S.service) { se('err-svc', true, 'Please select a service.'); return; }
  se('err-svc', false);
  // Show the right detail panel
  document.querySelectorAll('.svc-panel').forEach(function(p){ p.classList.remove('show'); });
  var panel = document.getElementById('p-' + S.service);
  if (panel) panel.classList.add('show');
  var titles = {
    electrical:'Tell us about your electrical project',
    hvac:'Tell us about your HVAC project',
    roofing:'Tell us about your roof',
    'kitchen-bath':'Tell us about your remodel',
    adu:'Tell us about your ADU or addition',
    commercial:'Tell us about your commercial space'
  };
  var t = document.getElementById('s3-title');
  if (t) t.textContent = titles[S.service] || 'Tell us about your project';
  goStep(3);
}

/* ── Step 3: Details ───────────────────────────────────────────────── */
function step3Next() {
  var ok = false;
  if (S.service === 'electrical') ok = validateElectrical();
  else if (S.service === 'hvac')  ok = validateHVAC();
  else if (S.service === 'roofing') ok = validateRoofing();
  else if (S.service === 'kitchen-bath') ok = validateKB();
  else if (S.service === 'adu') ok = validateADU();
  else if (S.service === 'commercial') ok = validateCommercial();
  if (!ok) return;
  buildEstimate();
  goStep(4);
}

/* ── Validation helpers ────────────────────────────────────────────── */
function v(id) {
  var el = document.getElementById(id);
  return el ? el.value.trim() : '';
}
function se(id, show, msg) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('show', !!show);
  if (msg) el.textContent = msg;
}
function getChips(groupId) {
  return Array.from(document.querySelectorAll('#' + groupId + ' .chip.on')).map(function(c){ return c.dataset.val; });
}
function getOpt(groupId) {
  var el = document.querySelector('#' + groupId + ' .ropt.on');
  return el ? el.dataset.val : null;
}

function validateElectrical() {
  var svcs = getChips('elec-chips');
  se('err-elec-svc', !svcs.length, 'Please select at least one service.');
  if (!svcs.length) return false;
  var ok = true;
  ['err-elec-prop','err-elec-sqft','err-elec-owner','err-elec-age','err-elec-access','err-elec-tl'].forEach(function(id, i) {
    var groups = ['elec-prop','elec-sqft','elec-owner','elec-age','elec-access','elec-tl'];
    var val = getOpt(groups[i]);
    se(id, !val, 'Please make a selection.');
    if (!val) ok = false;
  });
  if (!ok) return false;
  S.details = {
    services: svcs,
    property: getOpt('elec-prop'),
    sqft:     getOpt('elec-sqft'),
    owner:    getOpt('elec-owner'),
    age:      getOpt('elec-age'),
    access:   getOpt('elec-access'),
    timeline: getOpt('elec-tl')
  };
  return true;
}

function validateHVAC() {
  var svcs = getChips('hvac-chips');
  se('err-hvac-svc', !svcs.length, 'Please select at least one service.');
  if (!svcs.length) return false;
  var ok = true;
  ['err-hvac-prop','err-hvac-sqft','err-hvac-owner','err-hvac-age','err-hvac-access','err-hvac-tl'].forEach(function(id, i) {
    var groups = ['hvac-prop','hvac-sqft','hvac-owner','hvac-age','hvac-access','hvac-tl'];
    var val = getOpt(groups[i]);
    se(id, !val, 'Please make a selection.');
    if (!val) ok = false;
  });
  if (!ok) return false;
  S.details = {
    services: svcs,
    property: getOpt('hvac-prop'),
    sqft:     getOpt('hvac-sqft'),
    owner:    getOpt('hvac-owner'),
    age:      getOpt('hvac-age'),
    access:   getOpt('hvac-access'),
    timeline: getOpt('hvac-tl')
  };
  return true;
}

function validateRoofing() {
  var sqftEl = document.getElementById('roof-sqft');
  var sqft = sqftEl ? parseInt(sqftEl.value) : 0;
  var mat = getOpt('roof-mat'), pitch = getOpt('roof-pitch');
  var stories = getOpt('roof-stories'), layers = getOpt('roof-layers');
  var prop = getOpt('roof-prop');
  se('err-roof-sqft',    !sqft || sqft < 200, 'Please enter a roof area of at least 200 sqft.');
  se('err-roof-mat',     !mat,    'Please select a material.');
  se('err-roof-pitch',   !pitch,  'Please select a pitch.');
  se('err-roof-stories', !stories,'Please select stories.');
  se('err-roof-layers',  !layers, 'Please select number of existing layers.');
  se('err-roof-prop',    !prop,   'Please select a property type.');
  if (!sqft || sqft < 200 || !mat || !pitch || !stories || !layers || !prop) return false;
  S.details = {sqft:sqft, material:mat, pitch:pitch, stories:stories, layers:layers, property:prop};
  return true;
}

function validateKB() {
  var kitchen = document.querySelector('#kb-kitchen-scope .scope-card.on');
  var bath    = document.querySelector('#kb-bath-scope .scope-card.on');
  var rooms   = getChips('kb-room-chips');
  se('err-kb-rooms', !rooms.length, 'Please select at least one room.');
  if (!rooms.length) return false;
  var ok = true;
  if (rooms.indexOf('kitchen') >= 0 && !kitchen) {
    se('err-kb-kitchen', true, 'Please select a kitchen scope.'); ok = false;
  } else { se('err-kb-kitchen', false); }
  if (rooms.indexOf('bath') >= 0 && !bath) {
    se('err-kb-bath', true, 'Please select a bathroom scope.'); ok = false;
  } else { se('err-kb-bath', false); }
  if (!ok) return false;
  S.details = {
    kitchen: kitchen ? kitchen.dataset.val : null,
    bath:    bath    ? bath.dataset.val    : null
  };
  return true;
}

function validateADU() {
  var type   = getOpt('adu-type');
  var sqftEl = document.getElementById('adu-sqft');
  var sqft   = sqftEl ? parseInt(sqftEl.value) : 0;
  var finish = getOpt('adu-finish');
  var site   = getOpt('adu-site');
  se('err-adu-type',   !type,           'Please select a project type.');
  se('err-adu-sqft',   !sqft || sqft < 100, 'Please enter a square footage (minimum 100).');
  se('err-adu-finish', !finish,         'Please select a finish level.');
  se('err-adu-site',   !site,           'Please select a site complexity.');
  if (!type || !sqft || sqft < 100 || !finish || !site) return false;
  S.details = {type:type, sqft:sqft, finish:finish, site:site};
  return true;
}

function validateCommercial() {
  var type   = getOpt('com-type');
  var sqftEl = document.getElementById('com-sqft');
  var sqft   = sqftEl ? parseInt(sqftEl.value) : 0;
  var finish = getOpt('com-finish');
  var site   = getOpt('com-site');
  var ada    = getOpt('com-ada');
  var permit = getOpt('com-permit');
  se('err-com-type',   !type,              'Please select a business type.');
  se('err-com-sqft',   !sqft || sqft < 100,'Please enter a square footage (minimum 100).');
  se('err-com-finish', !finish,            'Please select a finish level.');
  se('err-com-site',   !site,              'Please select the existing space condition.');
  se('err-com-ada',    !ada,               'Please select an ADA scope.');
  se('err-com-permit', !permit,            'Please select a permit budget.');
  if (!type || !sqft || sqft < 100 || !finish || !site || !ada || !permit) return false;
  S.details = {type:type, sqft:sqft, finish:finish, site:site, ada:ada, permit:permit};
  return true;
}

/* ── Kitchen-bath scope show/hide ──────────────────────────────────── */
function updateKbScopes() {
  var rooms = getChips('kb-room-chips');
  var kBlock = document.getElementById('kb-kitchen-scope');
  var bBlock = document.getElementById('kb-bath-scope');
  var badge  = document.getElementById('bundle-badge');
  if (kBlock) kBlock.style.display = rooms.indexOf('kitchen') >= 0 ? 'block' : 'none';
  if (bBlock) bBlock.style.display = rooms.indexOf('bath') >= 0 ? 'block' : 'none';
  if (badge)  badge.style.display  = (rooms.indexOf('kitchen') >= 0 && rooms.indexOf('bath') >= 0) ? 'block' : 'none';
}

/* ── Build & render estimate ───────────────────────────────────────── */
function buildEstimate() {
  var reg = region || resolveZip(S.zip);
  var result, html;

  if (S.service === 'electrical') {
    result = calcComponentBased(S.details.services, ELECTRICAL_SVC, S.details, reg);
    html = renderComponentEstimate(result, S.details, ELECTRICAL_REBATES, reg, 'Electrical Services');
  } else if (S.service === 'hvac') {
    result = calcComponentBased(S.details.services, HVAC_SVC, S.details, reg);
    html = renderComponentEstimate(result, S.details, HVAC_REBATES, reg, 'HVAC & Energy Services');
  } else if (S.service === 'roofing') {
    result = calcRoofing(S.details, reg);
    html = renderSimpleEstimate(result, 'Roofing');
  } else if (S.service === 'kitchen-bath') {
    result = calcKitchenBath(S.details, reg);
    html = renderKBEstimate(result, reg);
  } else if (S.service === 'adu') {
    result = calcADU(S.details, reg);
    html = renderSimpleEstimate(result, result.typeLabel || 'ADU');
  } else if (S.service === 'commercial') {
    result = calcCommercial(S.details, reg);
    html = renderCommercialEstimate(result);
  }

  S.result = result || {};
  var out = document.getElementById('estimateOutput');
  if (out) out.innerHTML = html || '';
}

/* ── Renderers ─────────────────────────────────────────────────────── */
function renderHero(lo, hi, regionName, note) {
  return '<div class="est-hero">' +
    '<div class="est-hero-label">Your preliminary estimate</div>' +
    '<div class="est-hero-amount"><span>' + fmt(lo) + '</span> – <span>' + fmt(hi) + '</span></div>' +
    '<div class="est-hero-note">📍 ' + regionName + (note ? ' · ' + note : '') + '</div>' +
    '</div>';
}

function renderItemsTable(items, title) {
  var rows = '';
  var lastSvc = null;
  items.forEach(function(item) {
    if (item.isSvcTotal) {
      rows += '<div class="btotal"><span class="btotal-label">' + item.label + ' total</span><span class="btotal-range">' + fmt(item.lo) + ' – ' + fmt(item.hi) + '</span></div>';
      return;
    }
    if (item.svcLabel && item.svcLabel !== lastSvc) {
      if (lastSvc) rows += '</div>'; // close previous group
      rows += '<div class="bcard-title">' + item.svcLabel + '</div>';
      lastSvc = item.svcLabel;
    }
    if (item.isDiscount) {
      rows += '<div class="brow"><div class="brow-left"><div class="brow-name" style="color:var(--green)">' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
        '<div class="brow-right"><div class="brow-range" style="color:var(--green)">' + fmt(item.lo) + '</div></div></div>';
      return;
    }
    rows += '<div class="brow"><div class="brow-left"><div class="brow-name">' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
      '<div class="brow-right"><div class="brow-range">' + fmt(item.lo) + ' – ' + fmt(item.hi) + '</div></div></div>';
  });
  return '<div class="bcard">' + (title ? '<div class="bcard-title">' + title + '</div>' : '') + rows + '</div>';
}

function renderRebates(rebateList, det, reg) {
  var matching = filterRebates(rebateList, det, reg);
  if (!matching.length) {
    return '<div style="background:var(--bg-card);border:1px solid var(--line);border-radius:var(--r);padding:20px;font-size:14px;color:var(--ink-soft);margin-bottom:24px">' +
      '🔍 No confirmed rebate programs matched your exact profile — but rebates change frequently. OE Services will do a full rebate check during your free on-site quote. Federal IRA credits may still apply.' +
      '</div>';
  }
  var totalLo = 0, totalHi = 0;
  var cards = matching.map(function(r) {
    totalLo += r.flatLow; totalHi += r.flatHigh;
    var typeLabel = {federal:'Federal', state:'State', utility:'Utility', local:'Local'}[r.type] || r.type;
    var typeClass = {federal:'type-federal', state:'type-state', utility:'type-utility'}[r.type] || 'type-federal';
    return '<div class="rebate-card"><span class="rebate-card-type ' + typeClass + '">' + typeLabel + '</span>' +
      '<div class="rebate-card-name">' + r.name + '</div>' +
      '<div class="rebate-card-amount">' + fmt(r.flatLow) + (r.flatHigh > r.flatLow ? ' – ' + fmt(r.flatHigh) : '') + '</div>' +
      '<div class="rebate-card-note">' + r.note + '</div></div>';
  }).join('');
  return '<div class="rebate-hero">' +
    '<div class="rebate-hero-badge">🎉 Potential Savings Found</div>' +
    '<div style="font-size:13px;color:var(--ink-soft);margin-bottom:8px">You may qualify for rebates & incentives totaling</div>' +
    '<div class="rebate-hero-amount">' + fmt(totalLo) + (totalHi > totalLo ? ' – ' + fmt(totalHi) : '') + '</div>' +
    '<div class="rebate-hero-sub">Based on your address, property type, and selected services. Final eligibility confirmed at on-site quote.</div>' +
    '</div>' +
    '<div class="net-cost-box">' +
    '<span class="net-cost-label">Estimated net cost after rebates</span>' +
    '<span class="net-cost-range">' + fmt(Math.max(0, S.result.lo - totalHi)) + ' – ' + fmt(Math.max(0, S.result.hi - totalLo)) + '</span>' +
    '</div>' +
    '<div class="rebate-grid">' + cards + '</div>' +
    '<div class="disclaimer">ℹ Rebate amounts are estimates based on published program data. Eligibility depends on final equipment specs, income verification, and program availability. OE Services verifies all rebates and handles paperwork on your behalf.</div>';
}

function renderDisclaimer(regionName) {
  return '<div class="disclaimer" style="margin-top:24px">' +
    'Estimate is preliminary and based on regional averages for ' + regionName + '. ' +
    'Final pricing confirmed at a complimentary on-site visit. Estimates include all permits, planning &amp; coordination.' +
    '</div>';
}

function renderComponentEstimate(result, det, rebateList, reg, title) {
  var html = renderHero(result.lo, result.hi, result.regionName, 'includes permits & coordination');
  html += renderItemsTable(result.items, null);
  html += '<h3 style="margin:32px 0 16px;font-size:20px">Potential rebates &amp; incentives</h3>';
  html += renderRebates(rebateList, det, reg);
  html += renderDisclaimer(result.regionName);
  return html;
}

function renderSimpleEstimate(result, title) {
  var html = renderHero(result.lo, result.hi, result.regionName);
  var items = (result.items || []).map(function(item) {
    return '<div class="brow"><div class="brow-left"><div class="brow-name">' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
      '<div class="brow-right"><div class="brow-range">' + (item.lo < 0 ? '' : '') + fmt(item.lo) + (item.lo !== item.hi ? ' – ' + fmt(item.hi) : '') + '</div></div></div>';
  }).join('');
  html += '<div class="bcard"><div class="bcard-title">' + title + ' — Cost Breakdown</div>' + items + '</div>';
  html += renderDisclaimer(result.regionName);
  return html;
}

function renderKBEstimate(result, reg) {
  var html = renderHero(result.lo, result.hi, result.regionName, result.bundled ? '10% bundle discount applied' : '');
  var items = (result.items || []).map(function(item) {
    if (item.isDiscount) {
      return '<div class="brow"><div class="brow-left"><div class="brow-name" style="color:var(--green)">🎉 ' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
        '<div class="brow-right"><div class="brow-range" style="color:var(--green)">−' + fmt(Math.abs(item.lo)) + '</div></div></div>';
    }
    return '<div class="brow"><div class="brow-left"><div class="brow-name">' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
      '<div class="brow-right"><div class="brow-range">' + fmt(item.lo) + ' – ' + fmt(item.hi) + '</div></div></div>';
  }).join('');
  html += '<div class="bcard"><div class="bcard-title">Kitchen &amp; Bath — Cost Breakdown</div>' + items + '</div>';
  html += renderDisclaimer(result.regionName);
  return html;
}

function renderCommercialEstimate(result) {
  var html = renderHero(result.lo, result.hi, result.regionName, result.typeLabel);
  var rows = (result.items || []).map(function(item) {
    if (item.isExclusion) {
      return '<div class="brow"><div class="brow-left"><div class="brow-name" style="color:var(--ink-mute)">⚠ Not included in this estimate</div>' +
        '<div class="brow-sub">' + item.sub + '</div></div>' +
        '<div class="brow-right"><div class="brow-range" style="color:var(--ink-mute)">—</div></div></div>';
    }
    return '<div class="brow"><div class="brow-left"><div class="brow-name">' + item.name + '</div><div class="brow-sub">' + item.sub + '</div></div>' +
      '<div class="brow-right"><div class="brow-range">' + fmt(item.lo) + (item.lo !== item.hi ? ' – ' + fmt(item.hi) : '') + '</div></div></div>';
  }).join('');
  html += '<div class="bcard"><div class="bcard-title">' + result.typeLabel + ' — Cost Breakdown</div>' + rows + '</div>';
  html += renderDisclaimer(result.regionName);
  return html;
}

/* ── Step 5: Done ──────────────────────────────────────────────────── */
function goToDone() {
  var titleEl = document.getElementById('doneTitle');
  if (titleEl) titleEl.textContent = 'Thanks, ' + S.first + '!';
  var rows = [
    ['Name', S.first + ' ' + S.last],
    ['Contact', S.phone || S.email],
    ['Address', S.street + ', ' + S.city + ', ' + S.state + ' ' + S.zip],
    ['Service', ({electrical:'Electrical', hvac:'HVAC & Energy', roofing:'Roofing', 'kitchen-bath':'Kitchen & Bath', adu:'ADU / Addition', commercial:'Commercial Build-Out'})[S.service] || S.service],
    ['Estimate', S.result.lo ? (fmt(S.result.lo) + ' – ' + fmt(S.result.hi)) : '—']
  ];
  var summaryEl = document.getElementById('doneSummary');
  if (summaryEl) {
    summaryEl.innerHTML = rows.map(function(r) {
      return '<div class="done-row"><span>' + r[0] + '</span><span>' + r[1] + '</span></div>';
    }).join('');
  }

  // SUBMISSION HOOK — wire this to your CRM, Formspree, email endpoint, etc.
  console.log('OE Services lead:', JSON.stringify(S));

  goStep(5);
}
