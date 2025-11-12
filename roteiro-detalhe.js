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

	const PRICE = parseFloat(root.dataset.price || '0');

	const startIso = document.getElementById('rpStart'); 
	const endIso   = document.getElementById('rpEnd');  
	const outStart = document.getElementById('rpStartText');
	const outEnd   = document.getElementById('rpEndText');

	const pToggle = document.getElementById('rpPeopleToggle');
	const pPanel  = document.getElementById('rpPeoplePanel');
	const pLabel  = document.getElementById('rpPeopleLabel');
	const pMinus  = document.getElementById('rpMinus');
	const pPlus   = document.getElementById('rpPlus');
	const pQty    = document.getElementById('rpQty');
	const pTotal  = document.getElementById('rpPeopleTotal');

	const cta       = document.getElementById('rpSubmit');
	const subtotalEl= document.getElementById('rpSubtotal');

	function parseISO(s){
		if(!s) return null;
		const [y,m,d] = s.split('-').map(n=>parseInt(n,10));
		if(!y||!m||!d) return null;
		const dt = new Date(y, m-1, d);
		dt.setHours(0,0,0,0);
		return isNaN(dt) ? null : dt;
	}
	function br(d){
		if(!d) return 'dd/mm/aaaa';
		return String(d.getDate()).padStart(2,'0') + '/' +
		       String(d.getMonth()+1).padStart(2,'0') + '/' +
		       d.getFullYear();
	}
	function formatBRL(v){
		return (v||0).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });
	}

	function hasValidRange(){
		const s = parseISO(startIso.value);
		const e = parseISO(endIso.value);
		return !!(s && e && e >= s);
	}

	function selectedQty(){
		return parseInt(pQty?.value||'0',10) || 0;
	}

	function updateCTA(){
		if(subtotalEl) subtotalEl.textContent = formatBRL(selectedQty() * PRICE);
		const ready = selectedQty() > 0 && hasValidRange();
		cta.disabled = !ready;
		cta.textContent = ready ? 'Reservar agora' : 'Selecione data e quantidade de pessoas';
	}

	function refreshPrettyFromHidden(){
		outStart.textContent = br(parseISO(startIso.value));
		outEnd.textContent   = br(parseISO(endIso.value));
	}

	function openPeople(){
		if(!pPanel) return;
		pPanel.hidden = false;
		pToggle.setAttribute('aria-expanded','true');
		requestAnimationFrame(()=>{ pPanel.classList.add('is-open'); });
	}
	function closePeople(){
		if(!pPanel) return;
		pPanel.classList.remove('is-open');
		const onEnd = (e)=>{
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

	function clampQty(n){ return Math.max(0, Math.min(50, n|0)); }
	function setQty(n){
		const q = clampQty(n);
		pQty.value = String(q);
		pLabel.textContent = q === 0 ? 'Selecione' : (q === 1 ? '1 pessoa' : `${q} pessoas`);
		if(pTotal) pTotal.textContent = formatBRL(q * PRICE).replace(/^R\$\s*/, '');
		updateCTA();
	}
	pMinus?.addEventListener('click', ()=> setQty(parseInt(pQty.value||'0',10) - 1));
	pPlus ?.addEventListener('click', ()=> setQty(parseInt(pQty.value||'0',10) + 1));
	pQty  ?.addEventListener('input', ()=> setQty(parseInt(pQty.value||'0',10)));

	const aboutEl   = document.querySelector('.rp-about');
	const descEl    = document.getElementById('rpDesc');
	const seeMoreBtn= document.getElementById('rpSeeMore');
	const seeLessBtn= document.getElementById('rpSeeLess');
	const openDescBtn=document.getElementById('rpDescBtn');

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
		const onEnd = (e)=>{
			if(e.target !== descEl) return;
			descEl.hidden = true;
			if(seeMoreBtn) seeMoreBtn.hidden = false;
			seeMoreBtn?.setAttribute('aria-expanded','false');
			openDescBtn?.setAttribute('aria-expanded','false');
			descEl.removeEventListener('transitionend', onEnd);
		};
		descEl.addEventListener('transitionend', onEnd);
	}
	document.getElementById('rpSubmit')?.addEventListener('click', ()=>{
		if(cta.disabled) return;
		const inc = document.querySelector('.rp-incluso');
		if(inc) inc.scrollIntoView({ behavior:'smooth', block:'start' });
	});
	seeMoreBtn ?.addEventListener('click', ()=>{ descEl?.classList.contains('is-open') ? collapseAbout() : expandAbout(); });
	seeLessBtn ?.addEventListener('click', ()=>{ collapseAbout(); });
	openDescBtn?.addEventListener('click', ()=>{ expandAbout({ scroll:true }); });

	startIso?.addEventListener('change', ()=>{ refreshPrettyFromHidden(); updateCTA(); });
	endIso  ?.addEventListener('change', ()=>{ refreshPrettyFromHidden(); updateCTA(); });
	document.addEventListener('rp:dates-commit', ()=>{ refreshPrettyFromHidden(); updateCTA(); });

	setQty(parseInt(pQty?.value||'0',10) || 0);
	refreshPrettyFromHidden();
	updateCTA();
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

(function(){
	const root = document.getElementById('rpGrid');
	if(!root) return;

	const DAYS     = parseInt(root.dataset.days || '1', 10);
	const startBtn = document.getElementById('rpStartBtn');
	const endBtn   = document.getElementById('rpEndBtn');
	const startIso = document.getElementById('rpStart');
	const endIso   = document.getElementById('rpEnd');   
	const outStart = document.getElementById('rpStartText');
	const outEnd   = document.getElementById('rpEndText');

	const today = new Date(); today.setHours(0,0,0,0);

	function clearTime(d){ d.setHours(0,0,0,0); }
	function toISO(d){
		if(!d) return '';
		return d.getFullYear() + '-' +
		       String(d.getMonth()+1).padStart(2,'0') + '-' +
		       String(d.getDate()).padStart(2,'0');
	}
	function fromISO(s){
		if(!s) return null;
		const [y,m,d] = s.split('-').map(n=>parseInt(n,10));
		if(!y||!m||!d) return null;
		const dt = new Date(y, m-1, d);
		clearTime(dt);
		return dt;
	}
	function br(d){
		if(!d) return 'dd/mm/aaaa';
		return String(d.getDate()).padStart(2,'0') + '/' +
		       String(d.getMonth()+1).padStart(2,'0') + '/' +
		       d.getFullYear();
	}
	function parseBR(v){
		const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if(!m) return null;
		const d = new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10));
		clearTime(d);
		return isNaN(d) ? null : d;
	}
	function addDays(d,n){
		const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
		clearTime(x);
		return x;
	}
	function clampMin(d){ return d && d < today ? new Date(today) : d; }

	function applySelection(s,e){
		startIso.value = s ? toISO(s) : '';
		endIso.value   = e ? toISO(e) : '';
		outStart.textContent = br(s);
		outEnd.textContent   = br(e);
		startIso.dispatchEvent(new Event('change'));
		endIso.dispatchEvent(new Event('change'));
		document.dispatchEvent(new CustomEvent('rp:dates-commit'));
	}

	function openRange(active){
		let startSel = clampMin(fromISO(startIso.value)) || null;
		let endSel   = clampMin(fromISO(endIso.value))   || null;

		if(startSel && (!endSel || endSel < startSel)) endSel = addDays(startSel, DAYS);
		if(endSel   && (!startSel || startSel > endSel)) startSel = addDays(endSel, -DAYS);

		const $        = (s)=>document.querySelector(s);
		const backdrop = $('#drpBackdrop');
		const modal    = $('#drpModal');
		const monthsEl = $('#drpMonths');
		const tabS     = $('#drpTabStart');
		const tabE     = $('#drpTabEnd');
		const inpS     = $('#drpInputStart');
		const inpE     = $('#drpInputEnd');
		const btnPrev  = $('.drp-prev');
		const btnNext  = $('.drp-next');
		const btnApply = $('#drpApply');
		const btnClear = $('#drpClear');

		let viewBase = startSel || endSel || new Date();
		clearTime(viewBase); viewBase.setDate(1);
		let focus = active === 'end' ? 'end' : 'start';

		function setFocus(f){
			focus = f;
			tabS.classList.toggle('is-active', f === 'start');
			tabE.classList.toggle('is-active', f === 'end');
			(f === 'start' ? inpS : inpE).focus();
		}
		function mask(v){
			let x = v.replace(/\D/g,'').slice(0,8);
			if(x.length >= 5) return x.slice(0,2)+'/'+x.slice(2,4)+'/'+x.slice(4);
			if(x.length >= 3) return x.slice(0,2)+'/'+x.slice(2);
			return x;
		}
		function setInputs(){
			inpS.value = startSel ? br(startSel) : '';
			inpE.value = endSel   ? br(endSel)   : '';
			btnApply.disabled = !(startSel && endSel && endSel >= startSel);
		}
		function monthTitle(y,m){
			return new Date(y, m, 1).toLocaleDateString('pt-BR', { month:'long' }).toLowerCase();
		}
		function buildMonth(y,m){
			const first = new Date(y, m, 1);
			const last  = new Date(y, m+1, 0);
			const lead  = first.getDay();
			const total = last.getDate();

			let html = '';
			html += '<div class="drp-month">';
			html += '<div class="drp-month-title">'+monthTitle(y,m)+'</div>';
			html += '<div class="drp-week">D S T Q Q S S</div>';
			html += '<div class="drp-grid">';

			for(let i=0;i<lead;i++){
				html += '<div class="drp-cell other"><div class="drp-day"></div></div>';
			}
			for(let d=1; d<=total; d++){
				const dt = new Date(y, m, d); clearTime(dt);
				const t = dt.getTime();
				const dis = t < today.getTime();
				const isStart = startSel && t === startSel.getTime();
				const isEnd   = endSel   && t === endSel.getTime();
				const inRange = startSel && endSel && t > startSel.getTime() && t < endSel.getTime();
				const atStart = startSel && t === startSel.getTime() && endSel && endSel > startSel;
				const atEnd   = endSel   && t === endSel.getTime()   && startSel && endSel > startSel;

				const cls = [
					'drp-cell',
					dis ? 'disabled' : '',
					inRange ? 'in-range' : '',
					isStart ? 'is-start' : '',
					isEnd ? 'is-end' : '',
					atStart ? 'range-start' : '',
					atEnd ? 'range-end' : ''
				].filter(Boolean).join(' ');

				html += '<div class="'+cls+'" data-time="'+t+'"><div class="drp-day">'+d+'</div></div>';
			}
			html += '</div></div>';
			return html;
		}
		function render(){
			const y = viewBase.getFullYear();
			const m = viewBase.getMonth();
			monthsEl.innerHTML = buildMonth(y,m) + buildMonth(y,m+1);

			monthsEl.querySelectorAll('.drp-cell:not(.disabled) .drp-day').forEach((el)=>{
				el.addEventListener('click', ()=>{
					const t = parseInt(el.parentElement.getAttribute('data-time'), 10);
					const d = new Date(t); clearTime(d);

					if(focus === 'start'){
						startSel = clampMin(d);
						if(!endSel || endSel < startSel) endSel = addDays(startSel, DAYS);
					}else{
						endSel = clampMin(d);
						if(!startSel || startSel > endSel) startSel = addDays(endSel, -DAYS);
					}
					setInputs();
					render();
				});
			});
		}

		function show(){
			backdrop.hidden = false;
			modal.hidden    = false;
			requestAnimationFrame(()=>{
				document.body.classList.add('drp-open');
				backdrop.classList.add('is-visible');
				modal.classList.add('is-visible');
			});
			setInputs();
			render();
			setFocus(focus);
		}
		function close(){
			backdrop.classList.remove('is-visible');
			modal.classList.remove('is-visible');
			setTimeout(()=>{
				backdrop.hidden = true;
				modal.hidden    = true;
				document.body.classList.remove('drp-open');
			}, 200);
		}
		function commit(){
			applySelection(startSel, endSel);
			close();
		}

		tabS.addEventListener('click', ()=> setFocus('start'));
		tabE.addEventListener('click', ()=> setFocus('end'));

		inpS.addEventListener('input', ()=>{
			const v = mask(inpS.value); inpS.value = v;
			const d = parseBR(v);
			if(d){
				startSel = clampMin(d);
				if(!endSel || endSel < startSel) endSel = addDays(startSel, DAYS);
				setInputs(); render();
			}
		});
		inpE.addEventListener('input', ()=>{
			const v = mask(inpE.value); inpE.value = v;
			const d = parseBR(v);
			if(d){
				endSel = clampMin(d);
				if(!startSel || startSel > endSel) startSel = addDays(endSel, -DAYS);
				setInputs(); render();
			}
		});

		btnPrev.addEventListener('click', ()=>{ viewBase.setMonth(viewBase.getMonth()-1); render(); });
		btnNext.addEventListener('click', ()=>{ viewBase.setMonth(viewBase.getMonth()+1); render(); });
		btnApply.addEventListener('click', commit);
		btnClear.addEventListener('click', ()=>{
			startSel = null; endSel = null;
			setInputs(); render();
		});

		backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) close(); });
		function onEsc(ev){ if(ev.key==='Escape'){ close(); document.removeEventListener('keydown', onEsc); } }
		document.addEventListener('keydown', onEsc);

		show();
	}

	document.getElementById('rpStartBtn')?.addEventListener('click', ()=> openRange('start'));
	document.getElementById('rpEndBtn')  ?.addEventListener('click', ()=> openRange('end'));
})();