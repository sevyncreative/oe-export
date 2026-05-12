// ── STATE ──────────────────────────────────────
let currentStep = 1;
const totalSteps = 5;
let selectedSvcs = { kitchen: false, bath: false };
let selectedScope = { kitchen: null, bath: null };
let photoFiles = [];
let videoBlob = null;
let recordedChunks = [];
let mediaRecorder = null;
let cameraStream = null;
let isRecording = false;
let timerInterval = null;
let secondsLeft = 25;
let detectedZip = '';
let detectedRegion = null;
let autocomplete = null;

// ── REGIONAL PRICING ───────────────────────────
const KITCHEN = { minor: 16000, mid: 38000, major: 78000 };
const BATH    = { minor: 11000, mid: 22000, major: 48000 };
const BUNDLE_DISCOUNT = 0.10;

function getRegion(zip) {
  if (!zip || zip.length < 3) return { name: 'Your Area', multiplier: 1.0 };
  const p3 = parseInt(zip.substring(0,3));
  const p2 = parseInt(zip.substring(0,2));
  if (p2 === 94 || (p3 >= 950 && p3 <= 952)) return { name: 'Bay Area / Silicon Valley, CA', multiplier: 1.55 };
  if (p3 >= 900 && p3 <= 919) return { name: 'Los Angeles Metro, CA', multiplier: 1.45 };
  if (p3 >= 919 && p3 <= 921) return { name: 'San Diego, CA', multiplier: 1.38 };
  if (p2 === 92 || p2 === 93 || p2 === 96) return { name: 'California', multiplier: 1.25 };
  if (p3 === 891 || p3 === 890 || p3 === 889) return { name: 'Las Vegas, NV', multiplier: 1.02 };
  if (p3 === 894 || p3 === 895) return { name: 'Reno, NV', multiplier: 1.03 };
  if (p2 === 89) return { name: 'Nevada', multiplier: 1.02 };
  if (p3 >= 850 && p3 <= 853) return { name: 'Phoenix Metro, AZ', multiplier: 0.97 };
  if (p3 === 857) return { name: 'Tucson, AZ', multiplier: 0.93 };
  if (p2 === 85 || p2 === 86) return { name: 'Arizona', multiplier: 0.95 };
  return { name: 'Your Area', multiplier: 1.0 };
}

function extractZip(str) {
  const m = str.match(/\b\d{5}\b/);
  return m ? m[0] : '';
}

function calcEstimate() {
  const region = detectedRegion || getRegion(detectedZip);
  let kBase = 0, bBase = 0;
  if (selectedSvcs.kitchen && selectedScope.kitchen) kBase = KITCHEN[selectedScope.kitchen] * region.multiplier;
  if (selectedSvcs.bath && selectedScope.bath)        bBase = BATH[selectedScope.bath] * region.multiplier;
  const subtotal    = kBase + bBase;
  const bundled     = selectedSvcs.kitchen && selectedSvcs.bath && !!selectedScope.kitchen && !!selectedScope.bath;
  const discountAmt = bundled ? Math.round(subtotal * BUNDLE_DISCOUNT / 500) * 500 : 0;
  const total       = subtotal - discountAmt;
  const low  = Math.round(total * 0.85 / 500) * 500;
  const high = Math.round(total * 1.18 / 500) * 500;
  const mid  = Math.round((low + high) / 2 / 500) * 500;
  const subLow  = Math.round(subtotal * 0.85 / 500) * 500;
  const subHigh = Math.round(subtotal * 1.18 / 500) * 500;
  const subMid  = Math.round((subLow + subHigh) / 2 / 500) * 500;
  return { kBase, bBase, subtotal, discountAmt, total, low, high, mid, subMid, region, bundled };
}

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

// ── GOOGLE MAPS AUTOCOMPLETE ───────────────────
function initGoogleMaps() {
  const input = document.getElementById('address-input');
  if (!input || typeof google === 'undefined') return;
  autocomplete = new google.maps.places.Autocomplete(input, {
    types: ['address'], componentRestrictions: { country: 'us' },
    fields: ['formatted_address', 'address_components']
  });
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.address_components) return;
    let zip = '';
    for (const comp of place.address_components) {
      if (comp.types.includes('postal_code')) { zip = comp.long_name; break; }
    }
    if (!zip) zip = extractZip(place.formatted_address || '');
    detectedZip = zip;
    detectedRegion = getRegion(zip);
    showRegionTag();
  });
}

