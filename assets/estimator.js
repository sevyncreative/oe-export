/* OE Services — Unified Pricing Engine */

var FLOOR_BIAS = 0.78; // raises LOW end 78% toward HIGH end
var CEIL_BIAS  = 1.06; // nudges HIGH end up 6%

function biasRange(lo, hi) {
  var bLo = lo + (hi - lo) * FLOOR_BIAS;
  var bHi = hi * CEIL_BIAS;
  return [Math.round(bLo / 100) * 100, Math.round(bHi / 100) * 100];
}

function fmt(n) { return '$' + Math.round(n).toLocaleString(); }

/* ── ZIP → Region resolver ─────────────────────────────────────────── */
var ZIP_REGION = (function(){
  var m = {};
  function add(prefixes, name, state, mult) {
    prefixes.forEach(function(p){ m[p] = {name:name, state:state, mult:mult}; });
  }
  // Nevada
  add(['889','890','891'], 'Las Vegas, NV',   'NV', 1.02);
  add(['893','894','895'], 'Reno, NV',         'NV', 1.04);
  add(['897'],             'Carson City, NV',  'NV', 1.01);
  add(['898'],             'Rural Nevada',     'NV', 0.98);
  // California — Bay Area
  add(['940','941'],       'San Francisco, CA','CA', 1.60);
  add(['943','944'],       'Peninsula, CA',    'CA', 1.60);
  add(['945','946','947'], 'East Bay, CA',     'CA', 1.55);
  add(['948'],             'North Bay, CA',    'CA', 1.48);
  add(['949','950','951'], 'San Jose, CA',     'CA', 1.55);
  // California — Los Angeles
  add(['900','901','902','903','904','905','906','907','908'], 'Los Angeles, CA', 'CA', 1.45);
  add(['910','911','912','913','914'], 'Pasadena/Burbank, CA', 'CA', 1.40);
  add(['926','927','928'], 'Orange County, CA', 'CA', 1.38);
  add(['930','931'],       'Ventura/Santa Barbara, CA', 'CA', 1.30);
  // California — San Diego
  add(['919','920','921'], 'San Diego, CA',    'CA', 1.38);
  // California — Inland
  add(['915','917','918'], 'Riverside/IE, CA', 'CA', 1.22);
  add(['923','924'],       'San Bernardino, CA','CA', 1.20);
  add(['916','942','956','957','958'], 'Sacramento, CA', 'CA', 1.26);
  add(['925','936','937','938'], 'Fresno, CA', 'CA', 1.18);
  add(['952','953'],       'Stockton, CA',     'CA', 1.20);
  add(['932','933'],       'Bakersfield, CA',  'CA', 1.18);
  add(['954'],             'Santa Rosa, CA',   'CA', 1.35);
  add(['939'],             'Salinas, CA',      'CA', 1.30);
  // Arizona
  add(['850','851','852','853'], 'Phoenix, AZ', 'AZ', 0.97);
  add(['855'],             'Mesa/East Valley, AZ', 'AZ', 0.96);
  add(['856','857'],       'Tucson, AZ',       'AZ', 0.92);
  add(['860'],             'Flagstaff, AZ',    'AZ', 0.94);
  add(['863','864'],       'Prescott, AZ',     'AZ', 0.93);
  add(['859','865'],       'Rural Arizona',    'AZ', 0.89);
  return m;
})();

function resolveZip(zip) {
  if (!zip || zip.length < 3) return {name:'Your area', state:'NV', mult:1.0};
  var r = ZIP_REGION[zip.slice(0,3)];
  if (r) return r;
  var p2 = zip.slice(0,2);
  if (p2 === '89' || p2 === '88') return {name:'Nevada',     state:'NV', mult:1.00};
  if (p2 >= '90' && p2 <= '96')   return {name:'California', state:'CA', mult:1.28};
  if (p2 === '85' || p2 === '86') return {name:'Arizona',    state:'AZ', mult:0.93};
  return {name:'Your area', state:'NV', mult:1.0};
}

/* ── Shared multipliers (Electrical + HVAC) ────────────────────────── */
var SQFT_M = {sm:0.72, md:1.00, lg:1.38, xl:1.82};
var PROP_M = {sfh:1.00, condo:0.88, multi:1.20, commercial:1.45};
var ACC_M  = {easy:1.00, moderate:1.12, difficult:1.25, unknown:1.08};

