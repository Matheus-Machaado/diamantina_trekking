(function(){
	const gal = document.getElementById('galeriaRoteiro');
	if(!gal) return;

	const viewport = gal.querySelector('.gal-viewport');
	const track = gal.querySelector('.gal-track');
	const slides = [...gal.querySelectorAll('.gal-slide')];
	const thumbs = [...gal.querySelectorAll('.gal-thumb')];
	const tView = gal.querySelector('.gal-thumbs-viewport');
	const prevBtn = gal.querySelector('.gal-prev');
	const nextBtn = gal.querySelector('.gal-next');

	let index = 0;

	function show(i){
		if(!slides.length) return;
		index = ((i % slides.length) + slides.length) % slides.length;
		const x = viewport.clientWidth * index;
		track.style.transform = `translateX(${-x}px)`;
		thumbs.forEach((t,ti)=> t.classList.toggle('is-active', ti===index));
		ensureThumbVisible(index);
		updateArrows();
	}

	function ensureThumbVisible(i){
		const btn = thumbs[i];
		if(!btn || !tView) return;
		const left = btn.offsetLeft;
		const right = left + btn.offsetWidth;
		const minV = tView.scrollLeft;
		const maxV = minV + tView.clientWidth;
		if(left < minV) tView.scrollLeft = left - 8;
		else if(right > maxV) tView.scrollLeft = right - tView.clientWidth + 8;
	}

	function updateArrows(){
		const single = slides.length <= 1;
		if(prevBtn) prevBtn.disabled = single;
		if(nextBtn) nextBtn.disabled = single;
	}

	thumbs.forEach((btn,i)=> btn.addEventListener('click', ()=> show(i)));
	if(prevBtn) prevBtn.addEventListener('click', ()=> show(index - 1));
	if(nextBtn) nextBtn.addEventListener('click', ()=> show(index + 1));
	window.addEventListener('resize', ()=> show(index));

	show(0);
})();

(function(){
	const root = document.getElementById('rpGrid');
	if(!root) return;

	const DAYS = parseInt(root.dataset.days || '1', 10);
	const PRICE = parseFloat(root.dataset.price || '0');

	const start = document.getElementById('rpStart');
	const end = document.getElementById('rpEnd');

	const pToggle = document.getElementById('rpPeopleToggle');
	const pPanel = document.getElementById('rpPeoplePanel');
	const pLabel = document.getElementById('rpPeopleLabel');
	const pMinus = document.getElementById('rpMinus');
	const pPlus = document.getElementById('rpPlus');
	const pQty = document.getElementById('rpQty');

	const cta = document.getElementById('rpSubmit');
	const subtotalEl = document.getElementById('rpSubtotal');

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

	const today = new Date();
	const todayISO = toInputDate(today);
	if(start) start.min = todayISO;
	if(end) end.min = todayISO;

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
	pPlus?.addEventListener('click', ()=> setQty(parseInt(pQty.value||'1',10)+1));
	pQty?.addEventListener('input', ()=> setQty(parseInt(pQty.value||'1',10)));

	function formatBRL(v){ return (v||0).toLocaleString('pt-BR',{ style:'currency', currency:'BRL' }); }
	function selectedQty(){ return parseInt(pQty?.value||'0',10) || 0; }
	function calcSubtotal(){ return selectedQty() * PRICE; }

	function updateCTA(){
		subtotalEl.textContent = formatBRL(calcSubtotal());
		const ready = selectedQty() > 0;
		cta.disabled = !ready;
		cta.textContent = ready ? 'Reservar agora' : 'Selecione data e quantidade de pessoas';
	}
	updateCTA();

	cta?.addEventListener('click', ()=>{
		if(cta.disabled) return;
		const inc = document.querySelector('.rp-incluso');
		if(inc) inc.scrollIntoView({ behavior:'smooth', block:'start' });
	});

	(function ensureIntensityBadge(){
		const level = (root.dataset.intensidade || '').toLowerCase();
		if(!level) return;
		const slot = document.querySelector('.gal-viewport');
		if(!slot || slot.querySelector('.intensity-badge')) return;
		const badge = document.createElement('span');
		badge.className = 'intensity-badge intensity-' + level;
		badge.innerHTML = '<img src="img/icons/intensidade-icon.png" alt=""><span>'+ (level==='intenso'?'INTENSO':(level==='moderado'?'MODERADO':'LEVE')) +'</span>';
		slot.appendChild(badge);
	})();
})();