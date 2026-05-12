// OE Services — shared estimator wizard logic (placeholder math)
(function(){
  window.OE = window.OE || {};

  // Generic multi-step wizard controller
  OE.Wizard = function(root){
    const steps = [...root.querySelectorAll('.step')];
    const bar = root.querySelector('.progress-bar');
    const progIdx = root.querySelector('[data-progress-idx]');
    const progLbl = root.querySelector('[data-progress-label]');
    let i = 0;
    function show(n){
      i = Math.max(0, Math.min(steps.length-1, n));
      steps.forEach((s,k)=>s.classList.toggle('active', k===i));
      const pct = ((i+1)/steps.length)*100;
      if(bar) bar.style.width = pct+'%';
      if(progIdx) progIdx.textContent = 'Step '+(i+1)+' of '+steps.length;
      if(progLbl){
        const lbl = steps[i].getAttribute('data-label') || '';
        progLbl.textContent = lbl;
      }
      window.scrollTo({top:0, behavior:'smooth'});
    }
    root.addEventListener('click', e=>{
      const next = e.target.closest('[data-next]');
      const prev = e.target.closest('[data-prev]');
      const go = e.target.closest('[data-goto]');
      if(next){ if(validate(steps[i])) show(i+1); }
      if(prev){ show(i-1); }
      if(go){ show(parseInt(go.dataset.goto,10)); }
    });
    function validate(stepEl){
      const required = stepEl.querySelectorAll('[required]');
      let ok=true;
      required.forEach(el=>{
        if(!el.value || (el.type==='checkbox' && !el.checked)){ el.classList.add('invalid'); ok=false; }
        else el.classList.remove('invalid');
      });
      const grp = stepEl.querySelector('[data-required-group]');
      if(grp){
        const need = parseInt(grp.dataset.requiredGroup||'1',10);
        const sel = grp.querySelectorAll('.opt-card.selected').length;
        if(sel < need){ grp.classList.add('shake'); setTimeout(()=>grp.classList.remove('shake'),400); ok=false; }
      }
      return ok;
    }
    show(0);
    return { show, get current(){return i;} };
  };

  // Option-card toggling
  OE.bindCards = function(root, opts){
    opts = opts || {};
    root.querySelectorAll('[data-card-group]').forEach(group=>{
      const multi = group.dataset.cardGroup === 'multi';
      group.querySelectorAll('.opt-card').forEach(card=>{
        card.addEventListener('click', ()=>{
          if(multi){
            card.classList.toggle('selected');
          } else {
            group.querySelectorAll('.opt-card').forEach(c=>c.classList.remove('selected'));
            card.classList.add('selected');
          }
          if(opts.onChange) opts.onChange(group);
        });
      });
    });
    root.querySelectorAll('[data-chip-group]').forEach(group=>{
      group.querySelectorAll('.chip').forEach(chip=>{
        chip.addEventListener('click', ()=>{
          group.querySelectorAll('.chip').forEach(c=>c.classList.remove('selected'));
          chip.classList.add('selected');
          if(opts.onChange) opts.onChange(group);
        });
      });
    });
  };

  // Format currency range
  OE.fmtRange = function(lo, hi){
    const f = n => '$'+Math.round(n/100)*100 < 10000
      ? '$'+(Math.round(n/100)*100).toLocaleString()
      : '$'+(Math.round(n/500)*500).toLocaleString();
    return f(lo)+' – '+f(hi);
  };

  // Placeholder pricing helpers (final logic added later)
  OE.priceFromCards = function(root, table, multiplier){
    multiplier = multiplier || 1;
    let lo=0, hi=0;
    root.querySelectorAll('.opt-card.selected[data-key]').forEach(c=>{
      const k = c.dataset.key;
      if(table[k]){
        lo += table[k][0]*multiplier;
        hi += table[k][1]*multiplier;
      }
    });
    return [lo, hi];
  };

})();
