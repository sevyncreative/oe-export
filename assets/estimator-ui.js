/* ============================================================
   OE SERVICES — ESTIMATOR UI CONTROLLER
   Services: electrical · hvac · roofing · kitchen-bath · adu ·
             commercial · not-sure (personal inquiry)
   ============================================================ */
(function () {
  "use strict";
  var E = window.OEEstimator;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = E.fmt;

  var S = {
    first:"", last:"", phone:"", email:"", street:"", city:"", state:"", zip:"",
    service:"", details:{}, media:{ photos:[], video:null }
  };
  var current = 1, TOTAL = 5;

  /* services that DON'T produce an instant priced range — they collect a
     personal inquiry and route to a human follow-up within 24 hours. */
  var INQUIRY_SERVICES = { "not-sure": true };

  /* ---------- step nav ---------- */
  function goStep(n) {
    document.querySelectorAll(".panel").forEach(function (p) { p.classList.remove("active"); });
    $("p" + n).classList.add("active");
    current = n;
    $("pfill").style.width = (n / TOTAL * 100) + "%";
    document.querySelectorAll("#psteps span").forEach(function (s) {
      var v = +s.dataset.s;
      s.classList.toggle("done", v < n);
      s.classList.toggle("active", v === n);
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- validation helpers ---------- */
  var reEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setErr(inputId, errId, bad) {
    var el = $(inputId), e = $(errId);
    if (el) { el.classList.toggle("invalid", bad); el.classList.toggle("valid", !bad && el.value.trim() !== ""); }
    if (e) e.classList.toggle("show", bad);
  }

  /* ---------- automation: phone, zip→state+region ---------- */
  $("fphone").addEventListener("input", function () {
    var d = this.value.replace(/\D/g, "").slice(0, 10), out = d;
    if (d.length > 6) out = "(" + d.slice(0, 3) + ") " + d.slice(3, 6) + "-" + d.slice(6);
    else if (d.length > 3) out = "(" + d.slice(0, 3) + ") " + d.slice(3);
    else if (d.length > 0) out = "(" + d;
    this.value = out;
    if (d.length === 10) setErr("fphone", "e-phone", false);
  });
  $("fzip").addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 5);
    var chip = $("rchip");
    if (/^\d{5}$/.test(this.value)) {
      var r = E.resolveZip(this.value);
      var stEl = $("fstate");
      if (r && r.state && !stEl.value.trim()) { stEl.value = r.state; stEl.classList.add("valid"); }
      $("rchiptext").textContent = "Pricing region: " + (r ? r.region : "your area");
      chip.classList.add("show");
      setErr("fzip", "e-zip", false);
    } else { chip.classList.remove("show"); }
  });
  // live blur validation
  [["ffirst","e-first",function(v){return v.length>=1;}],
   ["flast","e-last",function(v){return v.length>=1;}],
   ["femail","e-email",function(v){return reEmail.test(v);}],
   ["fstreet","e-street",function(v){return v.length>=4;}],
   ["fcity","e-city",function(v){return v.length>=2;}],
   ["fstate","e-state",function(v){return /^[A-Za-z]{2}$/.test(v);}]
  ].forEach(function (c) {
    $(c[0]).addEventListener("blur", function () {
      if (!this.value.trim()) return;
      setErr(c[0], c[1], !c[2](this.value.trim()));
    });
  });

  function validateStep1() {
    var ok = true;
    function chk(id, eid, good) { var bad = !good; setErr(id, eid, bad); if (bad) ok = false; }
    chk("ffirst", "e-first", $("ffirst").value.trim().length >= 1);
    chk("flast", "e-last", $("flast").value.trim().length >= 1);
    chk("fphone", "e-phone", $("fphone").value.replace(/\D/g, "").length === 10);
    chk("femail", "e-email", reEmail.test($("femail").value.trim()));
    chk("fstreet", "e-street", $("fstreet").value.trim().length >= 4);
    chk("fcity", "e-city", $("fcity").value.trim().length >= 2);
    chk("fstate", "e-state", /^[A-Za-z]{2}$/.test($("fstate").value.trim()));
    chk("fzip", "e-zip", /^\d{5}$/.test($("fzip").value.trim()));
    if (ok) {
      S.first = $("ffirst").value.trim(); S.last = $("flast").value.trim();
      S.phone = $("fphone").value.trim(); S.email = $("femail").value.trim();
      S.street = $("fstreet").value.trim(); S.city = $("fcity").value.trim();
      S.state = $("fstate").value.trim().toUpperCase(); S.zip = $("fzip").value.trim();
    }
    return ok;
  }

  /* ---------- service selection ---------- */
  var SVC_LABEL = {
    electrical:"Electrical", hvac:"HVAC & Energy", roofing:"Roofing",
    "kitchen-bath":"Kitchen & Bath", adu:"ADU / Addition",
    commercial:"Commercial", "not-sure":"Not Sure Yet"
  };
  document.querySelectorAll("#svc-pick .opt").forEach(function (opt) {
    opt.addEventListener("click", function () {
      document.querySelectorAll("#svc-pick .opt").forEach(function (o) { o.classList.remove("sel"); });
      opt.classList.add("sel");
      opt.querySelector("input").checked = true;
      S.service = opt.dataset.svc;
      $("e-svc").classList.remove("show");
    });
  });

  /* ---------- dynamic step-3 question sets ---------- */
  function optHTML(name, val, title, sub, price) {
    return '<label class="opt" data-name="' + name + '" data-val="' + val + '">' +
      '<input type="radio" name="' + name + '"><span class="mk"></span>' +
      '<div class="t">' + title + '</div>' +
      (sub ? '<div class="s">' + sub + '</div>' : '') +
      (price ? '<div class="pr">' + price + '</div>' : '') + '</label>';
  }
  function checkOptHTML(name, val, ic, title, sub) {
    return '<label class="opt" data-name="' + name + '" data-val="' + val + '" data-multi="1">' +
      '<input type="checkbox" name="' + name + '"><span class="mk"></span>' +
      '<div class="t"><span class="ic">' + ic + '</span>' + title + '</div>' +
      (sub ? '<div class="s">' + sub + '</div>' : '') + '</label>';
  }
  function pillHTML(name, val, label, attrs) {
    return '<label class="pill"><input type="radio" name="' + name + '" value="' + val + '" ' + (attrs || "") + '><span>' + label + '</span></label>';
  }

  function buildDetails(svc) {
    var b = $("p3body"), html = "";
    if (svc === "electrical" || svc === "hvac") {
      var cat = svc === "electrical" ? E.ELECTRICAL : E.HVAC;
      var icons = { mpu_standard:"⚡", mpu_400a:"🔌", ev_charger:"🚗", generator:"🔋", battery_backup:"🪫", new_circuits:"💡",
        hvac_new:"❄️", hvac_replace:"♻️", windows:"🪟", insulation:"🧱" };
      html += '<div class="qblock"><p>Which services? <span style="color:var(--ink-mute);font-weight:400">(select all)</span></p><div class="opts c2" data-group="services">';
      Object.keys(cat).forEach(function (k) { html += checkOptHTML("services", k, icons[k] || "•", cat[k].label, ""); });
      html += '</div></div>';
      if (svc === "electrical") {
        html += '<div class="hint">Main Panel Upgrades reuse your existing overhead or underground service feed in its current location — no feed modifications included. Repairs are quoted separately on request.</div>';
      }
      html += '<div class="qblock"><p>Property type</p><div class="pills" data-group="property">' +
        pillHTML("property","sfh","Single-family") + pillHTML("property","condo","Condo / townhouse") +
        pillHTML("property","multi","Multi-family") + pillHTML("property","commercial","Commercial") + '</div></div>';
      html += '<div class="qblock"><p>Approximate size</p><div class="pills" data-group="sqft">' +
        pillHTML("sqft","sm","Under 1,000 sq ft") + pillHTML("sqft","md","1,000–2,000") +
        pillHTML("sqft","lg","2,000–3,500") + pillHTML("sqft","xl","Over 3,500") + '</div></div>';
      html += '<div class="qblock"><p>Access to work area</p><div class="pills" data-group="access">' +
        pillHTML("access","easy","Easy") + pillHTML("access","moderate","Some obstacles") +
        pillHTML("access","difficult","Difficult / tight") + pillHTML("access","unknown","Not sure") + '</div></div>';
    } else if (svc === "roofing") {
      var rmeta = E.ROOF_META;
      html += '<div class="qblock"><p>Roofing material</p><div class="opts c2" data-group="roofType">';
      Object.keys(rmeta).forEach(function (k) { html += optHTML("roofType", k, rmeta[k].label, rmeta[k].life + " · " + rmeta[k].best, ""); });
      html += '</div></div>';

      /* ----- ROOF SIZE CALCULATOR ----- */
      html += '<div class="qblock"><p>Roof size: <span id="roofsz" style="color:var(--cyan)">1,800 sq ft</span></p>' +
        '<div class="range-wrap"><input type="range" id="roof-sqft" min="500" max="10000" step="50" value="1800"></div>' +
        '<button type="button" class="calc-toggle" id="roofcalc-toggle">📐 Not sure? Use the roof size calculator</button>' +
        '<div class="calc-box" id="roofcalc">' +
          '<p class="calc-lede">Measure your home\'s footprint (outside walls) and we\'ll estimate the actual roof surface, accounting for pitch and overhangs.</p>' +
          '<div class="calc-grid">' +
            '<div class="calc-field"><label>House length (ft)</label><input type="number" id="rc-len" inputmode="decimal" min="5" max="400" placeholder="e.g. 50"></div>' +
            '<div class="calc-field"><label>House width (ft)</label><input type="number" id="rc-wid" inputmode="decimal" min="5" max="400" placeholder="e.g. 36"></div>' +
          '</div>' +
          '<div class="calc-field"><label>Roof pitch</label>' +
            '<select id="rc-pitch">' +
              '<option value="1.05">Low slope / nearly flat (2:12 or less)</option>' +
              '<option value="1.12" selected>Gentle (3:12–5:12)</option>' +
              '<option value="1.20">Medium (6:12–8:12)</option>' +
              '<option value="1.31">Steep (9:12–12:12)</option>' +
              '<option value="1.45">Very steep (12:12+)</option>' +
            '</select></div>' +
          '<div class="calc-field"><label>Stories</label>' +
            '<select id="rc-stories"><option value="1">1 story</option><option value="2">2 stories</option><option value="3">3+ stories</option></select></div>' +
          '<button type="button" class="btn btn-cyan block" id="rc-apply">Calculate my roof size →</button>' +
          '<div class="calc-result" id="rc-result"></div>' +
        '</div></div>';

      html += '<div class="qblock"><p>Pitch / complexity</p><div class="pills" data-group="pitch">' +
        pillHTML("pitch","low","Low / flat") + pillHTML("pitch","med","Medium") + pillHTML("pitch","steep","Steep") + pillHTML("pitch","complex","Complex / multi") + '</div></div>';
      html += '<div class="qblock"><p>Stories</p><div class="pills" data-group="stories">' +
        pillHTML("stories","1","1 story") + pillHTML("stories","2","2 stories") + pillHTML("stories","3","3+") + '</div></div>';
      html += '<div class="qblock"><p>Existing layers to remove</p><div class="pills" data-group="layers">' +
        pillHTML("layers","1","1 layer") + pillHTML("layers","2","2+ layers") + pillHTML("layers","unk","Not sure") + '</div></div>';
      html += '<div class="qblock"><p>Property type</p><div class="pills" data-group="propType">' +
        pillHTML("propType","res","Single-family") + pillHTML("propType","multi","Multi-family") +
        pillHTML("propType","comm","Commercial") + pillHTML("propType","hist","Historic") + '</div></div>';
    } else if (svc === "kitchen-bath") {
      /* "mid" tier removed; emphasize LOW (minor refresh) and HIGH-MID. */
      html += '<div class="qblock"><p>Kitchen scope <span style="color:var(--ink-mute);font-weight:400">(skip if not applicable)</span></p><div class="pills" data-group="kitchen">' +
        pillHTML("kitchen","none","None") + pillHTML("kitchen","minor","Minor refresh") + pillHTML("kitchen","high-mid","High-mid renovation") + pillHTML("kitchen","major","Full gut") + '</div></div>';
      html += '<div class="qblock"><p>Bathroom scope <span style="color:var(--ink-mute);font-weight:400">(skip if not applicable)</span></p><div class="pills" data-group="bath">' +
        pillHTML("bath","none","None") + pillHTML("bath","minor","Minor refresh") + pillHTML("bath","high-mid","High-mid renovation") + pillHTML("bath","major","Full gut") + '</div></div>';
      html += '<div class="hint">Choose a scope for kitchen, bathroom, or both — at least one is required.</div>';
    } else if (svc === "adu") {
      var rates = { "Detached ADU":"🏠", "Garage Conversion ADU":"🚗", "Basement ADU":"⬇️", "Attached Addition":"🔗", "Junior ADU (JADU)":"🛏️", "Above-Garage ADU":"🔝" };
      html += '<div class="qblock"><p>ADU type</p><div class="opts c2" data-group="aduType">';
      Object.keys(rates).forEach(function (k) { html += optHTML("aduType", k, rates[k] + " " + k, "", ""); });
      html += '</div></div>';
      html += '<div class="qblock"><p>Size: <span id="adusz" style="color:var(--cyan)">600 sq ft</span></p><div class="range-wrap">' +
        '<input type="range" id="adu-sqft" min="150" max="1500" step="25" value="600"></div></div>';
      html += '<div class="qblock"><p>Site complexity</p><div class="pills" data-group="complexity">' +
        pillHTML("complexity","Low","Low — flat, no demo") + pillHTML("complexity","Medium","Medium — typical","checked") + pillHTML("complexity","High","High — slope / demo") + '</div></div>';
    } else if (svc === "commercial") {
      html += '<div class="qblock"><p>Commercial project type</p><div class="opts c2" data-group="commType">';
      Object.keys(E.COMM_RATE).forEach(function (k) {
        var icons = { "new-buildout":"🏗️", "renovation":"🛠️", "tenant-improve":"🏢", "comm-electrical":"⚡" };
        html += optHTML("commType", k, (icons[k]||"•") + " " + E.COMM_RATE[k].label, "", "");
      });
      html += '</div></div>';
      html += '<div class="qblock"><p>Approximate square footage: <span id="commsz" style="color:var(--cyan)">2,000 sq ft</span></p><div class="range-wrap">' +
        '<input type="range" id="comm-sqft" min="200" max="50000" step="100" value="2000"></div>' +
        '<div class="hint">Don\'t know the exact footage? A close estimate is fine — we confirm everything on-site.</div></div>';
      html += '<div class="qblock"><p>Finish / build level</p><div class="pills" data-group="commCx">' +
        pillHTML("commCx","standard","Standard finish","checked") + pillHTML("commCx","mid","Mid / upgraded") + pillHTML("commCx","complex","Complex / high-spec") + '</div></div>';
      html += '<div class="qblock"><p>Project budget <span style="color:var(--ink-mute);font-weight:400">(optional)</span></p><div class="pills" data-group="commBudget">' +
        pillHTML("commBudget","u50","Under $50k") + pillHTML("commBudget","50-150","$50k–$150k") +
        pillHTML("commBudget","150-500","$150k–$500k") + pillHTML("commBudget","500p","$500k+") +
        pillHTML("commBudget","unsure","Not sure yet") + '</div></div>';
      html += '<div class="qblock"><p>Timeline <span style="color:var(--ink-mute);font-weight:400">(optional)</span></p><div class="pills" data-group="commTimeline">' +
        pillHTML("commTimeline","asap","ASAP") + pillHTML("commTimeline","1mo","Within a month") +
        pillHTML("commTimeline","quarter","This quarter") + pillHTML("commTimeline","planning","Planning stage") + '</div></div>';
      html += '<div class="qblock"><p>Describe the work <span style="color:var(--ink-mute);font-weight:400">(optional but helpful)</span></p>' +
        '<textarea id="comm-notes" class="ta" placeholder="Tell us about the space, scope, any drawings or special requirements…"></textarea></div>';
    } else if (svc === "not-sure") {
      html += '<div class="inq-banner">' +
        '<strong>Don\'t see your project in our standard pricing? You\'re in the right place.</strong>' +
        '<span>Describe what you need below and add photos or a short video. We\'ll send you a personal estimate — or, within 24 hours, let you know if it\'s outside what we service and refer you to a trusted partner in our contractor network.</span>' +
        '</div>';
      html += '<div class="qblock"><p>What kind of work is it? <span style="color:var(--ink-mute);font-weight:400">(optional)</span></p><div class="pills" data-group="nsCategory">' +
        pillHTML("nsCategory","electrical","Electrical") + pillHTML("nsCategory","home-repair","Home repair") +
        pillHTML("nsCategory","commercial","Commercial") + pillHTML("nsCategory","remodel","Remodel / addition") +
        pillHTML("nsCategory","other","Other") + '</div></div>';
      html += '<div class="qblock"><p>Describe your project <span class="rqx">*</span></p>' +
        '<textarea id="ns-desc" class="ta" placeholder="Tell us what you need done, where, and anything that would help us understand the scope…"></textarea>' +
        '<div class="hint">The more detail you give, the more accurate your estimate.</div></div>';
      html += '<div class="qblock"><p>Budget range <span style="color:var(--ink-mute);font-weight:400">(optional)</span></p><div class="pills" data-group="nsBudget">' +
        pillHTML("nsBudget","u1k","Under $1,000") + pillHTML("nsBudget","1-5k","$1k–$5k") +
        pillHTML("nsBudget","5-15k","$5k–$15k") + pillHTML("nsBudget","15-50k","$15k–$50k") +
        pillHTML("nsBudget","50kp","$50k+") + pillHTML("nsBudget","unsure","Not sure yet") + '</div></div>';
      html += '<div class="qblock"><p>When do you need it? <span style="color:var(--ink-mute);font-weight:400">(optional)</span></p><div class="pills" data-group="nsTimeline">' +
        pillHTML("nsTimeline","asap","ASAP") + pillHTML("nsTimeline","1wk","Within a week") +
        pillHTML("nsTimeline","2wk","Within 2 weeks") + pillHTML("nsTimeline","1mo","Within a month") +
        pillHTML("nsTimeline","planning","Planning stage") + '</div></div>';

      /* ----- PHOTO + VIDEO UPLOAD ----- */
      html += '<div class="qblock"><p>Add photos <span style="color:var(--ink-mute);font-weight:400">(optional, up to 10)</span></p>' +
        '<label class="upload-zone" for="ns-photos">' +
          '<span class="up-ic">📷</span><span class="up-main">Tap to take or upload photos</span>' +
          '<span class="up-sub">JPG or PNG — up to 10 images</span>' +
        '</label>' +
        '<input type="file" id="ns-photos" accept="image/*" multiple capture="environment" hidden>' +
        '<div class="thumbs" id="ns-photo-thumbs"></div></div>';
      html += '<div class="qblock"><p>Add a short video <span style="color:var(--ink-mute);font-weight:400">(optional, up to 25 seconds)</span></p>' +
        '<label class="upload-zone" for="ns-video">' +
          '<span class="up-ic">🎥</span><span class="up-main">Tap to record or upload a video walk-through</span>' +
          '<span class="up-sub">MP4, MOV or any video — 25 seconds max</span>' +
        '</label>' +
        '<input type="file" id="ns-video" accept="video/*" capture="environment" hidden>' +
        '<div class="thumbs" id="ns-video-thumbs"></div>' +
        '<div class="hint">A quick 25-second walk-through of the project location helps us estimate accurately the first time.</div></div>';

      html += '<div class="inq-foot">Can\'t find what you need? <strong>Send this as a personal inquiry</strong> and our team will respond within 24 hours.</div>';
    }
    b.innerHTML = html;
    wireDynamic();
  }

  function wireDynamic() {
    // option cards (radio + checkbox)
    $("p3body").querySelectorAll(".opt").forEach(function (opt) {
      opt.addEventListener("click", function () {
        var input = opt.querySelector("input"), multi = opt.dataset.multi;
        if (multi) { input.checked = !input.checked; opt.classList.toggle("sel", input.checked); }
        else {
          $("p3body").querySelectorAll('.opt[data-name="' + opt.dataset.name + '"]').forEach(function (o) { o.classList.remove("sel"); });
          opt.classList.add("sel"); input.checked = true;
        }
        $("e-details").classList.remove("show");
      });
    });
    // range sliders
    var rs = $("roof-sqft"); if (rs) rs.addEventListener("input", function () { $("roofsz").textContent = (+this.value).toLocaleString() + " sq ft"; });
    var as = $("adu-sqft"); if (as) as.addEventListener("input", function () { $("adusz").textContent = (+this.value).toLocaleString() + " sq ft"; });
    var cs = $("comm-sqft"); if (cs) cs.addEventListener("input", function () { $("commsz").textContent = (+this.value).toLocaleString() + " sq ft"; });
    // pills clear error
    $("p3body").querySelectorAll(".pill input").forEach(function (i) { i.addEventListener("change", function () { $("e-details").classList.remove("show"); }); });
    // roof size calculator
    wireRoofCalc();
    // uploads
    wireUploads();
  }

  /* ---------- roof size calculator ---------- */
  function wireRoofCalc() {
    var toggle = $("roofcalc-toggle"); if (!toggle) return;
    var box = $("roofcalc");
    toggle.addEventListener("click", function () {
      var open = box.classList.toggle("open");
      toggle.textContent = open ? "📐 Hide roof size calculator" : "📐 Not sure? Use the roof size calculator";
    });
    $("rc-apply").addEventListener("click", function () {
      var len = parseFloat($("rc-len").value), wid = parseFloat($("rc-wid").value);
      var pitch = parseFloat($("rc-pitch").value) || 1.12;
      var res = $("rc-result");
      if (!len || !wid || len <= 0 || wid <= 0) {
        res.className = "calc-result show err";
        res.textContent = "Enter both the length and width of your home to calculate.";
        return;
      }
      // footprint × pitch factor, + 12% for overhangs/waste, rounded to nearest 50
      var footprint = len * wid;
      var roofArea = footprint * pitch * 1.12;
      var rounded = Math.round(roofArea / 50) * 50;
      rounded = Math.max(500, Math.min(10000, rounded));
      var slider = $("roof-sqft");
      slider.value = rounded;
      $("roofsz").textContent = rounded.toLocaleString() + " sq ft";
      // auto-set the pitch pill to match the calculator selection
      var pitchMap = { "1.05":"low", "1.12":"low", "1.20":"med", "1.31":"steep", "1.45":"complex" };
      var pk = pitchMap[$("rc-pitch").value.toString()] || "med";
      var pPill = $("p3body").querySelector('input[name="pitch"][value="' + pk + '"]');
      if (pPill) pPill.checked = true;
      var st = $("rc-stories").value;
      var sPill = $("p3body").querySelector('input[name="stories"][value="' + st + '"]');
      if (sPill) sPill.checked = true;
      res.className = "calc-result show ok";
      res.innerHTML = "Estimated roof surface: <b>" + rounded.toLocaleString() + " sq ft</b> " +
        "<span class='calc-note'>(footprint " + footprint.toLocaleString() + " sq ft × pitch + overhang). Applied to your estimate.</span>";
    });
  }

  /* ---------- photo / video uploads ---------- */
  function wireUploads() {
    var pIn = $("ns-photos");
    if (pIn) {
      pIn.addEventListener("change", function () {
        var files = Array.prototype.slice.call(this.files || []);
        S.media.photos = S.media.photos.concat(files).slice(0, 10);
        renderPhotoThumbs();
      });
    }
    var vIn = $("ns-video");
    if (vIn) {
      vIn.addEventListener("change", function () {
        var f = (this.files && this.files[0]) || null;
        if (!f) return;
        var note = "";
        if (f.type && f.type.indexOf("video") === 0) {
          var url = URL.createObjectURL(f);
          var probe = document.createElement("video");
          probe.preload = "metadata";
          probe.onloadedmetadata = function () {
            URL.revokeObjectURL(url);
            if (probe.duration && probe.duration > 26) {
              S.media.video = null;
              renderVideoThumb(null, "That clip is " + Math.round(probe.duration) + "s — please upload a video of 25 seconds or less.");
            } else {
              S.media.video = f;
              renderVideoThumb(f, "");
            }
          };
          probe.onerror = function () { S.media.video = f; renderVideoThumb(f, ""); };
          probe.src = url;
        } else {
          S.media.video = f; renderVideoThumb(f, note);
        }
      });
    }
  }
  function renderPhotoThumbs() {
    var wrap = $("ns-photo-thumbs"); if (!wrap) return;
    wrap.innerHTML = "";
    S.media.photos.forEach(function (f, idx) {
      var url = URL.createObjectURL(f);
      var d = document.createElement("div");
      d.className = "thumb";
      d.innerHTML = '<img src="' + url + '" alt="upload">' +
        '<button type="button" class="thumb-x" data-i="' + idx + '" aria-label="Remove">×</button>';
      wrap.appendChild(d);
    });
    wrap.querySelectorAll(".thumb-x").forEach(function (btn) {
      btn.addEventListener("click", function () {
        S.media.photos.splice(+this.dataset.i, 1);
        renderPhotoThumbs();
      });
    });
  }
  function renderVideoThumb(f, msg) {
    var wrap = $("ns-video-thumbs"); if (!wrap) return;
    if (!f) {
      wrap.innerHTML = msg ? '<div class="thumb-msg err">' + esc(msg) + '</div>' : "";
      return;
    }
    wrap.innerHTML = '<div class="thumb video"><span class="vfile">🎬 ' + esc(f.name) + '</span>' +
      '<button type="button" class="thumb-x" id="ns-video-x" aria-label="Remove">×</button></div>';
    var x = $("ns-video-x");
    if (x) x.addEventListener("click", function () { S.media.video = null; $("ns-video").value = ""; renderVideoThumb(null, ""); });
  }

  function readPills(group) { var el = $("p3body").querySelector('input[name="' + group + '"]:checked'); return el ? el.value : ""; }
  function readChecks(group) { return Array.prototype.map.call($("p3body").querySelectorAll('input[name="' + group + '"]:checked'), function (c) { return c.closest(".opt").dataset.val; }); }
  function readOpt(group) { var el = $("p3body").querySelector('.opt[data-name="' + group + '"].sel'); return el ? el.dataset.val : ""; }

  function validateStep3() {
    var svc = S.service, d = {};
    if (svc === "electrical" || svc === "hvac") {
      d.services = readChecks("services");
      d.property = readPills("property") || "sfh";
      d.sqft = readPills("sqft") || "md";
      d.access = readPills("access") || "easy";
      if (!d.services.length) return false;
    } else if (svc === "roofing") {
      d.roofType = readOpt("roofType");
      d.sqft = +($("roof-sqft") ? $("roof-sqft").value : 1800);
      d.pitch = readPills("pitch") || "med";
      d.stories = readPills("stories") || "1";
      d.layers = readPills("layers") || "1";
      d.propType = readPills("propType") || "res";
      if (!d.roofType) return false;
    } else if (svc === "kitchen-bath") {
      var k = readPills("kitchen"), bth = readPills("bath");
      d.kitchen = (k && k !== "none") ? k : "";
      d.bath = (bth && bth !== "none") ? bth : "";
      if (!d.kitchen && !d.bath) return false;
    } else if (svc === "adu") {
      d.aduType = readOpt("aduType");
      d.sqft = +($("adu-sqft") ? $("adu-sqft").value : 600);
      d.complexity = readPills("complexity") || "Medium";
      if (!d.aduType) return false;
    } else if (svc === "commercial") {
      d.commType = readOpt("commType");
      d.sqft = +($("comm-sqft") ? $("comm-sqft").value : 2000);
      d.complexity = readPills("commCx") || "standard";
      d.budget = readPills("commBudget") || "";
      d.timeline = readPills("commTimeline") || "";
      d.notes = ($("comm-notes") ? $("comm-notes").value.trim() : "");
      if (!d.commType) return false;
    } else if (svc === "not-sure") {
      d.category = readPills("nsCategory") || "";
      d.desc = ($("ns-desc") ? $("ns-desc").value.trim() : "");
      d.budget = readPills("nsBudget") || "";
      d.timeline = readPills("nsTimeline") || "";
      if (d.desc.length < 8) return false; // require a real description
    }
    S.details = d;
    return true;
  }

  /* ---------- compute + render estimate ---------- */
  function compute() {
    var svc = S.service, d = S.details, res;
    if (svc === "electrical") res = E.estimateComponents(E.ELECTRICAL, { services:d.services, sqft:d.sqft, property:d.property, access:d.access, zip:S.zip });
    else if (svc === "hvac") res = E.estimateComponents(E.HVAC, { services:d.services, sqft:d.sqft, property:d.property, access:d.access, zip:S.zip });
    else if (svc === "roofing") res = E.estimateRoofing({ roofType:d.roofType, sqft:d.sqft, pitch:d.pitch, stories:d.stories, layers:d.layers, propType:d.propType, zip:S.zip });
    else if (svc === "kitchen-bath") res = E.estimateKitchenBath({ kitchen:d.kitchen||null, bath:d.bath||null, zip:S.zip });
    else if (svc === "adu") res = E.estimateADU({ type:d.aduType, sqft:d.sqft, complexity:d.complexity, zip:S.zip });
    else if (svc === "commercial") res = E.estimateCommercial({ projectType:d.commType, sqft:d.sqft, complexity:d.complexity, zip:S.zip });
    S.result = res || {};
    return S.result;
  }

  function renderEstimate() {
    var svc = S.service;

    /* ---- inquiry-style services: no instant price ---- */
    if (INQUIRY_SERVICES[svc]) { renderInquiry(); return; }

    var res = compute();
    var addr = S.street || "your property";
    var fn = $("est-firstname"); if (fn) fn.textContent = S.first || "there";
    $("est-intro").textContent = "Based on your details for " + addr + ", here's your all-in estimate — every cost included, nothing hidden.";
    $("est-amount").textContent = fmt(res.low) + " – " + fmt(res.high);
    var regName = (res.region && res.region.region) ? res.region.region : "Your area";
    $("est-region").textContent = "📍 " + regName + " · ZIP " + (S.zip || "—");

    // reset any inquiry styling on the hero
    $("p4").classList.remove("inquiry-mode");
    $("finance-nudge").style.display = "";
    var disc = $("est-disclaimer");
    if (disc) disc.textContent = "Preliminary ballpark estimate — not a quote, bid, or binding offer. Final pricing is confirmed only after an on-site assessment and a written, signed scope of work, and may change with site conditions, permits, materials, and scope. Estimate valid 30 days. Prices subject to change.";

    var bd = $("est-breakdown"), html = "";
    if (svc === "electrical" || svc === "hvac") {
      $("est-meta").textContent = "Regional pricing · all permits, planning & coordination included";
      res.lines.forEach(function (ln) {
        html += '<div class="bd-card"><div class="bd-head"><span>' + ln.label + '</span><span>' + fmt(ln.low) + " – " + fmt(ln.high) + '</span></div>';
        ln.components.forEach(function (c) {
          html += '<div class="bd-row"><div class="l"><b>' + c.name + '</b>' + c.sub + '</div><div class="v">' + fmt(c.low) + " – " + fmt(c.high) + '</div></div>';
        });
        html += '</div>';
      });
    } else if (svc === "roofing") {
      var m = res.meta;
      $("est-meta").textContent = m.label + " · " + S.details.sqft.toLocaleString() + " sq ft";
      html += '<div class="bd-card"><div class="bd-head"><span>' + m.label + '</span><span>' + fmt(res.low) + " – " + fmt(res.high) + '</span></div>' +
        '<div class="bd-row"><div class="l"><b>Roof surface</b>Used for this estimate</div><div class="v">' + S.details.sqft.toLocaleString() + ' sq ft</div></div>' +
        '<div class="bd-row"><div class="l"><b>Estimated lifespan</b></div><div class="v">' + m.life + '</div></div>' +
        '<div class="bd-row"><div class="l"><b>Warranty</b></div><div class="v">' + m.warranty + '</div></div>' +
        '<div class="bd-row"><div class="l"><b>Best for</b></div><div class="v" style="max-width:55%;text-align:right;font-weight:500;color:var(--ink-soft)">' + m.best + '</div></div></div>';
    } else if (svc === "kitchen-bath") {
      $("est-meta").textContent = "Full renovation · materials, labor & permits";
      html += '<div class="bd-card"><div class="bd-head"><span>Scope</span><span>Estimated</span></div>';
      res.lines.forEach(function (ln) { html += '<div class="bd-row"><div class="l"><b>' + ln.label + '</b></div><div class="v">~' + fmt(ln.base) + '</div></div>'; });
      html += '</div>';
    } else if (svc === "adu") {
      $("est-meta").textContent = S.details.aduType + " · " + S.details.sqft.toLocaleString() + " sq ft · ~$" + res.ratePerSqft + "/sq ft";
      html += '<div class="bd-card"><div class="bd-head"><span>' + S.details.aduType + '</span><span>' + fmt(res.low) + " – " + fmt(res.high) + '</span></div>' +
        '<div class="bd-row"><div class="l"><b>Base build rate</b>Regional, ' + (res.region.region || "your area") + '</div><div class="v">~$' + res.ratePerSqft + '/sq ft</div></div>' +
        '<div class="bd-row"><div class="l"><b>Conditioned area</b></div><div class="v">' + S.details.sqft.toLocaleString() + ' sq ft</div></div>' +
        '<div class="bd-row"><div class="l"><b>Site complexity</b></div><div class="v">' + S.details.complexity + '</div></div></div>';
    } else if (svc === "commercial") {
      $("est-meta").textContent = res.typeLabel + " · " + S.details.sqft.toLocaleString() + " sq ft · ~$" + res.ratePerSqft + "/sq ft";
      html += '<div class="bd-card"><div class="bd-head"><span>' + res.typeLabel + '</span><span>' + fmt(res.low) + " – " + fmt(res.high) + '</span></div>' +
        '<div class="bd-row"><div class="l"><b>Build rate</b>Regional, ' + (res.region.region || "your area") + '</div><div class="v">~$' + res.ratePerSqft + '/sq ft</div></div>' +
        '<div class="bd-row"><div class="l"><b>Area</b></div><div class="v">' + S.details.sqft.toLocaleString() + ' sq ft</div></div>' +
        '<div class="bd-row"><div class="l"><b>Finish level</b></div><div class="v">' + (E.COMM_CX_LABEL[S.details.complexity] || S.details.complexity) + '</div></div>' +
        (S.details.budget ? '<div class="bd-row"><div class="l"><b>Stated budget</b></div><div class="v">' + commBudgetLabel(S.details.budget) + '</div></div>' : '') +
        '</div>' +
        '<div class="included" style="margin-top:14px"><b>Commercial projects are scoped on-site.</b> This range reflects typical regional build costs for the type and size you entered. Final commercial pricing depends on plans, permits, and site conditions — we\'ll confirm a firm written number after a walkthrough.</div>';
    }
    bd.innerHTML = html;
  }

  function commBudgetLabel(v) {
    return { u50:"Under $50k","50-150":"$50k–$150k","150-500":"$150k–$500k","500p":"$500k+",unsure:"Not sure yet" }[v] || v;
  }

  /* ---------- inquiry result (Not Sure Yet) ---------- */
  function renderInquiry() {
    var d = S.details;
    S.result = { inquiry:true };
    $("p4").classList.add("inquiry-mode");
    var fn = $("est-firstname"); if (fn) fn.textContent = S.first || "there";
    $("est-intro").textContent = "Thanks — we've got the details for " + (S.street || "your project") + ". Because this is a custom request, a real person reviews it (no auto-generated number).";
    $("est-amount").textContent = "Personal review";
    $("est-meta").textContent = "Custom / non-standard project";
    $("est-region").textContent = "📍 " + (S.city ? S.city + ", " : "") + (S.state || "") + " · ZIP " + (S.zip || "—");
    if ($("finance-nudge")) $("finance-nudge").style.display = "none";
    var disc = $("est-disclaimer");
    if (disc) disc.textContent = "This is a request for a custom estimate, not a quote or binding offer. Any pricing we provide will be preliminary until confirmed on-site in a written, signed scope of work, and may change with site conditions, permits, materials, and scope.";

    var photoCount = S.media.photos.length;
    var hasVideo = !!S.media.video;
    var bd = $("est-breakdown");
    bd.innerHTML =
      '<div class="bd-card"><div class="bd-head"><span>Your request</span><span>For personal review</span></div>' +
        (d.category ? '<div class="bd-row"><div class="l"><b>Category</b></div><div class="v">' + esc(nsCatLabel(d.category)) + '</div></div>' : '') +
        '<div class="bd-row"><div class="l"><b>Description</b></div><div class="v" style="max-width:60%;text-align:right;font-weight:500;color:var(--ink-soft)">' + esc(d.desc || "—") + '</div></div>' +
        (d.budget ? '<div class="bd-row"><div class="l"><b>Budget</b></div><div class="v">' + esc(nsBudgetLabel(d.budget)) + '</div></div>' : '') +
        (d.timeline ? '<div class="bd-row"><div class="l"><b>Timeline</b></div><div class="v">' + esc(nsTimelineLabel(d.timeline)) + '</div></div>' : '') +
        '<div class="bd-row"><div class="l"><b>Attachments</b></div><div class="v">' + photoCount + ' photo' + (photoCount===1?'':'s') + (hasVideo ? ' · 1 video' : '') + '</div></div>' +
      '</div>' +
      '<div class="included" style="margin-top:14px"><b>What happens next:</b> Our team reviews your request and either sends a personal estimate or, within 24 hours, lets you know if it\'s outside what we currently service — in which case we\'ll refer you to a trusted partner in our contractor network so you\'re never left without a next step.</div>';
  }
  function nsCatLabel(v){return {electrical:"Electrical","home-repair":"Home repair",commercial:"Commercial",remodel:"Remodel / addition",other:"Other"}[v]||v;}
  function nsBudgetLabel(v){return {u1k:"Under $1,000","1-5k":"$1k–$5k","5-15k":"$5k–$15k","15-50k":"$15k–$50k","50kp":"$50k+",unsure:"Not sure yet"}[v]||v;}
  function nsTimelineLabel(v){return {asap:"ASAP","1wk":"Within a week","2wk":"Within 2 weeks","1mo":"Within a month",planning:"Planning stage"}[v]||v;}

  /* ---------- confirmation ---------- */
  function renderConfirm() {
    $("done-name").textContent = S.first;
    $("done-email").textContent = S.email;
    $("done-phone").textContent = S.phone;
    var detailStr = "";
    var d = S.details;
    if (S.service === "electrical" || S.service === "hvac") detailStr = (d.services||[]).map(function (k) { return (S.service === "electrical" ? E.ELECTRICAL : E.HVAC)[k].label; }).join(", ");
    else if (S.service === "roofing") detailStr = (S.result.meta ? S.result.meta.label : "Roofing") + " · " + d.sqft.toLocaleString() + " sq ft";
    else if (S.service === "kitchen-bath") detailStr = [d.kitchen ? "Kitchen (" + (E.KB_LABEL[d.kitchen]||d.kitchen) + ")" : "", d.bath ? "Bath (" + (E.KB_LABEL[d.bath]||d.bath) + ")" : ""].filter(Boolean).join(" + ");
    else if (S.service === "adu") detailStr = d.aduType + " · " + d.sqft.toLocaleString() + " sq ft";
    else if (S.service === "commercial") detailStr = (S.result.typeLabel || "Commercial") + " · " + d.sqft.toLocaleString() + " sq ft";
    else if (S.service === "not-sure") detailStr = nsCatLabel(d.category || "other") + (d.desc ? " — " + d.desc.slice(0,60) + (d.desc.length>60?"…":"") : "");

    var estStr = INQUIRY_SERVICES[S.service] ? "Personal review (within 24 hrs)" : $("est-amount").textContent;

    $("done-sum").innerHTML =
      '<div class="ln"><span class="k">Name</span><span class="v">' + esc(S.first + " " + S.last) + '</span></div>' +
      '<div class="ln"><span class="k">Property</span><span class="v">' + esc(S.street + ", " + S.city + ", " + S.state + " " + S.zip) + '</span></div>' +
      '<div class="ln"><span class="k">Service</span><span class="v">' + esc(SVC_LABEL[S.service]) + '</span></div>' +
      '<div class="ln"><span class="k">Project</span><span class="v">' + esc(detailStr) + '</span></div>' +
      '<div class="ln"><span class="k">Estimate</span><span class="v">' + esc(estStr) + '</span></div>';

    /* ---- submission hook: wire to CRM / email here ----
       The S object holds: first, last, phone, email, street, city, state, zip,
       service, details{}, result{}, and media{photos:[File], video:File}.
       For photos/video use FormData (multipart), e.g.:

       var fd = new FormData();
       fd.append('lead', JSON.stringify({ first:S.first, last:S.last, phone:S.phone,
         email:S.email, street:S.street, city:S.city, state:S.state, zip:S.zip,
         service:S.service, details:S.details, result:S.result }));
       S.media.photos.forEach(function (f, i) { fd.append('photo_' + i, f); });
       if (S.media.video) fd.append('video', S.media.video);
       fetch('/api/lead', { method:'POST', body: fd });
    */
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;" }[c]; }); }

  /* ---------- button wiring ---------- */
  document.querySelectorAll("[data-next]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var t = +this.dataset.next;
      if (current === 1 && !validateStep1()) { var fe = document.querySelector("#p1 .invalid"); if (fe) fe.scrollIntoView({ behavior:"smooth", block:"center" }); return; }
      if (current === 2 && !S.service) { $("e-svc").classList.add("show"); return; }
      if (current === 2) { buildDetails(S.service); $("p3h").textContent = SVC_LABEL[S.service] + (INQUIRY_SERVICES[S.service] ? " — tell us more" : " details"); applyCtaLabels(); }
      if (current === 3 && !validateStep3()) { $("e-details").classList.add("show"); $("e-details").scrollIntoView({ behavior:"smooth", block:"center" }); return; }
      if (t === 4) {
        var b = this, inq = INQUIRY_SERVICES[S.service];
        b.textContent = inq ? "Preparing…" : "Calculating…"; b.disabled = true;
        setTimeout(function () { renderEstimate(); b.textContent = inq ? "Review my request →" : "Calculate my estimate →"; b.disabled = false; goStep(4); }, 600);
        return;
      }
      if (t === 5) {
        var b2 = this; b2.textContent = "Submitting…"; b2.disabled = true;
        setTimeout(function () { renderConfirm(); b2.textContent = "Book my free on-site quote →"; b2.disabled = false; goStep(5); }, 650);
        return;
      }
      goStep(t);
    });
  });
  document.querySelectorAll("[data-back]").forEach(function (btn) {
    btn.addEventListener("click", function () { goStep(+this.dataset.back); });
  });

  /* ---------- swap CTA wording for inquiry services ---------- */
  function applyCtaLabels() {
    var inq = INQUIRY_SERVICES[S.service];
    var calc = $("calcBtn"); if (calc) calc.textContent = inq ? "Review my request →" : "Calculate my estimate →";
    var head = $("p4h"); if (head) head.textContent = inq ? "Your request is ready to send." : "";
    var book = $("bookBtn");
    if (book) book.textContent = inq ? "Send my request — get a reply in 24 hrs →" : "Lock my price — book my free visit →";
  }

  /* ---------- deep-link ?service= ---------- */
  (function preselect() {
    var params = new URLSearchParams(location.search);
    var svc = params.get("service");
    if (svc && SVC_LABEL[svc]) {
      S.service = svc;
      var opt = document.querySelector('#svc-pick .opt[data-svc="' + svc + '"]');
      if (opt) { opt.classList.add("sel"); opt.querySelector("input").checked = true; }
    }
  })();

  goStep(1);
})();