function showRegionTag() {
  if (!detectedRegion) return;
  const tag = document.getElementById('region-tag');
  document.getElementById('region-name').textContent = detectedRegion.name + ' · ' + detectedRegion.multiplier + 'x regional pricing';
  tag.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('address-input');
  if (input) {
    input.addEventListener('blur', () => {
      const zip = extractZip(input.value);
      if (zip && zip !== detectedZip) {
        detectedZip = zip; detectedRegion = getRegion(zip); showRegionTag();
      }
    });
  }
  updateProgress();
});

// ── BUNDLE LOGIC ────────────────────────────────
function updateBundleUI() {
  const both   = selectedSvcs.kitchen && selectedSvcs.bath;
  const onlyOne = (selectedSvcs.kitchen || selectedSvcs.bath) && !both;
  const banner = document.getElementById('bundle-banner');
  const nudge  = document.getElementById('bundle-nudge');
  if (both) {
    if (selectedScope.kitchen && selectedScope.bath) {
      const { discountAmt } = calcEstimate();
      document.getElementById('bundle-savings-amount').textContent = fmt(discountAmt) + ' OFF';
    } else {
      document.getElementById('bundle-savings-amount').textContent = '10% off your total';
    }
    banner.classList.add('show'); nudge.classList.remove('show');
  } else {
    banner.classList.remove('show'); nudge.classList.toggle('show', onlyOne);
    if (onlyOne) {
      const missing = selectedSvcs.kitchen ? 'bathroom' : 'kitchen';
      nudge.innerHTML = '&#128161; <strong>Add a ' + missing + ' remodel and save 10%.</strong> Most customers do both at once — one crew, one timeline, less disruption. <strong>Tap to add →</strong>';
    }
  }
}

function nudgeClick() {
  if (selectedSvcs.kitchen && !selectedSvcs.bath) toggleSvc('bath');
  else if (selectedSvcs.bath && !selectedSvcs.kitchen) toggleSvc('kitchen');
}

// ── SERVICE TOGGLE ─────────────────────────────
function toggleSvc(type) {
  selectedSvcs[type] = !selectedSvcs[type];
  document.getElementById('svc-' + type).classList.toggle('selected', selectedSvcs[type]);
  document.getElementById('scope-' + type).classList.toggle('visible', selectedSvcs[type]);
  if (!selectedSvcs[type]) {
    selectedScope[type] = null;
    document.querySelectorAll('#scope-' + type + ' .scope-opt').forEach(el => el.classList.remove('selected'));
  }
  document.getElementById('svc-err').classList.remove('show');
  updateBundleUI();
}

function setScope(type, level) {
  selectedScope[type] = level;
  const prefix = type === 'kitchen' ? 'k' : 'b';
  ['minor','mid','major'].forEach(l => {
    document.getElementById(prefix + '-' + l).classList.toggle('selected', l === level);
  });
  updateBundleUI();
}

// ── ESTIMATE BUILD ─────────────────────────────
function buildEstimate() {
  const { kBase, bBase, subtotal, discountAmt, low, high, mid, subMid, region, bundled } = calcEstimate();
  const origEl = document.getElementById('est-original');
  document.getElementById('est-amount').textContent = fmt(mid);
  if (bundled && discountAmt > 0) {
    origEl.textContent = fmt(subMid); origEl.style.display = 'inline';
  } else { origEl.style.display = 'none'; }
  document.getElementById('est-range').textContent = 'Estimated range: ' + fmt(low) + ' – ' + fmt(high);
  document.getElementById('est-region').innerHTML = '&#128205; ' + region.name + ' regional pricing applied';
  const kLabel = { minor: 'Kitchen — Minor Update', mid: 'Kitchen — Full Remodel', major: 'Kitchen — Luxury Remodel' };
  const bLabel = { minor: 'Bath — Cosmetic Update', mid: 'Bath — Full Remodel', major: 'Bath — Luxury Remodel' };
  let html = '';
  if (selectedSvcs.kitchen && selectedScope.kitchen) html += rowHtml(kLabel[selectedScope.kitchen], fmt(kBase));
  if (selectedSvcs.bath && selectedScope.bath)        html += rowHtml(bLabel[selectedScope.bath],    fmt(bBase));
  if (bundled && discountAmt > 0) {
    html += '<div class="est-row" style="border-top:1px solid rgba(255,255,255,.2);padding-top:8px;margin-top:4px"><span style="opacity:.8">Subtotal</span><span class="est-row-val" style="opacity:.8">' + fmt(subMid) + '</span></div>';
    html += '<div class="est-discount-row"><span class="est-discount-lbl">&#127881; 10% Bundle Discount</span><span class="est-discount-val">− ' + fmt(discountAmt) + '</span></div>';
    html += '<div class="est-after-discount"><span>Your bundled estimate</span><span>' + fmt(mid) + '</span></div>';
  } else {
    html += '<div class="est-total-row"><span>Midpoint estimate</span><span>' + fmt(mid) + '</span></div>';
  }
  document.getElementById('est-rows').innerHTML = html;
}

