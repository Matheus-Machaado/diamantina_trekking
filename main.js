const langMenu = (() => {
    const toggleEl = document.getElementById('langTrigger'); 
    const listEl   = document.getElementById('langMenu');    
    const items    = listEl.querySelectorAll('a');
    const state    = { open: false };

    function show(){
      listEl.classList.add('show');
      toggleEl.setAttribute('aria-expanded','true');
      state.open = true;
    }
    function hide(){
      listEl.classList.remove('show');
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