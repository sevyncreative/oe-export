var S={name:'',phone:'',email:'',street:'',city:'',state:'',zip:'',services:[],property:'',sqft:'',owner:'',age:'',access:'',timeline:''};

function goStep(n){
  document.querySelectorAll('.est-step').forEach(function(s){s.classList.remove('active');});
  document.getElementById('step'+n).classList.add('active');
  document.getElementById('prog').style.width=(n/5*100)+'%';
  window.scrollTo(0,0);
}
function show(id,v){document.getElementById(id).style.display=v?'block':'none';}
function val(id){return document.getElementById(id).value.trim();}
function fmt(n){return '$'+Math.round(n).toLocaleString();}

document.getElementById('svc-grid').addEventListener('click',function(e){
  var c=e.target;while(c&&c!==this){if(c.classList.contains('svc-card')){c.classList.toggle('on');return;}c=c.parentElement;}
});
['q-property','q-sqft','q-owner','q-age','q-access','q-timeline'].forEach(function(gid){
  document.getElementById(gid).addEventListener('click',function(e){
    var o=e.target;while(o&&o!==this){if(o.classList.contains('ropt')){
      document.querySelectorAll('#'+gid+' .ropt').forEach(function(r){r.classList.remove('on');});
      o.classList.add('on');return;}o=o.parentElement;}
  });
});

document.getElementById('btn1').addEventListener('click',function(){
  var ok=true;
  var name=val('fname'),phone=val('fphone'),email=val('femail'),street=val('fstreet'),city=val('fcity'),st=val('fstate').toUpperCase(),zip=val('fzip');
  show('err-fname',!name);if(!name)ok=false;
  show('err-contact',!phone&&!email);if(!phone&&!email)ok=false;
  show('err-street',!street);if(!street)ok=false;
  show('err-city',!city);if(!city)ok=false;
  show('err-state',!/^[A-Za-z]{2}$/.test(st));if(!/^[A-Za-z]{2}$/.test(st))ok=false;
  show('err-zip',!/^\d{5}$/.test(zip));if(!/^\d{5}$/.test(zip))ok=false;
  if(!ok)return;
  S.name=name;S.phone=phone;S.email=email;S.street=street;S.city=city;S.state=st;S.zip=zip;
  goStep(2);
});
document.getElementById('btn2').addEventListener('click',function(){
  var sel=Array.from(document.querySelectorAll('#svc-grid .svc-card.on')).map(function(c){return c.dataset.val;});
  show('err-svc',!sel.length);if(!sel.length)return;
  S.services=sel;goStep(3);
});
document.getElementById('btn3').addEventListener('click',function(){
  var prop=document.querySelector('#q-property .ropt.on');
  var sqft=document.querySelector('#q-sqft .ropt.on');
  var own=document.querySelector('#q-owner .ropt.on');
  var age=document.querySelector('#q-age .ropt.on');
  var acc=document.querySelector('#q-access .ropt.on');
  var tl=document.querySelector('#q-timeline .ropt.on');
  var ok=true;
  show('err-property',!prop);if(!prop)ok=false;
  show('err-sqft',!sqft);if(!sqft)ok=false;
  show('err-owner',!own);if(!own)ok=false;
  show('err-age',!age);if(!age)ok=false;
  show('err-access',!acc);if(!acc)ok=false;
  show('err-timeline',!tl);if(!tl)ok=false;
  if(!ok)return;
  S.property=prop.dataset.val;S.sqft=sqft.dataset.val;S.owner=own.dataset.val;
  S.age=age.dataset.val;S.access=acc.dataset.val;S.timeline=tl.dataset.val;
  buildAll();goStep(4);
});
document.getElementById('btn4').addEventListener('click',function(){
  document.getElementById('confirm-msg').textContent='Thanks '+S.name.split(' ')[0]+'! We\'ve received your request and will reach out to '+(S.phone||S.email)+' within 24 hours.';
  var svcNames={hvac_new:'New HVAC Installation',hvac_replace:'HVAC Removal & Replacement',windows:'Energy-Efficient Windows',insulation:'Insulation & Weatherization'};
  var svcs=S.services.map(function(s){return svcNames[s];}).join(', ');
  var rebTotal=document.getElementById('rebate-total-val')?document.getElementById('rebate-total-val').textContent:'';
  document.getElementById('confirm-summary').innerHTML=
    '<span>Address:</span> '+S.street+', '+S.city+', '+S.state+' '+S.zip+'<br>'+
    '<span>Services:</span> '+svcs+'<br>'+
    '<span>Project estimate:</span> '+document.getElementById('est-total').textContent+
    (rebTotal?'<br><span>Potential rebates:</span> '+rebTotal:'');
  goStep(5);
});
document.getElementById('back2').addEventListener('click',function(){goStep(1);});
document.getElementById('back3').addEventListener('click',function(){goStep(2);});
document.getElementById('back4').addEventListener('click',function(){goStep(3);});

