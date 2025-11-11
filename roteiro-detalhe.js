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
		thumbs.forEach((t,ti)=>t.classList.toggle('is-active', ti===index));
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

	thumbs.forEach((btn,i)=>btn.addEventListener('click', ()=>show(i)));
	if(prevBtn) prevBtn.addEventListener('click', ()=>show(index - 1));
	if(nextBtn) nextBtn.addEventListener('click', ()=>show(index + 1));
	window.addEventListener('resize', ()=>show(index));

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
	const pTotal = document.getElementById('rpPeopleTotal');

	const cta = document.getElementById('rpSubmit');
	const subtotalEl = document.getElementById('rpSubtotal');

	const outStart = document.getElementById('rpStartText');
	const outEnd = document.getElementById('rpEndText');

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
	function fmtPretty(d){
		if(!d) return 'dd/mm/aaaa';
		let s = d.toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short' });
		return s.replace(/\./g,'').toLowerCase();
	}
	function formatBRL(v){
		return (v||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
	}

	const today = new Date();
	const todayISO = toInputDate(today);
	if(start) start.min = todayISO;
	if(end) end.min = todayISO;

	function ensureEndAfterStart(){
		const s = dateFromInput(start.value);
		const e = dateFromInput(end.value);
		if(!s) return;
		if(!e || e < s){
			end.value = toInputDate(addDays(s, DAYS));
		}
		end.min = start.value || todayISO;
	}

	function updateDatesPretty(){
		outStart.textContent = fmtPretty(dateFromInput(start.value));
		outEnd.textContent = fmtPretty(dateFromInput(end.value));
	}

	function selectedQty(){
		return parseInt(pQty?.value||'0',10) || 0;
	}
	function calcSubtotal(){
		return selectedQty() * PRICE;
	}
	function hasDates(){
		const s = dateFromInput(start.value);
		const e = dateFromInput(end.value);
		return !!(s && e && e >= s);
	}
	function updateCTA(){
		if(subtotalEl) subtotalEl.textContent = formatBRL(calcSubtotal());
		const ready = selectedQty() > 0 && hasDates();
		cta.disabled = !ready;
		cta.textContent = ready ? 'Reservar agora' : 'Selecione data e quantidade de pessoas';
	}

	let syncing = false;

	start?.addEventListener('change', ()=>{
		if(syncing) return;
		syncing = true;
		ensureEndAfterStart();
		updateDatesPretty();
		updateCTA();
		syncing = false;
	});

	end?.addEventListener('change', ()=>{
		if(syncing) return;
		const s = dateFromInput(start.value);
		const e = dateFromInput(end.value);
		syncing = true;
		if(s && e && e < s){
			start.value = toInputDate(e);
		}
		updateDatesPretty();
		updateCTA();
		syncing = false;
	});

	function openPeople(){
		if(!pPanel) return;
		pPanel.hidden = false;
		pToggle.setAttribute('aria-expanded','true');
		requestAnimationFrame(()=>{ pPanel.classList.add('is-open'); });
	}
	function closePeople(){
		if(!pPanel) return;
		pPanel.classList.remove('is-open');
		const onEnd = function(e){
			if(e.target !== pPanel) return;
			pPanel.hidden = true;
			pToggle.setAttribute('aria-expanded','false');
			pPanel.removeEventListener('transitionend', onEnd);
		};
		pPanel.addEventListener('transitionend', onEnd);
	}

	pToggle?.addEventListener('click', (e)=>{
		e.stopPropagation();
		pPanel.hidden ? openPeople() : closePeople();
	});
	document.addEventListener('click', (e)=>{
		if(!pPanel || pPanel.hidden) return;
		if(!pPanel.contains(e.target) && !pToggle.contains(e.target)) closePeople();
	});
	pToggle?.addEventListener('keydown', (e)=>{
		if(e.key==='Escape') closePeople();
	});

	function clampQty(n){
		return Math.max(0, Math.min(50, n|0));
	}
	function setQty(n){
		const q = clampQty(n);
		pQty.value = String(q);
		pLabel.textContent = q === 0 ? 'Selecione' : (q === 1 ? '1 pessoa' : `${q} pessoas`);
		const total = q * PRICE;
		if(pTotal) pTotal.textContent = formatBRL(total).replace(/^R\$\s*/, '');
		updateCTA();
	}
	pMinus?.addEventListener('click', ()=>{ setQty(parseInt(pQty.value||'0',10) - 1); });
	pPlus?.addEventListener('click', ()=>{ setQty(parseInt(pQty.value||'0',10) + 1); });
	pQty?.addEventListener('input', ()=>{ setQty(parseInt(pQty.value||'0',10)); });

	const aboutEl = document.querySelector('.rp-about');
	const descEl = document.getElementById('rpDesc');
	const seeMoreBtn = document.getElementById('rpSeeMore');
	const seeLessBtn = document.getElementById('rpSeeLess');
	const openDescBtn = document.getElementById('rpDescBtn');

	function expandAbout(opts){
		if(!descEl) return;
		descEl.hidden = false;
		aboutEl?.classList.add('is-open');
		seeMoreBtn?.setAttribute('aria-expanded','true');
		openDescBtn?.setAttribute('aria-expanded','true');
		seeMoreBtn?.setAttribute('aria-controls','rpDesc');
		openDescBtn?.setAttribute('aria-controls','rpDesc');
		if(seeMoreBtn) seeMoreBtn.hidden = true;
		requestAnimationFrame(()=>{ descEl.classList.add('is-open'); });
		if(opts && opts.scroll){
			(aboutEl || descEl).scrollIntoView({ behavior:'smooth', block:'start' });
		}
	}
	function collapseAbout(){
		if(!descEl) return;
		aboutEl?.classList.remove('is-open');
		descEl.classList.remove('is-open');
		const onEnd = e=>{
			if(e.target !== descEl) return;
			descEl.hidden = true;
			if(seeMoreBtn) seeMoreBtn.hidden = false;
			seeMoreBtn?.setAttribute('aria-expanded','false');
			openDescBtn?.setAttribute('aria-expanded','false');
			descEl.removeEventListener('transitionend', onEnd);
		};
		descEl.addEventListener('transitionend', onEnd);
	}

	cta?.addEventListener('click', ()=>{
		if(cta.disabled) return;
		const inc = document.querySelector('.rp-incluso');
		if(inc) inc.scrollIntoView({ behavior:'smooth', block:'start' });
	});
	seeMoreBtn?.addEventListener('click', ()=>{ descEl?.classList.contains('is-open') ? collapseAbout() : expandAbout(); });
	seeLessBtn?.addEventListener('click', ()=>{ collapseAbout(); });
	openDescBtn?.addEventListener('click', ()=>{ expandAbout({ scroll:true }); });

	setQty(parseInt(pQty?.value||'0',10) || 0);
	updateDatesPretty();
	updateCTA();
	ensureEndAfterStart();
})();