function rowHtml(label, val) {
  return '<div class="est-row"><span class="est-row-label">' + label + '</span><span class="est-row-val">' + val + '</span></div>';
}

function getSvcsLabel() {
  const kl = { minor: 'Kitchen (Minor)', mid: 'Kitchen (Full)', major: 'Kitchen (Luxury)' };
  const bl = { minor: 'Bath (Cosmetic)', mid: 'Bath (Full)', major: 'Bath (Luxury)' };
  const parts = [];
  if (selectedSvcs.kitchen && selectedScope.kitchen) parts.push(kl[selectedScope.kitchen]);
  if (selectedSvcs.bath    && selectedScope.bath)    parts.push(bl[selectedScope.bath]);
  return parts.join(' + ') || '—';
}

function buildReview() {
  buildEstimate();
  const d = getFormData();
  const { mid, discountAmt, bundled } = calcEstimate();
  const rows = [
    ['Name',       d.fname + ' ' + d.lname],
    ['Phone',      d.phone],
    ['Email',      d.email],
    ['Address',    d.address || 'Not provided'],
    ['Services',   getSvcsLabel()],
    ['Bundle',     bundled ? '&#127881; 10% OFF — ' + fmt(discountAmt) + ' savings' : 'N/A'],
    ['Property',   d.property || 'Not specified'],
    ['Timeline',   d.timeline || 'Not specified'],
    ['Photos',     photoFiles.length > 0 ? photoFiles.length + ' photo(s)' : 'None'],
    ['Video',      videoBlob ? 'Attached' : 'None'],
  ];
  document.getElementById('review-list').innerHTML = rows.map(([k,v]) =>
    '<div class="review-row"><span class="review-key">' + k + '</span><span class="review-val">' + v + '</span></div>'
  ).join('');
}

// ── NAVIGATION ─────────────────────────────────
function updateProgress() {
  const pct = ((currentStep - 1) / (totalSteps - 1)) * 100;
  document.getElementById('prog-fill').style.width = pct + '%';
  for (let i = 1; i <= totalSteps; i++) {
    const si = document.getElementById('si-' + i);
    const sc = document.getElementById('sc-' + i);
    si.className = 'step-pip';
    if (i < currentStep) { si.classList.add('done'); sc.innerHTML = '&#10003;'; }
    else if (i === currentStep) { si.classList.add('active'); sc.textContent = i; }
    else { sc.textContent = i; }
  }
  document.querySelectorAll('.btn-bk').forEach(b => b.style.display = currentStep > 1 ? 'block' : 'none');
}