var REGIONS={
  CA:{name:'California',labor:1.30,permit:1.40},
  NY:{name:'New York',labor:1.35,permit:1.35},
  WA:{name:'Washington',labor:1.20,permit:1.20},
  OR:{name:'Oregon',labor:1.15,permit:1.15},
  CO:{name:'Colorado',labor:1.10,permit:1.10},
  NV:{name:'Nevada',labor:1.00,permit:1.00},
  AZ:{name:'Arizona',labor:0.95,permit:0.90},
  FL:{name:'Florida',labor:0.92,permit:0.92},
  TX:{name:'Texas',labor:0.90,permit:0.85},
  DEFAULT:{name:'your area',labor:1.00,permit:1.00}
};
var ZIP_STATE={'900':'CA','901':'CA','902':'CA','903':'CA','904':'CA','905':'CA','906':'CA','907':'CA','908':'CA','909':'CA','910':'CA','911':'CA','912':'CA','913':'CA','914':'CA','915':'CA','916':'CA','917':'CA','918':'CA','919':'CA','920':'CA','921':'CA','922':'CA','923':'CA','924':'CA','925':'CA','926':'CA','927':'CA','928':'CA','929':'CA','930':'CA','931':'CA','932':'CA','933':'CA','934':'CA','935':'CA','936':'CA','937':'CA','938':'CA','939':'CA','940':'CA','941':'CA','942':'CA','943':'CA','944':'CA','945':'CA','946':'CA','947':'CA','948':'CA','949':'CA','950':'CA','951':'CA','952':'CA','953':'CA','954':'CA','955':'CA','956':'CA','957':'CA','958':'CA','959':'CA','960':'CA','961':'CA','890':'NV','891':'NV','893':'NV','894':'NV','895':'NV','897':'NV','898':'NV','850':'AZ','851':'AZ','852':'AZ','853':'AZ','855':'AZ','856':'AZ','857':'AZ','859':'AZ','860':'AZ','863':'AZ','864':'AZ','865':'AZ','750':'TX','751':'TX','752':'TX','753':'TX','754':'TX','755':'TX','756':'TX','757':'TX','758':'TX','759':'TX','760':'TX','761':'TX','762':'TX','763':'TX','764':'TX','765':'TX','766':'TX','767':'TX','768':'TX','769':'TX','770':'TX','771':'TX','772':'TX','773':'TX','774':'TX','775':'TX','776':'TX','777':'TX','778':'TX','779':'TX','780':'TX','781':'TX','782':'TX','783':'TX','784':'TX','785':'TX','786':'TX','787':'TX','788':'TX','789':'TX','790':'TX','791':'TX','792':'TX','793':'TX','794':'TX','795':'TX','796':'TX','797':'TX','798':'TX','799':'TX','320':'FL','321':'FL','322':'FL','323':'FL','324':'FL','325':'FL','326':'FL','327':'FL','328':'FL','329':'FL','330':'FL','331':'FL','332':'FL','333':'FL','334':'FL','335':'FL','336':'FL','337':'FL','338':'FL','339':'FL','341':'FL','342':'FL','344':'FL','346':'FL','347':'FL','349':'FL','100':'NY','101':'NY','102':'NY','103':'NY','104':'NY','105':'NY','106':'NY','107':'NY','108':'NY','109':'NY','110':'NY','111':'NY','112':'NY','113':'NY','114':'NY','115':'NY','116':'NY','117':'NY','118':'NY','119':'NY','980':'WA','981':'WA','982':'WA','983':'WA','984':'WA','985':'WA','986':'WA','988':'WA','989':'WA','990':'WA','991':'WA','992':'WA','993':'WA','994':'WA','970':'OR','971':'OR','972':'OR','973':'OR','974':'OR','975':'OR','976':'OR','977':'OR','978':'OR','979':'OR','800':'CO','801':'CO','802':'CO','803':'CO','804':'CO','805':'CO','806':'CO','807':'CO','808':'CO','809':'CO','810':'CO','811':'CO','812':'CO','813':'CO','814':'CO','815':'CO','816':'CO'};
var SERVICES={
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
var SQFT_M={sm:0.72,md:1.00,lg:1.38,xl:1.82};
var PROP_M={sfh:1.00,condo:0.88,multi:1.20,commercial:1.45};
var ACC_M={easy:1.00,moderate:1.12,difficult:1.25,unknown:1.08};

var ALL_REBATES=[
  {id:'ira_25c_hvac',name:'IRA Energy Efficient Home Credit (25C)',type:'federal',
   flatLow:600,flatHigh:2000,
   note:'Up to $2,000/yr for heat pumps; up to $600 for central A/C. Requires ENERGY STAR certification.',
   applies:['hvac_new','hvac_replace'],
   needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25c_windows',name:'IRA Energy Efficient Home Credit (25C)',type:'federal',
   flatLow:250,flatHigh:600,
   note:'Up to $600 for exterior windows/skylights. Must meet ENERGY STAR Most Efficient criteria.',
   applies:['windows'],
   needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_25c_insulation',name:'IRA Energy Efficient Home Credit (25C)',type:'federal',
   flatLow:150,flatHigh:1200,
   note:'Up to $1,200 for insulation and air sealing. No income limit. File IRS Form 5695.',
   applies:['insulation'],
   needs:{owner:'yes',property:['sfh','condo']}},
  {id:'ira_heehra',name:'IRA High-Efficiency Electric Home Rebate (HEEHRA)',type:'federal',
   flatLow:1750,flatHigh:8000,
   note:'Up to $8,000 for heat pump HVAC; $1,600 for insulation/weatherization. Income-based: low-to-moderate income households qualify for higher amounts.',
   applies:['hvac_new','hvac_replace','insulation'],
   needs:{owner:'yes',property:['sfh','condo','multi']}},
  {id:'ca_sgip',name:'CA Self-Generation Incentive Program (SGIP)',type:'state',
   flatLow:500,flatHigh:3000,
   note:'California rebate for heat pump HVAC and energy-efficient systems. Administered by CA utilities.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'CA',owner:'yes'}},
  {id:'ca_energy_upgrade',name:'CA Energy Upgrade California',type:'state',
   flatLow:1000,flatHigh:4500,
   note:'Whole-home rebates for qualifying HVAC + insulation upgrades. Income-qualified households may receive up to $4,500.',
   applies:['hvac_new','hvac_replace','insulation','windows'],
   needs:{state:'CA'}},
  {id:'ca_sce_rebate',name:'Southern CA Edison / PG&E HVAC Rebate',type:'utility',
   flatLow:200,flatHigh:1200,
   note:'Utility rebates for qualifying 16+ SEER2 HVAC systems. Amount varies by utility territory and system type.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'CA'}},
  {id:'nv_nvenergy_hvac',name:'NV Energy Home Energy Rebate — HVAC',type:'utility',
   flatLow:200,flatHigh:1500,
   note:'NV Energy rebates for qualifying high-efficiency HVAC systems (16+ SEER2). Applies to both new installs and replacements.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'NV'}},
  {id:'nv_nvenergy_insulation',name:'NV Energy Home Energy Rebate — Insulation',type:'utility',
   flatLow:100,flatHigh:600,
   note:'NV Energy rebates for attic and wall insulation upgrades meeting minimum R-value requirements.',
   applies:['insulation'],
   needs:{state:'NV'}},
  {id:'nv_nvenergy_windows',name:'NV Energy Home Energy Rebate — Windows',type:'utility',
   flatLow:50,flatHigh:400,
   note:'Per-window rebate for ENERGY STAR certified windows installed by a licensed contractor.',
   applies:['windows'],
   needs:{state:'NV'}},
  {id:'az_aps_hvac',name:'APS / SRP HVAC Efficiency Rebate',type:'utility',
   flatLow:200,flatHigh:1200,
   note:'Arizona Public Service and SRP offer rebates for 16+ SEER2 systems. APS also offers rebates for smart thermostats bundled with HVAC installs.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'AZ'}},
  {id:'az_tax_credit',name:'Arizona Residential Energy Tax Credit',type:'state',
   flatLow:200,flatHigh:1000,
   note:'AZ offers a 25% state tax credit (up to $1,000) for solar and some energy efficiency upgrades. Verify eligibility with a tax professional.',
   applies:['hvac_new','hvac_replace','insulation','windows'],
   needs:{state:'AZ',owner:'yes'}},
  {id:'tx_oncor_hvac',name:'Oncor / AEP Texas HVAC Rebate',type:'utility',
   flatLow:200,flatHigh:1500,
   note:'Major Texas utilities offer HVAC rebates. Oncor: up to $1,500 for qualifying heat pump systems. Availability varies by utility territory.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'TX'}},
  {id:'fl_fpl_hvac',name:'FPL / Duke Energy HVAC Rebate',type:'utility',
   flatLow:200,flatHigh:1000,
   note:'Florida Power & Light and Duke Energy Florida offer rebates for high-efficiency HVAC systems (15+ SEER2).',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'FL'}},
  {id:'co_xcel_hvac',name:'Xcel Energy HVAC Efficiency Rebate',type:'utility',
   flatLow:300,flatHigh:1800,
   note:'Xcel Energy offers up to $1,800 for qualifying heat pump installations in Colorado service territory.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'CO'}},
  {id:'wa_pse_hvac',name:'Puget Sound Energy HVAC Rebate',type:'utility',
   flatLow:500,flatHigh:3000,
   note:'PSE offers up to $3,000 for qualified heat pump systems. Washington also has strong utility programs for ductless mini-splits.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'WA'}},
  {id:'or_energy_trust',name:'Energy Trust of Oregon HVAC Rebate',type:'utility',
   flatLow:400,flatHigh:2500,
   note:'Energy Trust of Oregon offers substantial rebates for heat pumps and high-efficiency HVAC systems for PGE and Pacific Power customers.',
   applies:['hvac_new','hvac_replace'],
   needs:{state:'OR'}},
  {id:'older_home_weatherization',name:'WAP Weatherization Assistance Program',type:'federal',
   flatLow:1000,flatHigh:5000,
   note:'DOE Weatherization Assistance Program for homes built before 1990. Income-based — helps low-to-moderate income households with insulation, windows, and HVAC upgrades.',
   applies:['insulation','windows','hvac_new','hvac_replace'],
   needs:{age:['old','older']}}
];

function getStateCode(){
  return ZIP_STATE[S.zip.substring(0,3)]||S.state||'DEFAULT';
}
function checkRebate(reb){
  var n=reb.needs;
  if(!n)return true;
  if(n.owner&&S.owner!==n.owner)return false;
  if(n.state&&getStateCode()!==n.state)return false;
  if(n.property&&n.property.indexOf(S.property)===-1)return false;
  if(n.age&&n.age.indexOf(S.age)===-1)return false;
  var svcMatch=false;
  S.services.forEach(function(sv){if(reb.applies.indexOf(sv)>=0)svcMatch=true;});
  return svcMatch;
}
function buildRebateSection(grandLow,grandHigh){
  var matching=ALL_REBATES.filter(checkRebate);
  if(matching.length===0){
    return '<div class="no-rebate-box">&#128269; Based on the details provided, we did not find confirmed rebate programs for your exact profile — but <strong>rebates change frequently</strong>. OE Services will do a full rebate eligibility check during your free on-site quote. Federal IRA credits may still apply depending on your tax situation.</div>';
  }
  var totalLow=0,totalHigh=0,cards='';
  matching.forEach(function(r){
    var lo=r.flatLow||0,hi=r.flatHigh||lo;
    totalLow+=lo;totalHigh+=hi;
    var typeLabel={federal:'Federal',state:'State',utility:'Utility',local:'Local'}[r.type]||r.type;
    var typeClass={'federal':'type-federal','state':'type-state','utility':'type-utility','local':'type-local'}[r.type]||'type-local';
    var svcNames={hvac_new:'New HVAC',hvac_replace:'HVAC Replacement',windows:'Windows',insulation:'Insulation'};
    var applyTo=r.applies.filter(function(a){return S.services.indexOf(a)>=0;}).map(function(a){return svcNames[a];}).join(', ');
    cards+='<div class="rebate-card"><div class="rebate-card-type '+typeClass+'">'+typeLabel+'</div><div class="rebate-card-name">'+r.name+'</div><div class="rebate-card-amount">'+fmt(lo)+(hi>lo?' – '+fmt(hi):'')+'</div><div class="rebate-card-note">'+r.note+'</div><div class="rebate-card-services">Applies to: '+applyTo+'</div></div>';
  });
  var netLow=Math.max(0,grandLow-totalHigh),netHigh=Math.max(0,grandHigh-totalLow);
  setTimeout(function(){var el=document.getElementById('rebate-total-val');if(el)el.textContent=fmt(totalLow)+(totalHigh>totalLow?' – '+fmt(totalHigh):'');},100);
  return '<div class="rebate-hero"><div class="rebate-hero-badge">&#127381; Potential Savings Found</div><div class="rebate-hero-label">You may qualify for rebates &amp; incentives totaling</div><div class="rebate-hero-amount" id="rebate-total-val">'+fmt(totalLow)+(totalHigh>totalLow?' – '+fmt(totalHigh):'')+'</div><div class="rebate-hero-sub">Based on your address, property type, and selected services. Final eligibility confirmed at on-site quote.</div></div><div class="net-cost-box"><div class="net-cost-label">Estimated net cost after rebates<span>Project cost minus maximum potential rebates</span></div><div class="net-cost-range">'+fmt(netLow)+' – '+fmt(netHigh)+'</div></div><div class="rebate-section-title">Rebate &amp; incentive programs you likely qualify for</div><div class="rebate-grid">'+cards+'</div><div class="disclosure">&#9432; Rebate amounts shown are estimates based on published program data. Eligibility depends on final equipment specs, income verification where required, and program availability at time of installation. OE Services will verify all rebates and handle paperwork on your behalf.</div>';
}
function buildAll(){
  var stCode=getStateCode();
  var region=REGIONS[stCode]||REGIONS['DEFAULT'];
  var sm=SQFT_M[S.sqft]||1.0,pm=PROP_M[S.property]||1.0,am=ACC_M[S.access]||1.0;
  var mult=sm*pm*am,grandLow=0,grandHigh=0,bHtml='';
  S.services.forEach(function(svc){
    var sd=SERVICES[svc],svcLow=0,svcHigh=0,rows='<div class="breakdown-header">'+sd.label+'</div>';
    sd.components.forEach(function(comp){
      var lo,hi;
      if(comp.isPermit){lo=Math.round(comp.low*region.permit*pm);hi=Math.round(comp.high*region.permit*pm);}
      else{lo=Math.round(comp.low*mult*region.labor);hi=Math.round(comp.high*mult*region.labor);}
      svcLow+=lo;svcHigh+=hi;
      rows+='<div class="brow"><div class="brow-left">'+comp.name+'<div class="brow-sub">'+comp.sub+'</div></div><div class="brow-right"><div class="brow-range">'+fmt(lo)+' – '+fmt(hi)+'</div><div class="brow-pct">~'+comp.pct+'% of service</div></div></div>';
    });
    rows+='<div class="total-row"><div class="total-label">'+sd.label+' total</div><div class="total-range">'+fmt(svcLow)+' – '+fmt(svcHigh)+'</div></div>';
    bHtml+=rows;grandLow+=svcLow;grandHigh+=svcHigh;
  });
  if(S.services.length>1){
    bHtml+='<div class="total-row" style="background:#1D6FA4"><div class="total-label" style="color:#fff">All services combined</div><div class="total-range" style="color:#fff;font-size:26px">'+fmt(grandLow)+' – '+fmt(grandHigh)+'</div></div>';
  }
  document.getElementById('est-total').textContent=fmt(grandLow)+' – '+fmt(grandHigh);
  document.getElementById('est-hero-note').textContent='Regional pricing for '+region.name+' ('+S.city+', '+S.state+' '+S.zip+'). Includes all permits, planning & coordination.';
  document.getElementById('est-breakdown-wrap').innerHTML='<div class="breakdown-card">'+bHtml+'</div>';
  document.getElementById('est-intro').textContent='Hi '+S.name.split(' ')[0]+', here\'s your full project estimate and potential savings for '+S.street+'.';
  document.getElementById('alert-shopping').style.display=(S.timeline==='shopping')?'block':'none';
  document.getElementById('rebate-section').innerHTML=buildRebateSection(grandLow,grandHigh);
  var permitNotes={
    CA:'<strong>California note:</strong> CA requires Title 24 energy compliance on HVAC and window projects. Permit fees and plan check in CA are among the highest nationally — typically $450–$1,200+ depending on jurisdiction.',
    NV:'<strong>Nevada note:</strong> Nevada permit fees are moderate. Most HVAC and window permits run $200–$600. Clark County and City of Las Vegas have streamlined processes.',
    AZ:'<strong>Arizona note:</strong> AZ permit fees are below the national average. Most residential mechanical permits run $150–$450.',
    TX:'<strong>Texas note:</strong> Texas has no statewide energy code mandate — local jurisdictions vary widely. OE Services handles all permit applications and coordination.',
    DEFAULT:'<strong>Permitting note:</strong> Permit requirements and fees vary by city and county. OE Services handles all permit applications, plan submittals, and inspection scheduling on your behalf.'
  };
  document.getElementById('permit-note').innerHTML=permitNotes[stCode]||permitNotes['DEFAULT'];
}
