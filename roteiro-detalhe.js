(function(){
	// Galeria simples com thumbs e setas
	const viewport = document.querySelector('.rp-viewport');
	const track    = document.querySelector('.rp-track');
	const slides   = track ? Array.from(track.children) : [];
	const prevBtn  = document.querySelector('.rp-prev');
	const nextBtn  = document.querySelector('.rp-next');
	const thumbs   = Array.from(document.querySelectorAll('.rp-thumb'));

	let index = 0;
	function goTo(i){
		if(!slides.length) return;
		index = ((i % slides.length) + slides.length) % slides.length;
		const w = viewport.getBoundingClientRect().width;
		track.style.transform = `translateX(${-w*index}px)`;
		thumbs.forEach((t,ti)=>t.classList.toggle('is-active', ti===index));
	}
	prevBtn?.addEventListener('click', ()=>goTo(index-1));
	nextBtn?.addEventListener('click', ()=>goTo(index+1));
	thumbs.forEach(t=>t.addEventListener('click', ()=>goTo(parseInt(t.dataset.index||'0',10))));
	window.addEventListener('resize', ()=>goTo(index));
	goTo(0);
})();

(function(){
	const root   = document.getElementById('rpGrid');
	if(!root) return;

	const DAYS   = parseInt(root.dataset.days || '1', 10);
	const PRICE  = parseFloat(root.dataset.price || '0');

	const start  = document.getElementById('rpStart');
	const end    = document.getElementById('rpEnd');

	const pToggle = document.getElementById('rpPeopleToggle');
	const pPanel  = document.getElementById('rpPeoplePanel');
	const pLabel  = document.getElementById('rpPeopleLabel');
	const pMinus  = document.getElementById('rpMinus');
	const pPlus   = document.getElementById('rpPlus');
	const pQty    = document.getElementById('rpQty');

	const cta     = document.getElementById('rpSubmit');
	const subtotalEl = document.getElementById('rpSubtotal');

	// Helpers de data
	function dateFromInput(v){
		if(!v) return null;
		const [y,m,d] = v.split('-').map(n=>parseInt(n,10));
		if(!y||!m||!d) return null;
		return new Date(y, m-1, d);
	}
	function toInputDate(d){
		const y = d.getFullYear();
		const m = String(d.getMonth()+1).padStart(2,'0');
		const day = String(d.getDate()).padStart(2,'0');
		return `${y}-${m}-${day}`;
	}
	function addDays(d, n){
		const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		dt.setDate(dt.getDate() + n);
		return dt;
	}

	// Inicializa mínimas (hoje)
	const today = new Date();
	const todayISO = toInputDate(today);
	if(start) start.min = todayISO;
	if(end)   end.min   = todayISO;

	// Vincula datas (preenche automático)
	start?.addEventListener('change', ()=>{
		const s = dateFromInput(start.value);
		if(!s || !end) return;
		const e = addDays(s, DAYS);
		end.value = toInputDate(e);
		updateCTA();
	});

	end?.addEventListener('change', ()=>{
		const e = dateFromInput(end.value);
		if(!e || !start) return;
		const s = addDays(e, -DAYS);
		start.value = toInputDate(s);
		updateCTA();
	});

	// Seletor de pessoas (abre/fecha e stepper)
	function openPeople(){
		pPanel.hidden = false;
		pToggle.setAttribute('aria-expanded','true');
	}
	function closePeople(){
		pPanel.hidden = true;
		pToggle.setAttribute('aria-expanded','false');
	}

	pToggle?.addEventListener('click', (e)=>{
		e.stopPropagation();
		(pPanel.hidden ? openPeople() : closePeople());
	});
	document.addEventListener('click', (e)=>{
		if(!pPanel || pPanel.hidden) return;
		if(!pPanel.contains(e.target) && !pToggle.contains(e.target)) closePeople();
	});
	pToggle?.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closePeople(); });

	function clampQty(n){ return Math.max(1, Math.min(50, n|0)); }

	function setQty(n){
		const q = clampQty(n);
		pQty.value = String(q);
		pLabel.textContent = q === 1 ? '1 pessoa' : `${q} pessoas`;
		updateCTA();
	}
	pMinus?.addEventListener('click', ()=> setQty(parseInt(pQty.value||'1',10)-1));
	pPlus?.addEventListener('click',  ()=> setQty(parseInt(pQty.value||'1',10)+1));
	pQty?.addEventListener('input',   ()=> setQty(parseInt(pQty.value||'1',10)));

	// CTA + Subtotal
	function formatBRL(v){
		return (v||0).toLocaleString('pt-BR',{ style:'currency', currency:'BRL' });
	}
	function selectedQty(){ return parseInt(pQty?.value||'0',10) || 0; }
	function calcSubtotal(){ return selectedQty() * PRICE; }
	function hasData(){ return !!(start?.value && end?.value); }

	function updateCTA(){
		const q = selectedQty();
		subtotalEl.textContent = formatBRL(calcSubtotal());
		const ready = q > 0;
		cta.disabled = !ready;
		cta.textContent = ready ? 'Reservar agora' : 'Selecione data e quantidade de pessoas';
	}
	updateCTA();

	// Ações do CTA (pode integrar a um fluxo posterior)
	cta?.addEventListener('click', ()=>{
		if(cta.disabled) return;
		const inc = document.querySelector('.rp-incluso');
		if(inc) inc.scrollIntoView({ behavior:'smooth', block:'start' });
	});

	// Descrição completa (botão e "ver mais")
	const descWrap = document.getElementById('rpDesc');
	const btnDesc  = document.getElementById('rpDescBtn');
	const seeMore  = document.getElementById('rpSeeMore');
	const seeLess  = document.getElementById('rpSeeLess');

	function openDesc(){
		if(!descWrap) return;
		descWrap.style.height = 'auto';
		const h = descWrap.scrollHeight;
		descWrap.style.height = '0px';
		void descWrap.offsetHeight;
		descWrap.style.height = h + 'px';
		seeMore?.setAttribute('aria-expanded','true');
	}
	function closeDesc(){
		if(!descWrap) return;
		const h = descWrap.scrollHeight;
		descWrap.style.height = h + 'px';
		void descWrap.offsetHeight;
		descWrap.style.height = '0px';
		seeMore?.setAttribute('aria-expanded','false');
	}
	function toggleDesc(){
		const open = descWrap && parseFloat(getComputedStyle(descWrap).height) > 0;
		open ? closeDesc() : openDesc();
	}
	btnDesc?.addEventListener('click', toggleDesc);
	seeMore?.addEventListener('click', toggleDesc);
	seeLess?.addEventListener('click', toggleDesc);

	// Badge de intensidade na galeria (reaproveita estilos globais)
	(function ensureIntensityBadge(){
		const level = (root.dataset.intensidade || '').toLowerCase();
		if(!level) return;
		const slot = document.querySelector('.rp-viewport');
		if(!slot || slot.querySelector('.intensity-badge')) return;
		const badge = document.createElement('span');
		badge.className = 'intensity-badge intensity-' + level;
		badge.innerHTML = '<img src="img/icons/intensidade-icon.png" alt=""><span>'+ (level==='intenso'?'INTENSO':(level==='moderado'?'MODERADO':'LEVE')) +'</span>';
		slot.appendChild(badge);
	})();
})();