function showStep(n) {
  document.querySelectorAll('.est-step').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('step-' + n);
  if (panel) panel.classList.add('active');
  if (n === totalSteps) buildReview();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goNext() {
  if (currentStep === 1 && !v1()) return;
  if (currentStep === 2 && !v2()) return;
  if (currentStep === 3 && !v3()) return;
  if (currentStep === totalSteps) { submitForm(); return; }
  currentStep++;
  showStep(currentStep);
  updateProgress();
}

function goBack() {
  if (currentStep <= 1) return;
  currentStep--;
  showStep(currentStep);
  updateProgress();
}

// ── VALIDATION ─────────────────────────────────
function showErr(id, show) {
  const el = document.getElementById(id);
  if (el) el.style.display = show ? 'block' : 'none';
}

function v1() {
  const any = selectedSvcs.kitchen || selectedSvcs.bath;
  if (!any) { document.getElementById('svc-err').classList.add('show'); return false; }
  if (selectedSvcs.kitchen && !selectedScope.kitchen) { alert('Please choose a scope for your Kitchen remodel.'); return false; }
  if (selectedSvcs.bath && !selectedScope.bath) { alert('Please choose a scope for your Bathroom remodel.'); return false; }
  return true;
}

function v2() {
  let ok = true;
  const addr = document.getElementById('address-input').value.trim();
  showErr('err-address', !addr); if (!addr) ok = false;
  const prop = document.getElementById('property-type').value;
  showErr('err-property', !prop); if (!prop) ok = false;
  return ok;
}

function v3() {
  let ok = true;
  showErr('err-fname', !document.getElementById('fname').value.trim()); if (!document.getElementById('fname').value.trim()) ok = false;
  showErr('err-lname', !document.getElementById('lname').value.trim()); if (!document.getElementById('lname').value.trim()) ok = false;
  showErr('err-phone', !document.getElementById('phone').value.trim()); if (!document.getElementById('phone').value.trim()) ok = false;
  const em = document.getElementById('email').value.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  showErr('err-email', !emailOk); if (!emailOk) ok = false;
  return ok;
}

// ── PHOTOS ─────────────────────────────────────
function handlePhotos(e) {
  photoFiles = photoFiles.concat(Array.from(e.target.files)).slice(0, 10);
  renderPhotos(); e.target.value = '';
}
function removePhoto(i) { photoFiles.splice(i, 1); renderPhotos(); }
function renderPhotos() {
  const grid = document.getElementById('photo-grid');
  grid.innerHTML = '';
  photoFiles.forEach((f, i) => {
    const wrap = document.createElement('div'); wrap.className = 'photo-wrap';
    const img = document.createElement('img'); img.className = 'photo-thumb'; img.src = URL.createObjectURL(f);
    const del = document.createElement('button'); del.className = 'photo-del'; del.innerHTML = '✕';
    del.onclick = () => removePhoto(i);
    wrap.appendChild(img); wrap.appendChild(del); grid.appendChild(wrap);
  });
  document.getElementById('photo-count').textContent = photoFiles.length > 0 ? photoFiles.length + ' photo' + (photoFiles.length !== 1 ? 's' : '') + ' added' : '';
  document.getElementById('add-more-btn').style.display = (photoFiles.length > 0 && photoFiles.length < 10) ? 'inline-flex' : 'none';
}

// ── VIDEO ──────────────────────────────────────
async function toggleRecording() {
  if (!isRecording) {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true });
      const feed = document.getElementById('camera-feed');
      feed.srcObject = cameraStream; feed.style.display = 'block';
      document.getElementById('recorded-video').style.display = 'none';
      recordedChunks = [];
      let opts = {};
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) opts = { mimeType: 'video/webm;codecs=vp8' };
      else if (MediaRecorder.isTypeSupported('video/mp4')) opts = { mimeType: 'video/mp4' };
      mediaRecorder = new MediaRecorder(cameraStream, opts);
      mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
      mediaRecorder.onstop = () => {
        videoBlob = new Blob(recordedChunks, { type: mediaRecorder.mimeType || 'video/webm' });
        const vid = document.getElementById('recorded-video');
        vid.src = URL.createObjectURL(videoBlob); vid.style.display = 'block';
        feed.style.display = 'none';
        document.getElementById('video-status').textContent = '✓ Video recorded successfully';
        document.getElementById('remove-video-btn').style.display = 'block';
        document.getElementById('record-btn').style.display = 'none';
        if (cameraStream) cameraStream.getTracks().forEach(t => t.stop());
      };
      mediaRecorder.start(100);
      isRecording = true; secondsLeft = 25;
      const btn = document.getElementById('record-btn');
      btn.classList.add('recording');
      document.getElementById('rec-icon').innerHTML = '<span class="rec-dot"></span>';
      document.getElementById('rec-text').textContent = 'Tap to stop';
      document.getElementById('timer-wrap').style.display = 'block';
      document.getElementById('secs').textContent = secondsLeft;
      const fill = document.getElementById('timer-fill');
      fill.style.transition = 'none'; fill.style.width = '100%';
      setTimeout(() => { fill.style.transition = 'width 25s linear'; fill.style.width = '0%'; }, 50);
      timerInterval = setInterval(() => { secondsLeft--; document.getElementById('secs').textContent = secondsLeft; if (secondsLeft <= 0) stopRecording(); }, 1000);
    } catch(err) {
      document.getElementById('video-status').textContent = 'Camera not accessible — please upload a file below.';
    }
  } else { stopRecording(); }
}