/* ── Electrical services ────────────────────────────────────────────── */
var ELECTRICAL_SVC = {
  panel_upgrade:{label:'Electrical Panel Upgrade',components:[
    {name:'Main panel & breakers',sub:'200A meter-main combo, 30–40 space',low:850,high:1800,pct:38,isPermit:false},
    {name:'Labor & installation',sub:'Demo old panel, mount new, re-terminate',low:900,high:1900,pct:36,isPermit:false},
    {name:'Permits & utility coordination',sub:'City electrical permit + utility disconnect',low:250,high:550,pct:9,isPermit:true},
    {name:'Project coordination',sub:'Scheduling, inspection management',low:150,high:300,pct:5,isPermit:true},
    {name:'Service mast & grounding upgrade',sub:'New riser, ground rods, GEC if required',low:200,high:600,pct:8,isPermit:false},
    {name:'Contingency (drywall, conduit)',sub:'Repairs, additional materials',low:100,high:300,pct:4,isPermit:false}
  ]},
  ev_charger:{label:'EV Charger Installation',components:[
    {name:'Charger & receptacle',sub:'Tesla Wall Connector, NEMA 14-50, or hardwired Level 2',low:450,high:1200,pct:42,isPermit:false},
    {name:'Labor & installation',sub:'Mounting, wire pull, breaker install',low:400,high:900,pct:36,isPermit:false},
    {name:'Permits & inspection',sub:'City electrical permit + final',low:120,high:280,pct:10,isPermit:true},
    {name:'Conduit, wire & breaker',sub:'Run from panel to charger location',low:150,high:450,pct:8,isPermit:false},
    {name:'Coordination & cleanup',sub:'Scheduling, debris, final test',low:80,high:180,pct:4,isPermit:true}
  ]},
  generator:{label:'Standby Generator Installation',components:[
    {name:'Generator unit',sub:'14–24kW air-cooled standby generator',low:4200,high:8500,pct:50,isPermit:false},
    {name:'Automatic transfer switch',sub:'200A service-rated ATS',low:600,high:1400,pct:10,isPermit:false},
    {name:'Labor & installation',sub:'Concrete pad, gas line, electrical tie-in',low:1800,high:3800,pct:24,isPermit:false},
    {name:'Permits & inspection',sub:'Electrical + mechanical permits',low:300,high:700,pct:6,isPermit:true},
    {name:'Project coordination',sub:'Gas company, city, manufacturer reg',low:250,high:500,pct:5,isPermit:true},
    {name:'Contingency',sub:'Site prep, additional gas piping',low:200,high:600,pct:5,isPermit:false}
  ]},
  battery_backup:{label:'Battery Backup System',components:[
    {name:'Battery unit(s)',sub:'Tesla Powerwall 3, Enphase IQ, or SolarEdge',low:9500,high:16000,pct:62,isPermit:false},
    {name:'Inverter & gateway',sub:'Integrated or stand-alone backup gateway',low:1200,high:2800,pct:9,isPermit:false},
    {name:'Labor & installation',sub:'Mounting, wiring, commissioning',low:2200,high:4500,pct:18,isPermit:false},
    {name:'Permits & utility interconnect',sub:'Electrical permit + utility approval',low:400,high:900,pct:5,isPermit:true},
    {name:'Project coordination',sub:'Permitting, inspection, monitoring setup',low:200,high:450,pct:3,isPermit:true},
    {name:'Contingency',sub:'Panel work, sub-panel additions',low:200,high:700,pct:3,isPermit:false}
  ]},
  new_circuits:{label:'New Circuits / Outlets',components:[
    {name:'Materials',sub:'Wire, breakers, boxes, devices',low:120,high:380,pct:26,isPermit:false},
    {name:'Labor & installation',sub:'Wire pull, terminate, devices',low:280,high:680,pct:54,isPermit:false},
    {name:'Permits & inspection',sub:'City electrical permit (multi-circuit)',low:60,high:180,pct:9,isPermit:true},
    {name:'Drywall / patch / cleanup',sub:'Minor repairs, debris',low:50,high:200,pct:8,isPermit:false},
    {name:'Coordination',sub:'Scheduling, inspection',low:30,high:80,pct:3,isPermit:true}
  ]},
  rewire:{label:'Rewire / Troubleshoot',components:[
    {name:'Diagnostic & labor',sub:'Find fault, replace, test',low:850,high:3200,pct:55,isPermit:false},
    {name:'Materials (wire, devices, fixtures)',sub:'Romex, devices, boxes, switches',low:300,high:1800,pct:28,isPermit:false},
    {name:'Permits & inspection',sub:'Electrical permit if scope requires',low:120,high:400,pct:8,isPermit:true},
    {name:'Drywall patch & cleanup',sub:'Minor repairs after wire runs',low:100,high:400,pct:5,isPermit:false},
    {name:'Coordination',sub:'Scheduling, inspection mgmt',low:60,high:160,pct:4,isPermit:true}
  ]}
};

