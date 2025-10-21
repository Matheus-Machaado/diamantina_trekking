const langMenu = (() => {
  const toggleEl = document.getElementById('langTrigger');
  const listEl   = document.getElementById('langMenu');
  const items    = listEl.querySelectorAll('a');
  const state    = { open: false };

  function show(){
    listEl.classList.add('show');
    toggleEl.classList.add('is-open');             
    toggleEl.setAttribute('aria-expanded','true');
    state.open = true;
  }
  function hide(){
    listEl.classList.remove('show');
    toggleEl.classList.remove('is-open');           
    toggleEl.setAttribute('aria-expanded','false');
    state.open = false;
  }
  function toggle(){ state.open ? hide() : show(); }

  function markActive(anchor){
    listEl.querySelectorAll('a').forEach(x=>x.classList.remove('active'));
    anchor.classList.add('active');
    const flag = anchor.querySelector('img')?.getAttribute('src');
    if(flag){
      const btnFlag = toggleEl.querySelector('img');
      if(btnFlag){
        btnFlag.setAttribute('src', flag);
        btnFlag.setAttribute('alt', `Idioma atual: ${anchor.textContent.trim()}`);
      }
    }
  }

  toggleEl.addEventListener('click', (e)=>{ e.stopPropagation(); toggle(); });
  toggleEl.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(); }
    if(e.key === 'ArrowDown'){ show(); items[0]?.focus(); }
  });

  document.addEventListener('click', (e)=>{
    if(!listEl.contains(e.target) && !toggleEl.contains(e.target)) hide();
  });

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ hide(); toggleEl.focus(); }
  });

  items.forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      markActive(a);
      hide();
    });
  });

  return { show, hide, toggle, state, elements:{ toggleEl, listEl } };
})();

(function () {
  const grid = document.querySelector('.roteiros-grid');
  if (!grid) return;

  function flipLayout(mutate) {
    const els = Array.from(grid.children);
    const first = new Map(els.map(el => [el, el.getBoundingClientRect()]));

    mutate();                                
    const last = new Map(els.map(el => [el, el.getBoundingClientRect()]));
    els.forEach(el => {
      const f = first.get(el);
      const l = last.get(el);
      const dx = f.left - l.left;
      const dy = f.top - l.top;

      if (dx || dy) {
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'transform 0s';l
        void el.offsetWidth;
        el.style.transition = 'transform 340ms cubic-bezier(.2,.7,.2,1)';
        el.style.transform = 'translate(0, 0)';
      }
    });

    function cleanup(e) {
      if (e.propertyName !== 'transform') return;
      els.forEach(el => {
        el.style.transition = '';
        el.style.transform = '';
      });
      grid.removeEventListener('transitionend', cleanup, true);
    }
    grid.addEventListener('transitionend', cleanup, true);
  }

  document.querySelectorAll('.roteiro-card').forEach(card => {
    const row  = card.querySelector('.roteiro-card-line');
    const btn  = card.querySelector('.roteiro-toggle');
    const icon = btn ? btn.querySelector('img') : null;
    const desc = card.querySelector('.roteiro-desc');
    if (!row || !desc) return;

    row.setAttribute('tabindex', '0');

    function openDesc() {
      desc.style.height = 'auto';
      const h = desc.scrollHeight;
      desc.style.height = '0px';
      void desc.offsetHeight;

      flipLayout(() => {
        desc.style.height = h + 'px';
        card.classList.add('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'true');
        if (icon) icon.src = 'img/icons/menos-icon-card.png';
      });

      desc.addEventListener('transitionend', function onEnd() {
        if (card.classList.contains('is-open')) desc.style.height = 'auto';
        desc.removeEventListener('transitionend', onEnd);
      });
    }

    function closeDesc() {
      const h = desc.scrollHeight;
      desc.style.height = h + 'px';
      void desc.offsetHeight;

      flipLayout(() => {
        desc.style.height = '0px';
        card.classList.remove('is-open');
        if (btn) btn.setAttribute('aria-expanded', 'false');
        if (icon) icon.src = 'img/icons/mais-icon-card.png';
      });
    }

    function toggle() {
      card.classList.contains('is-open') ? closeDesc() : openDesc();
    }

    row.addEventListener('click', toggle);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
})();

(function(){
  const section = document.getElementById('guia');
  if(!section) return;

  const nums = Array.from(section.querySelectorAll('.guia-stats .num'));
  if(!nums.length) return;

  nums.forEach(el => {
    const raw = el.textContent.trim();
    const m = raw.match(/([\D]*?)([\d.,]+)(.*)/); 
    const prefix = m ? m[1] : '';
    const numStr = m ? m[2] : '0';
    const suffix = m ? m[3] : '';
    const decimals = numStr.includes(',') ? (numStr.split(',')[1] || '').length : 0;
    const target = parseFloat(numStr.replace(/\./g,'').replace(',', '.')) || 0;

    el.dataset.prefix = prefix;
    el.dataset.suffix = suffix;
    el.dataset.decimals = String(decimals);
    el.dataset.target = String(target);

    el.textContent = prefix + (0).toLocaleString('pt-BR', {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals
    }) + suffix;
  });

  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el, duration=2000){
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const target = parseFloat(el.dataset.target || '0');
    if (prefersReduce) {
      el.textContent = prefix + target.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      return;
    }
    let startTs;
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }
    function step(ts){
      if(!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      const val = target * easeOutCubic(p);
      el.textContent = prefix + val.toLocaleString('pt-BR', {
        minimumFractionDigits: decimals, maximumFractionDigits: decimals
      }) + suffix;
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let ran = false;
  const io = new IntersectionObserver((entries) => {
    const e = entries[0];
    if(!ran && e.isIntersecting){
      ran = true;
      nums.forEach(el => animateCount(el));
      io.disconnect();
    }
  }, { root: null, threshold: 0.4 });

  io.observe(section);
})();