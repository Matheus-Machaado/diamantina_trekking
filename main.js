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

    mutate();                                // aplica a mudança (abre/fecha)

    const last = new Map(els.map(el => [el, el.getBoundingClientRect()]));
    els.forEach(el => {
      const f = first.get(el);
      const l = last.get(el);
      const dx = f.left - l.left;
      const dy = f.top - l.top;

      if (dx || dy) {
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.transition = 'transform 0s';
        // força o frame inicial
        void el.offsetWidth;
        // anima até o destino
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
      // mede a altura final
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
        // trava em auto depois de expandir
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