/* ── HVAC services ──────────────────────────────────────────────────── */
var HVAC_SVC = {
  hvac_new:{label:'New HVAC Installation',components:[
    {name:'Equipment (unit, air handler, coil)',sub:'14–20 SEER2 energy-efficient system',low:4200,high:7800,pct:46,isPermit:false},
    {name:'Labor & installation',sub:'Ductwork, electrical, refrigerant line',low:2800,high:4500,pct:33,isPermit:false},
    {name:'Permits & plan check',sub:'City/county mechanical permit + review',low:450,high:900,pct:8,isPermit:true},
    {name:'Project coordination & scheduling',sub:'Estimating, permitting, inspection mgmt',low:350,high:600,pct:6,isPermit:true},
    {name:'Cleanup, haul-away & inspection',sub:'Debris removal, city final inspection',low:200,high:400,pct:4,isPermit:false},
    {name:'Contingency (access/unforeseen)',sub:'Typical buffer for surprises',low:200,high:500,pct:3,isPermit:false}
  ]},
  hvac_replace:{label:'HVAC Removal & Replacement',components:[
    {name:'New equipment (unit, coil, handler)',sub:'14–20 SEER2 replacement system',low:3800,high:7200,pct:44,isPermit:false},
    {name:'Removal & disposal of old system',sub:'Refrigerant recovery, haul-away',low:600,high:1200,pct:8,isPermit:false},
    {name:'Labor & installation',sub:'Install, wire, charge, test',low:2200,high:3800,pct:32,isPermit:false},
    {name:'Permits & plan check',sub:'Mechanical permit + city review',low:350,high:750,pct:7,isPermit:true},
    {name:'Project coordination',sub:'Permitting, inspection scheduling',low:300,high:550,pct:5,isPermit:true},
    {name:'Cleanup & final inspection',sub:'Site cleanup, city sign-off',low:150,high:350,pct:3,isPermit:false},
    {name:'Contingency',sub:'Ductwork repairs if needed',low:200,high:600,pct:4,isPermit:false}
  ]},
  windows:{label:'Energy-Efficient Window Replacement',components:[
    {name:'Windows (double/triple pane)',sub:'Low-E glass, vinyl or fiberglass frame',low:3200,high:8500,pct:52,isPermit:false},
    {name:'Labor & installation',sub:'Remove old, install, flash & seal',low:1800,high:3500,pct:28,isPermit:false},
    {name:'Permits & plan check',sub:'Building permit, energy compliance',low:300,high:800,pct:7,isPermit:true},
    {name:'Project coordination',sub:'Permitting, inspection mgmt',low:250,high:500,pct:5,isPermit:true},
    {name:'Finishing, caulking & cleanup',sub:'Interior/exterior trim, debris removal',low:300,high:700,pct:5,isPermit:false},
    {name:'Contingency (rot, framing repairs)',sub:'Common on older homes',low:200,high:800,pct:5,isPermit:false}
  ]},
  insulation:{label:'Insulation & Weatherization',components:[
    {name:'Materials (blown-in, batt, or spray)',sub:'R-38+ attic, R-15+ walls depending on zone',low:1800,high:4500,pct:48,isPermit:false},
    {name:'Labor & installation',sub:'Attic prep, install, air sealing',low:1200,high:3000,pct:36,isPermit:false},
    {name:'Permits & plan check',sub:'Energy/building permit where required',low:150,high:450,pct:6,isPermit:true},
    {name:'Project coordination',sub:'Assessment, scheduling, inspection',low:200,high:400,pct:5,isPermit:true},
    {name:'Cleanup & blower door test',sub:'Air leakage test, debris removal',low:150,high:350,pct:4,isPermit:false},
    {name:'Contingency (mold, moisture finds)',sub:'Common in older or poorly sealed homes',low:100,high:400,pct:3,isPermit:false}
  ]}
};