(function(){
	const grid = document.querySelector('#carrosselRoteiros');
	if(!grid) return;

	const prev = document.getElementById('rmPrev');
	const next = document.getElementById('rmNext');
	const arrows = document.querySelector('.rp-more-arrows');

	function fitCols(){
		const item = grid.querySelector('.roteiro-card');
		if(!item) return 0;
		const gap = parseFloat(getComputedStyle(grid).gap) || 0;
		const w = item.getBoundingClientRect().width;
		const avail = grid.clientWidth;
		return Math.max(1, Math.floor((avail + gap) / (w + gap)));
	}

	function shouldShow(){
		const total = grid.querySelectorAll('.roteiro-card').length;
		if(total <= 1) return false;
		const cols = fitCols();
		const overflow = (grid.scrollWidth - grid.clientWidth) > 1;
		return total > cols || overflow;
	}

	function applyVisibility(){
		const show = shouldShow();
		if(arrows){
			arrows.hidden = !show;
			arrows.style.display = show ? '' : 'none';
		}
		if(!prev || !next) return;
		if(!show){
			prev.disabled = true;
			next.disabled = true;
			return;
		}
		const max = grid.scrollWidth - grid.clientWidth - 1;
		prev.disabled = grid.scrollLeft <= 0;
		next.disabled = grid.scrollLeft >= max;
	}

	function step(){
		const item = grid.querySelector('.roteiro-card');
		if(!item) return grid.clientWidth;
		const gap = parseFloat(getComputedStyle(grid).gap) || 0;
		return item.getBoundingClientRect().width + gap;
	}

	function scrollToDir(dir){
		grid.scrollBy({ left: dir * step(), behavior:'smooth' });
	}

	prev?.addEventListener('click', ()=>scrollToDir(-1));
	next?.addEventListener('click', ()=>scrollToDir(1));

	grid.addEventListener('scroll', applyVisibility, { passive:true });
	window.addEventListener('resize', applyVisibility);

	const mo = new MutationObserver(applyVisibility);
	mo.observe(grid, { childList:true });

	const imgs = grid.querySelectorAll('img');
	let pending = imgs.length;
	if(pending){
		imgs.forEach(img=>{
			if(img.complete){ if(--pending===0) applyVisibility(); }
			else img.addEventListener('load', ()=>{ if(--pending===0) applyVisibility(); });
		});
	}

	setTimeout(applyVisibility, 0);
	setTimeout(applyVisibility, 200);
	setTimeout(applyVisibility, 800);
})();