function stopRecording() {
  isRecording = false; clearInterval(timerInterval);
  if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
  document.getElementById('record-btn').classList.remove('recording');
  document.getElementById('rec-icon').textContent = '⏺';
  document.getElementById('rec-text').textContent = 'Record a walkthrough video';
  document.getElementById('timer-wrap').style.display = 'none';
}

function handleVideoUpload(e) {
  const f = e.target.files[0]; if (!f) return;
  videoBlob = f;
  const vid = document.getElementById('recorded-video');
  vid.src = URL.createObjectURL(f); vid.style.display = 'block';
  document.getElementById('video-status').textContent = '✓ Video ready: ' + f.name;
  document.getElementById('camera-feed').style.display = 'none';
  document.getElementById('remove-video-btn').style.display = 'block';
  document.getElementById('record-btn').style.display = 'none';
}

function removeVideo() {
  videoBlob = null; recordedChunks = [];
  const vid = document.getElementById('recorded-video'); vid.src = ''; vid.style.display = 'none';
  document.getElementById('video-status').textContent = '';
  document.getElementById('remove-video-btn').style.display = 'none';
  document.getElementById('record-btn').style.display = 'flex';
  document.getElementById('video-upload').value = '';
  if (cameraStream) { cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
}

// ── FORM DATA + SUBMIT ─────────────────────────
function getFormData() {
  return {
    fname:    document.getElementById('fname').value.trim(),
    lname:    document.getElementById('lname').value.trim(),
    phone:    document.getElementById('phone').value.trim(),
    email:    document.getElementById('email').value.trim(),
    address:  document.getElementById('address-input').value.trim(),
    property: document.getElementById('property-type').value,
    timeline: document.getElementById('timeline').value,
    description: document.getElementById('description').value.trim(),
  };
}

function submitForm() {
  const d = getFormData();
  const { low, high, mid, discountAmt, bundled, region, subtotal } = calcEstimate();
  const bundleNote = bundled
    ? '\n BUNDLE DEAL APPLIED\nSubtotal:  ' + fmt(Math.round((Math.round(subtotal*0.85/500)*500 + Math.round(subtotal*1.18/500)*500)/2/500)*500) + '\nDiscount:  10% OFF — ' + fmt(discountAmt) + ' savings\nFinal Est: ' + fmt(mid) + '\n'
    : '';
  const subject = encodeURIComponent((bundled ? 'BUNDLE DEAL — ' : '') + 'Kitchen/Bath Estimate Request — OE Services');
  const body = encodeURIComponent(
    'NEW ESTIMATE REQUEST — OE SERVICES\n\nCUSTOMER\nName:      ' + d.fname + ' ' + d.lname +
    '\nPhone:     ' + d.phone + '\nEmail:     ' + d.email + '\nAddress:   ' + d.address +
    '\n\nPROJECT\nServices:  ' + getSvcsLabel() + '\nProperty:  ' + (d.property || 'Not specified') +
    '\nRegion:    ' + region.name + ' (' + region.multiplier + 'x)\nTimeline:  ' + (d.timeline || 'Not specified') +
    '\nNotes:     ' + (d.description || 'None') +
    '\n\nPRELIMINARY ESTIMATE\nRange:     ' + fmt(low) + ' – ' + fmt(high) + '\nMidpoint:  ' + fmt(mid) +
    bundleNote +
    '\nATTACHMENTS\nPhotos:    ' + (photoFiles.length > 0 ? photoFiles.length + ' photo(s)' : 'None') +
    '\nVideo:     ' + (videoBlob ? 'Attached' : 'None') +
    '\n\nSubmitted via OE Services estimate form'
  );
  window.location.href = 'mailto:ahernandez@oeservices.us?subject=' + subject + '&body=' + body;

  document.querySelectorAll('.est-step').forEach(p => { p.style.display = 'none'; });
  document.getElementById('success-screen').style.display = 'block';
  document.getElementById('success-est').textContent = bundled ? fmt(mid) + ' (bundled)' : fmt(mid);
}