/* ── Electrical rebates ─────────────────────────────────────────────── */
var ELECTRICAL_REBATES = [
  {id:'ira_30c_ev',name:'IRA Alternative Fuel Refueling Property Credit (30C)',type:'federal',flatLow:300,flatHigh:1000,
   note:'30% federal tax credit, up to $1,000, for residential EV charging equipment installed in eligible census tracts. File IRS Form 8911.',
   applies:['ev_charger'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25d_battery',name:'IRA Residential Clean Energy Credit (25D)',type:'federal',flatLow:2800,flatHigh:6000,
   note:'30% federal tax credit on battery storage systems with 3+ kWh capacity. No cap. File IRS Form 5695.',
   applies:['battery_backup'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25c_panel',name:'IRA Energy Efficient Home Credit (25C) — Panel Upgrade',type:'federal',flatLow:200,flatHigh:600,
   note:'Up to $600 tax credit for electrical panel upgrades made to enable installation of qualifying clean energy property.',
   applies:['panel_upgrade'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_heehra_electric',name:'IRA High-Efficiency Electric Home Rebate (HEEHRA)',type:'federal',flatLow:1600,flatHigh:4000,
   note:'Up to $4,000 for electric panel upgrades and up to $2,500 for wiring. Income-based.',
   applies:['panel_upgrade','rewire','new_circuits'],needs:{owner:'yes',property:['sfh','condo','multi']}},
  {id:'ca_clean_energy',name:'CA Self-Generation Incentive Program (SGIP)',type:'state',flatLow:1500,flatHigh:5500,
   note:'California rebate for residential battery storage systems. Equity Resiliency tier offers higher rebates.',
   applies:['battery_backup'],needs:{state:'CA',owner:'yes'}},
  {id:'ca_carb_ev',name:'CALeVIP / PG&E EV Charger Rebate',type:'utility',flatLow:500,flatHigh:1500,
   note:'CALeVIP and CA utility EV charging rebates. PG&E and SCE both offer rebates up to $1,500.',
   applies:['ev_charger'],needs:{state:'CA'}},
  {id:'ca_panel_rebate',name:'CA TECH Clean California — Panel Upgrade',type:'state',flatLow:1000,flatHigh:3000,
   note:'California rebate for electrical panel upgrades made to enable electrification.',
   applies:['panel_upgrade'],needs:{state:'CA',owner:'yes'}},
  {id:'nv_nvenergy_ev',name:'NV Energy Electric Vehicle Charger Rebate',type:'utility',flatLow:300,flatHigh:1000,
   note:'NV Energy offers up to $1,000 rebate for qualifying Level 2 home EV chargers.',
   applies:['ev_charger'],needs:{state:'NV'}},
  {id:'nv_powershift',name:'NV Energy PowerShift Battery Program',type:'utility',flatLow:500,flatHigh:3000,
   note:'NV Energy rebates and bill credits for residential battery storage.',
   applies:['battery_backup'],needs:{state:'NV'}},
  {id:'az_aps_ev',name:'APS / SRP EV Charger Rebate',type:'utility',flatLow:250,flatHigh:750,
   note:'APS Take Charge AZ and SRP residential EV programs offer rebates and reduced TOU rates.',
   applies:['ev_charger'],needs:{state:'AZ'}},
  {id:'az_solar_battery',name:'AZ Residential Solar + Battery Tax Credit',type:'state',flatLow:500,flatHigh:1000,
   note:'AZ offers a 25% state tax credit (capped at $1,000) for renewable energy and energy storage systems.',
   applies:['battery_backup'],needs:{state:'AZ',owner:'yes'}},
  {id:'older_panel_grant',name:'DOE Weatherization Assistance — Electrical Safety',type:'federal',flatLow:800,flatHigh:3500,
   note:'Income-qualified households in homes built before 1970 may receive electrical safety upgrades at no cost through state WAP offices.',
   applies:['panel_upgrade','rewire','new_circuits'],needs:{age:['old','older']}}
];

/* ── HVAC rebates ───────────────────────────────────────────────────── */
var HVAC_REBATES = [
  {id:'ira_25c_hvac',name:'IRA Energy Efficient Home Credit (25C)',type:'federal',flatLow:600,flatHigh:2000,
   note:'Up to $2,000/yr for heat pumps; up to $600 for central A/C. Requires ENERGY STAR certification.',
   applies:['hvac_new','hvac_replace'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25c_windows',name:'IRA Energy Efficient Home Credit (25C) — Windows',type:'federal',flatLow:250,flatHigh:600,
   note:'Up to $600 for exterior windows/skylights. Must meet ENERGY STAR Most Efficient criteria.',
   applies:['windows'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25c_insulation',name:'IRA Energy Efficient Home Credit (25C) — Insulation',type:'federal',flatLow:150,flatHigh:1200,
   note:'Up to $1,200 for insulation and air sealing. No income limit. File IRS Form 5695.',
   applies:['insulation'],needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_heehra',name:'IRA High-Efficiency Electric Home Rebate (HEEHRA)',type:'federal',flatLow:1750,flatHigh:8000,
   note:'Up to $8,000 for heat pump HVAC; $1,600 for insulation/weatherization. Income-based.',
   applies:['hvac_new','hvac_replace','insulation'],needs:{owner:'yes',property:['sfh','condo','multi']}},
  {id:'ca_sgip',name:'CA Self-Generation Incentive Program (SGIP)',type:'state',flatLow:500,flatHigh:3000,
   note:'California rebate for heat pump HVAC and energy-efficient systems.',
   applies:['hvac_new','hvac_replace'],needs:{state:'CA',owner:'yes'}},
  {id:'ca_energy_upgrade',name:'CA Energy Upgrade California',type:'state',flatLow:1000,flatHigh:4500,
   note:'Whole-home rebates for qualifying HVAC + insulation upgrades.',
   applies:['hvac_new','hvac_replace','insulation','windows'],needs:{state:'CA'}},
  {id:'ca_sce_rebate',name:'Southern CA Edison / PG&E HVAC Rebate',type:'utility',flatLow:200,flatHigh:1200,
   note:'Utility rebates for qualifying 16+ SEER2 HVAC systems.',
   applies:['hvac_new','hvac_replace'],needs:{state:'CA'}},
  {id:'nv_nvenergy_hvac',name:'NV Energy Home Energy Rebate — HVAC',type:'utility',flatLow:200,flatHigh:1500,
   note:'NV Energy rebates for qualifying high-efficiency HVAC systems (16+ SEER2).',
   applies:['hvac_new','hvac_replace'],needs:{state:'NV'}},
  {id:'nv_nvenergy_insulation',name:'NV Energy Home Energy Rebate — Insulation',type:'utility',flatLow:100,flatHigh:600,
   note:'NV Energy rebates for attic and wall insulation upgrades.',
   applies:['insulation'],needs:{state:'NV'}},
  {id:'nv_nvenergy_windows',name:'NV Energy Home Energy Rebate — Windows',type:'utility',flatLow:50,flatHigh:400,
   note:'Per-window rebate for ENERGY STAR certified windows installed by a licensed contractor.',
   applies:['windows'],needs:{state:'NV'}},
  {id:'az_aps_hvac',name:'APS / SRP HVAC Efficiency Rebate',type:'utility',flatLow:200,flatHigh:1200,
   note:'Arizona Public Service and SRP offer rebates for 16+ SEER2 systems.',
   applies:['hvac_new','hvac_replace'],needs:{state:'AZ'}},
  {id:'az_tax_credit',name:'Arizona Residential Energy Tax Credit',type:'state',flatLow:200,flatHigh:1000,
   note:'AZ offers a 25% state tax credit (up to $1,000) for solar and some energy efficiency upgrades.',
   applies:['hvac_new','hvac_replace','insulation','windows'],needs:{state:'AZ',owner:'yes'}},
  {id:'older_home_weatherization',name:'WAP Weatherization Assistance Program',type:'federal',flatLow:1000,flatHigh:5000,
   note:'DOE Weatherization Assistance Program for homes built before 1980. Income-based.',
   applies:['insulation','windows','hvac_new','hvac_replace'],needs:{age:['old','older']}}
];

/* ── Roofing pricing ────────────────────────────────────────────────── */
var ROOF_BASE = {
  asphalt:       {label:'Asphalt 3-tab',           psf:3.50},
  architectural: {label:'Architectural shingle',    psf:5.00},
  metal:         {label:'Metal roofing',            psf:9.00},
  tile:          {label:'Concrete/clay tile',       psf:13.00},
  slate:         {label:'Natural slate',            psf:20.00},
  flat:          {label:'Flat membrane (TPO/EPDM)', psf:7.50}
};
var ROOF_PITCH   = {low:1.00, medium:1.15, steep:1.35};
var ROOF_STORIES = {one:1.00, two:1.12, three:1.25};
var ROOF_LAYERS  = {one:1.00, two:1.18};
var ROOF_PROP    = {sfh:1.00, condo:0.90, multi:1.10, commercial:1.20};

function calcRoofing(det, region) {
  var mat = ROOF_BASE[det.material] || ROOF_BASE.architectural;
  var adjPSF = mat.psf
    * (ROOF_PITCH[det.pitch] || 1)
    * (ROOF_STORIES[det.stories] || 1)
    * (ROOF_LAYERS[det.layers] || 1)
    * (ROOF_PROP[det.property] || 1)
    * region.mult;
  var area = Math.max(200, parseInt(det.sqft) || 2000);
  var rawMid = adjPSF * area;
  var rawLo = rawMid * 0.82;
  var rawHi = rawMid * 1.22;
  var permitLo = Math.round(200 * region.mult);
  var permitHi = Math.round(600 * region.mult);
  var grandLo = rawLo + permitLo;
  var grandHi = rawHi + permitHi;
  var biased = biasRange(grandLo, grandHi);
  var items = [
    {name:mat.label + ' (' + area.toLocaleString() + ' sqft × $' + adjPSF.toFixed(2) + '/sqft)', sub:'Material, underlayment, flashing', lo:Math.round(rawLo*0.62), hi:Math.round(rawHi*0.62)},
    {name:'Labor & installation', sub:'Crew, safety, equipment', lo:Math.round(rawLo*0.25), hi:Math.round(rawHi*0.25)},
    {name:'Tear-off & haul-away', sub:'Remove existing roof, disposal', lo:Math.round(rawLo*0.08), hi:Math.round(rawHi*0.08)},
    {name:'Permits & inspection', sub:'City/county roofing permit, final sign-off', lo:permitLo, hi:permitHi}
  ];
  return {lo:biased[0], hi:biased[1], items:items, regionName:region.name};
}

/* ── Kitchen & Bath pricing ─────────────────────────────────────────── */
var KITCHEN = {minor:16000, mid:38000, major:78000};
var BATH    = {minor:11000, mid:22000, major:48000};
var BUNDLE_DISCOUNT = 0.10;

function calcKitchenBath(det, region) {
  var kBase = det.kitchen ? KITCHEN[det.kitchen] * region.mult : 0;
  var bBase = det.bath    ? BATH[det.bath]    * region.mult : 0;
  var subtotal = kBase + bBase;
  var bundled = !!(det.kitchen && det.bath);
  var discount = bundled ? Math.round(subtotal * BUNDLE_DISCOUNT / 500) * 500 : 0;
  var total = subtotal - discount;
  var rawLo = total * 0.85;
  var rawHi = total * 1.18;
  var biased = biasRange(rawLo, rawHi);
  var kLabels = {minor:'Kitchen — Minor Update', mid:'Kitchen — Full Remodel', major:'Kitchen — Luxury Remodel'};
  var bLabels = {minor:'Bath — Cosmetic Update',  mid:'Bath — Full Remodel',   major:'Bath — Luxury Remodel'};
  var items = [];
  if (kBase) items.push({name:kLabels[det.kitchen], sub:'Cabinets, countertops, flooring, fixtures, labor', lo:Math.round(kBase*0.85), hi:Math.round(kBase*1.18)});
  if (bBase) items.push({name:bLabels[det.bath],    sub:'Tile, vanity, shower/tub, fixtures, labor',        lo:Math.round(bBase*0.85), hi:Math.round(bBase*1.18)});
  if (bundled && discount) items.push({name:'10% Bundle Discount', sub:'Savings from combining both rooms', lo:-discount, hi:-discount, isDiscount:true});
  return {lo:biased[0], hi:biased[1], kBase:kBase, bBase:bBase, discount:discount, bundled:bundled, items:items, regionName:region.name};
}

/* ── ADU / Commercial pricing ───────────────────────────────────────── */
var ADU_RATE = {
  detached:    {label:'Detached ADU',          ca:320, nv:198, az:178},
  garage:      {label:'Garage Conversion ADU', ca:185, nv:130, az:112},
  basement:    {label:'Basement ADU',          ca:245, nv:168, az:148},
  attached:    {label:'Attached Addition',     ca:280, nv:185, az:165},
  jadu:        {label:'Junior ADU (JADU)',      ca:160, nv:110, az:95},
  abovegarage: {label:'Above-Garage ADU',      ca:315, nv:195, az:175},
  commercial:  {label:'Commercial Build-Out',  ca:195, nv:145, az:125}
};
var ADU_FINISH = {standard:1.00, mid:1.18, luxury:1.42};
var ADU_SITE   = {easy:1.00, moderate:1.12, complex:1.28};

function calcADU(det, region) {
  var typeData = ADU_RATE[det.type] || ADU_RATE.detached;
  var stateKey = (region.state || 'NV').toLowerCase();
  if (!typeData[stateKey]) stateKey = 'nv';
  var basePSF = typeData[stateKey] * (ADU_FINISH[det.finish] || 1) * (ADU_SITE[det.site] || 1);
  var sqft = Math.max(100, Math.min(5000, parseInt(det.sqft) || 600));
  var baseTotal = basePSF * sqft;
  var permitLo = 8500 + sqft * 2;
  var permitHi = 18000 + sqft * 3;
  var rawLo = baseTotal * 0.85 + permitLo * 0.8;
  var rawHi = baseTotal * 1.18 + permitHi * 1.2;
  var biased = biasRange(rawLo, rawHi);
  var items = [
    {name:'Base construction (' + sqft.toLocaleString() + ' sqft × $' + Math.round(basePSF) + '/sqft)', sub:'Framing, MEP rough-in, drywall, roofing, exterior', lo:Math.round(baseTotal*0.72), hi:Math.round(baseTotal*0.92)},
    {name:'Finish work', sub:'Flooring, cabinets, fixtures, paint, trim', lo:Math.round(baseTotal*0.13), hi:Math.round(baseTotal*0.26)},
    {name:'Site preparation', sub:'Grading, utilities connection, foundation', lo:Math.round(baseTotal*0.06), hi:Math.round(baseTotal*0.14)},
    {name:'Permit, design & engineering', sub:'Plans, structural, title 24, city fees', lo:permitLo, hi:permitHi}
  ];
  return {lo:biased[0], hi:biased[1], sqft:sqft, items:items, regionName:region.name, typeLabel:typeData.label};
}

/* ── Component-based calc (Electrical + HVAC) ──────────────────────── */
function calcComponentBased(services, svcTable, det, region) {
  var sm = SQFT_M[det.sqft] || 1.0;
  var pm = PROP_M[det.property] || 1.0;
  var am = ACC_M[det.access] || 1.0;
  var mult = sm * pm * am;
  var grandLo = 0, grandHi = 0;
  var allItems = [];
  services.forEach(function(svc) {
    var sd = svcTable[svc];
    if (!sd) return;
    var svcLo = 0, svcHi = 0;
    sd.components.forEach(function(comp) {
      var lo, hi;
      if (comp.isPermit) {
        lo = Math.round(comp.low * region.mult * pm);
        hi = Math.round(comp.high * region.mult * pm);
      } else {
        lo = Math.round(comp.low * mult * region.mult);
        hi = Math.round(comp.high * mult * region.mult);
      }
      svcLo += lo; svcHi += hi;
      allItems.push({name:comp.name, sub:comp.sub, lo:lo, hi:hi, svcLabel:sd.label});
    });
    grandLo += svcLo; grandHi += svcHi;
    allItems.push({isSvcTotal:true, label:sd.label, lo:svcLo, hi:svcHi});
  });
  var biased = biasRange(grandLo, grandHi);
  return {lo:biased[0], hi:biased[1], items:allItems, regionName:region.name, rawLo:grandLo, rawHi:grandHi};
}

function filterRebates(rebateList, det, region) {
  return rebateList.filter(function(reb) {
    var n = reb.needs;
    if (!n) return true;
    if (n.owner && det.owner !== n.owner) return false;
    if (n.state && region.state !== n.state) return false;
    if (n.property && n.property.indexOf(det.property) === -1) return false;
    if (n.age && n.age.indexOf(det.age) === -1) return false;
    var services = det.services || [];
    return reb.applies.some(function(a) { return services.indexOf(a) >= 0; });
  });
}
