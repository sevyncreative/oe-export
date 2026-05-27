/* ============================================================
   OE SERVICES — UNIFIED ESTIMATOR ENGINE
   Five service models · ZIP-based regional pricing · high-bias
   ------------------------------------------------------------
   HIGH-BIAS: per the brand's preference, displayed estimates sit
   near the TOP of each modeled range. We raise the floor of every
   range toward the ceiling (FLOOR_BIAS) and nudge the ceiling up
   (CEIL_BIAS) so a quote like a Standard Main Panel Upgrade reads
   ~$4,750–$5,700 rather than ~$2,450–$5,450.
   ============================================================ */
(function (root) {
  "use strict";

  var FLOOR_BIAS = 0.78; // displayed low = low + 78% of the way to high
  var CEIL_BIAS  = 1.06; // displayed high = high * 1.06

  function biasRange(low, high) {
    var dLow  = low + (high - low) * FLOOR_BIAS;
    var dHigh = high * CEIL_BIAS;
    if (dLow > dHigh) dLow = dHigh * 0.9;
    return [dLow, dHigh];
  }
  function round50(n){ return Math.round(n / 50) * 50; }
  function fmt(n){ return "$" + Math.round(n).toLocaleString("en-US"); }

  /* ---------------- UNIFIED ZIP → STATE/REGION ----------------
     Three-digit prefix wins; two-digit fallback covers the rest.
     Region label + a cost-of-living multiplier per state focus
     (NV/CA/AZ are the licensed markets; others get sane defaults). */
  var ZIP3 = {}; // built below
  (function seed(){
    function set(list, region){ list.forEach(function(p){ ZIP3[p] = region; }); }
    // Nevada
    set(["889","890","891"], {state:"NV",region:"Las Vegas / Clark County",mult:1.04});
    set(["894","895"],       {state:"NV",region:"Reno / Northern NV",mult:1.06});
    set(["893","897","898"], {state:"NV",region:"Nevada",mult:1.00});
    // California (metro tiers)
    set(["940","941","943","944","945","946","947","948","949","950","951"], {state:"CA",region:"SF Bay Area",mult:1.52});
    set(["900","901","902","903","904","905","906","907","908"], {state:"CA",region:"Greater Los Angeles",mult:1.42});
    set(["919","920","921"], {state:"CA",region:"San Diego",mult:1.36});
    set(["926","927","928"], {state:"CA",region:"Orange County",mult:1.4});
    set(["917","918","922","923","924","925"], {state:"CA",region:"Inland Empire",mult:1.2});
    set(["956","957","958"], {state:"CA",region:"Sacramento",mult:1.24});
    set(["952","953","954","955","959","960","961"], {state:"CA",region:"California",mult:1.18});
    set(["930","931","932","933","934","935","936","937","938","939"], {state:"CA",region:"Central California",mult:1.2});
    // Arizona
    set(["850","851","852","853"], {state:"AZ",region:"Phoenix Metro",mult:1.0});
    set(["856","857"],             {state:"AZ",region:"Tucson",mult:0.96});
    set(["855","859","860","863","864","865"], {state:"AZ",region:"Arizona",mult:0.95});
  })();

  function resolveZip(zip){
    if (!zip || zip.length < 3) return null;
    var p3 = zip.slice(0,3), p2 = zip.slice(0,2);
    if (ZIP3[p3]) return ZIP3[p3];
    if (p2 >= "90" && p2 <= "96") return {state:"CA",region:"California",mult:1.25};
    if (p2 === "88" || p2 === "89") return {state:"NV",region:"Nevada",mult:1.0};
    if (p2 === "85" || p2 === "86") return {state:"AZ",region:"Arizona",mult:0.95};
    return {state:"",region:"Your Area",mult:1.0};
  }
  function stateFromZip(zip){ var r = resolveZip(zip); return r ? r.state : ""; }

  /* ================= ELECTRICAL & HVAC (component model) ================= */
  var SQFT_M = { sm:0.72, md:1.0, lg:1.38, xl:1.82 };
  var PROP_M = { sfh:1.0, condo:0.88, multi:1.2, commercial:1.45 };
  var ACC_M  = { easy:1.0, moderate:1.12, difficult:1.25, unknown:1.08 };

  var ELECTRICAL = {
    mpu_standard:{label:"Main Panel Upgrade — Standard (100–225A)",components:[
      {name:"Main panel & breakers",sub:"100–225A meter-main combo, 30–40 space",low:850,high:1800},
      {name:"Labor & installation",sub:"Demo old panel, mount new in same location, re-terminate",low:900,high:1900},
      {name:"Permits & utility coordination",sub:"City electrical permit + utility disconnect",low:250,high:550},
      {name:"Grounding & bonding upgrade",sub:"Ground rods, GEC, bonding to code (existing feed reused)",low:200,high:550},
      {name:"Project coordination",sub:"Scheduling, inspection management",low:150,high:300},
      {name:"Contingency (drywall, conduit)",sub:"Repairs, additional materials",low:100,high:300}
    ]},
    mpu_400a:{label:"Main Panel Upgrade — 400A Service",components:[
      {name:"400A panel & breakers",sub:"400A meter-main or 200A+200A configuration",low:1900,high:3600},
      {name:"Labor & installation",sub:"Demo old panel, mount new in same location, re-terminate",low:1500,high:2900},
      {name:"Permits & utility coordination",sub:"City electrical permit + utility disconnect/reconnect",low:350,high:750},
      {name:"Grounding & bonding upgrade",sub:"Ground rods, GEC sized for 400A, bonding (existing feed reused)",low:350,high:850},
      {name:"Project coordination",sub:"Scheduling, inspection management",low:200,high:400},
      {name:"Contingency (drywall, conduit)",sub:"Repairs, additional materials",low:150,high:450}
    ]},
    ev_charger:{label:"EV Charger Installation",components:[
      {name:"Charger & receptacle",sub:"Wall Connector, NEMA 14-50, or hardwired L2",low:450,high:1200},
      {name:"Labor & installation",sub:"Mounting, wire pull, breaker install",low:400,high:900},
      {name:"Conduit, wire & breaker",sub:"Run from panel to charger location",low:150,high:450},
      {name:"Permits & inspection",sub:"City electrical permit + final",low:120,high:280},
      {name:"Coordination & cleanup",sub:"Scheduling, debris, final test",low:80,high:180}
    ]},
    generator:{label:"Standby Generator Installation",components:[
      {name:"Generator unit",sub:"14–24kW air-cooled standby generator",low:4200,high:8500},
      {name:"Automatic transfer switch",sub:"200A service-rated ATS",low:600,high:1400},
      {name:"Labor & installation",sub:"Concrete pad, gas line, electrical tie-in",low:1800,high:3800},
      {name:"Permits & inspection",sub:"Electrical + mechanical permits",low:300,high:700},
      {name:"Project coordination",sub:"Gas company, city, manufacturer reg",low:250,high:500},
      {name:"Contingency",sub:"Site prep, additional gas piping",low:200,high:600}
    ]},
    battery_backup:{label:"Battery Backup System",components:[
      {name:"Battery unit(s)",sub:"Powerwall, Enphase IQ, or SolarEdge",low:9500,high:16000},
      {name:"Inverter & gateway",sub:"Integrated or stand-alone backup gateway",low:1200,high:2800},
      {name:"Labor & installation",sub:"Mounting, wiring, commissioning",low:2200,high:4500},
      {name:"Permits & utility interconnect",sub:"Electrical permit + utility approval",low:400,high:900},
      {name:"Project coordination",sub:"Permitting, inspection, monitoring setup",low:200,high:450},
      {name:"Contingency",sub:"Panel work, sub-panel additions",low:200,high:700}
    ]},
    new_circuits:{label:"New Circuits / Outlets",components:[
      {name:"Materials",sub:"Wire, breakers, boxes, devices",low:120,high:380},
      {name:"Labor & installation",sub:"Wire pull, terminate, devices",low:280,high:680},
      {name:"Permits & inspection",sub:"City electrical permit (multi-circuit)",low:60,high:180},
      {name:"Drywall / patch / cleanup",sub:"Minor repairs, debris",low:50,high:200},
      {name:"Coordination",sub:"Scheduling, inspection",low:30,high:80}
    ]}
  };

  var HVAC = {
    hvac_new:{label:"New HVAC Installation",components:[
      {name:"Equipment (unit, air handler, coil)",sub:"14–20 SEER2 energy-efficient system",low:5670,high:9750},
      {name:"Labor & installation",sub:"Ductwork, electrical, refrigerant line",low:3780,high:5625},
      {name:"Permits & plan check",sub:"City/county mechanical permit + review",low:608,high:1125},
      {name:"Project coordination & scheduling",sub:"Estimating, permitting, inspection mgmt",low:473,high:750},
      {name:"Cleanup, haul-away & inspection",sub:"Debris removal, city final inspection",low:270,high:500},
      {name:"Contingency (access/unforeseen)",sub:"Typical buffer for surprises",low:270,high:625}
    ]},
    hvac_replace:{label:"HVAC Removal & Replacement",components:[
      {name:"New equipment (unit, coil, handler)",sub:"14–20 SEER2 replacement system",low:5130,high:9000},
      {name:"Removal & disposal of old system",sub:"Refrigerant recovery, haul-away",low:810,high:1500},
      {name:"Labor & installation",sub:"Install, wire, charge, test",low:2970,high:4750},
      {name:"Permits & plan check",sub:"Mechanical permit + city review",low:473,high:938},
      {name:"Project coordination",sub:"Permitting, inspection scheduling",low:405,high:688},
      {name:"Cleanup & final inspection",sub:"Site cleanup, city sign-off",low:202,high:438},
      {name:"Contingency",sub:"Ductwork repairs if needed",low:270,high:750}
    ]},
    windows:{label:"Energy-Efficient Window Replacement",components:[
      {name:"Windows (double/triple pane)",sub:"Low-E glass, vinyl or fiberglass frame",low:4640,high:9775},
      {name:"Labor & installation",sub:"Remove old, install, flash & seal",low:2610,high:4025},
      {name:"Permits & plan check",sub:"Building permit, energy compliance",low:435,high:920},
      {name:"Project coordination",sub:"Permitting, inspection mgmt",low:362,high:575},
      {name:"Finishing, caulking & cleanup",sub:"Interior/exterior trim, debris removal",low:435,high:805},
      {name:"Contingency (rot, framing repairs)",sub:"Common on older homes",low:290,high:920}
    ]},
    insulation:{label:"Insulation & Weatherization",components:[
      {name:"Materials (blown-in, batt, or spray)",sub:"R-38+ attic, R-15+ walls by zone",low:2430,high:5625},
      {name:"Labor & installation",sub:"Attic prep, install, air sealing",low:1620,high:3750},
      {name:"Permits & plan check",sub:"Energy/building permit where required",low:202,high:562},
      {name:"Project coordination",sub:"Assessment, scheduling, inspection",low:270,high:500},
      {name:"Cleanup & blower door test",sub:"Air leakage test, debris removal",low:202,high:438},
      {name:"Contingency (mold, moisture finds)",sub:"Common in older homes",low:135,high:500}
    ]}
  };

  // labor/permit cost index per state (component services)
  var COMP_REGION = {
    CA:{labor:1.30,permit:1.40}, NV:{labor:1.0,permit:1.0}, AZ:{labor:0.95,permit:0.90},
    DEFAULT:{labor:1.0,permit:1.0}
  };

  function estimateComponents(catalog, opts){
    // opts: { services:[keys], sqft, property, access, zip }
    var r = resolveZip(opts.zip) || {state:"",mult:1.0};
    var ci = COMP_REGION[r.state] || COMP_REGION.DEFAULT;
    var sm = SQFT_M[opts.sqft]||1.0, pm = PROP_M[opts.property]||1.0, am = ACC_M[opts.access]||1.0;
    var mult = sm*pm*am;
    var grandLow=0, grandHigh=0, lines=[];
    opts.services.forEach(function(key){
      var svc = catalog[key]; if(!svc) return;
      var sLow=0, sHigh=0, comps=[];
      svc.components.forEach(function(c){
        var isPermit = /permit|coordination|plan check/i.test(c.name);
        var lo = c.low * (isPermit ? ci.permit*pm : mult*ci.labor);
        var hi = c.high* (isPermit ? ci.permit*pm : mult*ci.labor);
        var b = biasRange(lo, hi);
        comps.push({name:c.name, sub:c.sub, low:round50(b[0]), high:round50(b[1])});
        sLow += b[0]; sHigh += b[1];
      });
      lines.push({label:svc.label, low:round50(sLow), high:round50(sHigh), components:comps});
      grandLow += sLow; grandHigh += sHigh;
    });
    return {low:round50(grandLow), high:round50(grandHigh), lines:lines, region:r};
  }

  /* ================= ROOFING (per-sqft model) ================= */
  var ROOF_BASE = {
    asphalt:[5.91,6.88], architectural:[6.08,7.0], "metal-panel":[9.45,14.0], "metal-shingle":[8.1,11.0],
    "clay-tile":[13.5,20.0], "concrete-tile":[9.45,13.0], slate:[20.25,30.0],
    "flat-tpo":[5.4,8.0], "flat-epdm":[6.08,9.0], "wood-shake":[8.78,12.0]
  };
  var ROOF_META = {
    asphalt:{label:"Asphalt Shingles",life:"20–30 yrs",warranty:"Manufacturer backed",best:"Budget-conscious, most climates"},
    architectural:{label:"Architectural Shingles",life:"25–40 yrs",warranty:"Enhanced warranty available",best:"Curb-appeal upgrade, steep pitches"},
    "metal-panel":{label:"Metal Standing Seam",life:"40–70 yrs",warranty:"Up to 50-yr finish warranty",best:"Energy efficiency, longevity"},
    "metal-shingle":{label:"Metal Shingle",life:"40–60 yrs",warranty:"30–40 yr warranty",best:"Metal durability, traditional look"},
    "clay-tile":{label:"Clay Tile",life:"50–100 yrs",warranty:"Lifetime material",best:"Mediterranean / SW style homes"},
    "concrete-tile":{label:"Concrete Tile",life:"40–50 yrs",warranty:"30-yr standard",best:"Versatile, heavy-weather climates"},
    slate:{label:"Natural Slate",life:"75–200 yrs",warranty:"Lifetime natural material",best:"Prestige, historic & estate homes"},
    "flat-tpo":{label:"Flat / TPO Membrane",life:"20–30 yrs",warranty:"20-yr membrane",best:"Low-slope, commercial, modern flat"},
    "flat-epdm":{label:"Flat / EPDM Rubber",life:"15–25 yrs",warranty:"10–20 yr warranty",best:"Rubber membrane, budget flat"},
    "wood-shake":{label:"Wood Shake",life:"25–40 yrs",warranty:"Varies by treatment",best:"Rustic, cottage & craftsman homes"}
  };
  var PITCH_MULT={low:1.0,med:1.10,steep:1.25,complex:1.38};
  var STORY_MULT={"1":1.0,"2":1.08,"3":1.16};
  var LAYER_MULT={"1":1.0,"2":1.12,unk:1.06};
  var RPROP_MULT={res:1.0,multi:1.10,comm:1.20,hist:1.30};

  function estimateRoofing(opts){
    // opts: { roofType, sqft, pitch, stories, layers, propType, zip }
    var r = resolveZip(opts.zip) || {mult:1.0,region:"Your Area"};
    var base = ROOF_BASE[opts.roofType] || ROOF_BASE.asphalt;
    var m = (PITCH_MULT[opts.pitch]||1)*(STORY_MULT[opts.stories]||1)*(LAYER_MULT[opts.layers]||1)*(RPROP_MULT[opts.propType]||1)*r.mult;
    var lo = opts.sqft*base[0]*m, hi = opts.sqft*base[1]*m;
    var b = biasRange(lo, hi);
    return {low:Math.round(b[0]/100)*100, high:Math.round(b[1]/100)*100, region:r, meta:ROOF_META[opts.roofType]};
  }

  /* ================= KITCHEN & BATH (scope model) =================
     "mid" tier removed per client. We now emphasize the LOW (minor refresh)
     and HIGH-MID (the upper-middle renovation tier) plus a full gut. */
  var KITCHEN={minor:16000,"high-mid":52000,major:78000};
  var BATH={minor:11000,"high-mid":32000,major:48000};
  var KB_LABEL={minor:"Minor refresh","high-mid":"High-mid renovation",major:"Full gut"};
  function estimateKitchenBath(opts){
    // opts: { kitchen:scope|null, bath:scope|null, zip }
    var r = resolveZip(opts.zip) || {mult:1.0,region:"Your Area"};
    var total=0, lines=[];
    if(opts.kitchen){ var k=KITCHEN[opts.kitchen]*r.mult; total+=k; lines.push({label:"Kitchen — "+(KB_LABEL[opts.kitchen]||opts.kitchen),base:k}); }
    if(opts.bath){ var bb=BATH[opts.bath]*r.mult; total+=bb; lines.push({label:"Bathroom — "+(KB_LABEL[opts.bath]||opts.bath),base:bb}); }
    var b = biasRange(total*0.85, total*1.18);
    return {low:Math.round(b[0]/500)*500, high:Math.round(b[1]/500)*500, region:r, lines:lines};
  }

  /* ================= COMMERCIAL (per-sqft build-out model) =================
     Modeled on the "Not Sure" commercial data: new build-out, renovation,
     tenant improvement, and commercial electrical. Per-sqft base rate by
     project type × build complexity × regional cost index. */
  var COMM_RATE = {
    "new-buildout":   {label:"New Commercial Build-Out", lo:95, hi:240},
    "renovation":     {label:"Commercial Renovation",    lo:70, hi:185},
    "tenant-improve": {label:"Tenant Improvement",       lo:55, hi:145},
    "comm-electrical":{label:"Commercial Electrical",    lo:18, hi:60}
  };
  var COMM_CX = {standard:1.0, mid:1.18, complex:1.4};
  var COMM_CX_LABEL = {standard:"Standard finish", mid:"Mid / upgraded finish", complex:"Complex / high-spec"};
  function estimateCommercial(opts){
    // opts: { projectType, sqft, complexity, zip }
    var r = resolveZip(opts.zip) || {state:"",mult:1.0,region:"Your Area"};
    var t = COMM_RATE[opts.projectType] || COMM_RATE["renovation"];
    var cx = COMM_CX[opts.complexity] || 1.0;
    var sqft = opts.sqft || 2000;
    var lo = sqft * t.lo * cx * r.mult;
    var hi = sqft * t.hi * cx * r.mult;
    var b = biasRange(lo, hi);
    return {
      low: Math.round(b[0]/500)*500,
      high: Math.round(b[1]/500)*500,
      region: r,
      typeLabel: t.label,
      ratePerSqft: Math.round(t.lo*cx*r.mult) + "–" + Math.round(t.hi*cx*r.mult)
    };
  }
  var ADU_RATE = {
    "Detached ADU":{ca:210,nv:185,az:170}, "Garage Conversion ADU":{ca:155,nv:138,az:126},
    "Basement ADU":{ca:165,nv:148,az:135}, "Attached Addition":{ca:195,nv:175,az:160},
    "Junior ADU (JADU)":{ca:120,nv:108,az:98}, "Above-Garage ADU":{ca:225,nv:200,az:182}
  };
  var ADU_CX={Low:0.92,Medium:1.0,High:1.16};
  function estimateADU(opts){
    // opts: { type, sqft, complexity, zip }
    var r = resolveZip(opts.zip) || {state:"NV",mult:1.0,region:"Your Area"};
    var st = (r.state||"NV").toLowerCase();
    var rate = (ADU_RATE[opts.type]||ADU_RATE["Detached ADU"])[st] || ADU_RATE[opts.type].nv;
    var cx = ADU_CX[opts.complexity]||1.0;
    var mid = opts.sqft*rate*cx;
    var b = biasRange(mid*0.88, mid*1.12);
    return {low:Math.round(b[0]/500)*500, high:Math.round(b[1]/500)*500, region:r, ratePerSqft:rate};
  }

  root.OEEstimator = {
    fmt:fmt, resolveZip:resolveZip, stateFromZip:stateFromZip,
    ELECTRICAL:ELECTRICAL, HVAC:HVAC, ROOF_META:ROOF_META,
    KB_LABEL:KB_LABEL, COMM_RATE:COMM_RATE, COMM_CX_LABEL:COMM_CX_LABEL,
    estimateComponents:estimateComponents,
    estimateRoofing:estimateRoofing,
    estimateKitchenBath:estimateKitchenBath,
    estimateADU:estimateADU,
    estimateCommercial:estimateCommercial,
    biasRange:biasRange
  };
})(window);
