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
	prevBtn?.addEventListener('click', ()=>show(index - 1));
	nextBtn?.addEventListener('click', ()=>show(index + 1));
	window.addEventListener('resize', ()=>show(index));

	show(0);
})();

(function(){
	const root = document.getElementById('rpGrid');
	if(!root) return;

	const DAYS = parseInt(root.dataset.days || '1', 10);
	const OFFSET = Math.max(1, DAYS);

	const startBtn = document.getElementById('rpStartBtn');
	const endBtn = document.getElementById('rpEndBtn');
	const isoStart = document.getElementById('rpStart');
	const isoEnd = document.getElementById('rpEnd');

	const $ = (s)=>document.querySelector(s);
	const backdrop = $('#drpBackdrop');
	const modal = $('#drpModal');
	const monthsEl = $('#drpMonths');
	const tabS = $('#drpTabStart');
	const tabE = $('#drpTabEnd');
	const inpS = $('#drpInputStart');
	const inpE = $('#drpInputEnd');
	const btnPrev = $('.drp-prev');
	const btnNext = $('.drp-next');
	const btnApply = $('#drpApply');
	const btnClear = $('#drpClear');

	const DAY = 86400000;
	const today = new Date(); today.setHours(0,0,0,0);
	const todayTime = today.getTime();
	const earliest = new Date(today.getFullYear(), today.getMonth(), 1);

	function clearTime(d){ d.setHours(0,0,0,0); }
	function toISO(d){ return !d ? '' : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
	function fromISO(s){
		if(!s) return null;
		const [y,m,d] = s.split('-').map(n=>parseInt(n,10));
		if(!y||!m||!d) return null;
		const dt = new Date(y, m-1, d);
		clearTime(dt);
		return isNaN(+dt) ? null : dt;
	}
	function br(d){ return !d ? 'dd/mm/aaaa' : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; }
	function parseBR(v){
		const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if(!m) return null;
		const d = new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10));
		clearTime(d);
		return isNaN(+d) ? null : d;
	}
	function addDays(d,n){ const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()+n); clearTime(x); return x; }
	function clampMin(d){ return d && d < today ? new Date(today) : d; }
	function commitHidden(s,e){
		isoStart.value = s ? toISO(s) : '';
		isoEnd.value = e ? toISO(e) : '';
		document.dispatchEvent(new CustomEvent('rp:dates-commit'));
	}

	let viewBase = new Date(today.getFullYear(), today.getMonth(), 1);
	let focus = 'start';
	let startSel = null;
	let endSel = null;

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
		inpE.value = endSel ? br(endSel) : '';
		btnApply.disabled = !(startSel && endSel && endSel >= startSel);
	}
	function monthTitle(y,m){ return new Date(y, m, 1).toLocaleDateString('pt-BR', { month:'long' }).toLowerCase(); }
	function NewDate(y,m,d){ const dt = new Date(y, m, d); clearTime(dt); return dt; }
	const WD = ['D','S','T','Q','Q','S','S'];

	function buildMonth(y,m){
		const first = NewDate(y, m, 1);
		const last = NewDate(y, m+1, 0);
		const lead = first.getDay();
		const total = last.getDate();
		let html = '';
		html += '<div class="drp-month">';
		html += `<div class="drp-month-title">${monthTitle(y,m)}</div>`;
		html += `<div class="drp-week">${WD.map(w=>`<span>${w}</span>`).join('')}</div>`;
		html += '<div class="drp-grid">';
		for(let i=0;i<lead;i++) html += '<div class="drp-cell other"><div class="drp-day"></div></div>';
		for(let d=1; d<=total; d++){
			const dt = NewDate(y, m, d);
			const t = dt.getTime();
			const isStart = startSel && t === startSel.getTime();
		            const isEnd = endSel && t === endSel.getTime();
			const inRange = startSel && endSel && t > startSel.getTime() && t < endSel.getTime();
			const atStart = isStart && endSel && endSel > startSel;
			const atEnd = isEnd && startSel && endSel > startSel;
			const disBase = (t < todayTime) || (focus === 'end' && t < (todayTime + OFFSET*DAY));
			const disabled = disBase && !(isStart || isEnd);
			const cls = [
				'drp-cell',
				disabled ? 'disabled' : '',
				inRange ? 'in-range' : '',
				isStart ? 'is-start' : '',
				isEnd ? 'is-end' : '',
				atStart ? 'range-start' : '',
				atEnd ? 'range-end' : ''
			].filter(Boolean).join(' ');
			html += `<div class="${cls}" data-time="${t}"><div class="drp-day">${d}</div></div>`;
		}
		html += '</div></div>';
		return html;
	}

	function updateNav(){
		const candidate = new Date(viewBase.getFullYear(), viewBase.getMonth() - 2, 1);
		const allowPrev = candidate.getTime() >= earliest.getTime();
		btnPrev.hidden = !allowPrev;
		btnPrev.style.display = allowPrev ? 'inline-flex' : 'none';
		btnPrev.disabled = !allowPrev;
		btnPrev.tabIndex = allowPrev ? 0 : -1;
		btnPrev.setAttribute('aria-hidden', allowPrev ? 'false' : 'true');
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
					endSel = addDays(startSel, OFFSET);
				}else{
					endSel = clampMin(d);
					startSel = addDays(endSel, -OFFSET);
				}
				setInputs();
				render();
			});
		});
		updateNav();
	}

	function openWithState(active){
		startSel = clampMin(fromISO(isoStart.value)) || null;
		endSel = clampMin(fromISO(isoEnd.value)) || null;
		if(active === 'start'){
			if(startSel) endSel = addDays(startSel, OFFSET);
			else if(endSel) startSel = addDays(endSel, -OFFSET);
		}else{
			if(endSel) startSel = addDays(endSel, -OFFSET);
			else if(startSel) endSel = addDays(startSel, OFFSET);
		}
		viewBase = startSel || endSel || new Date(today.getFullYear(), today.getMonth(), 1);
		clearTime(viewBase);
		viewBase.setDate(1);
		backdrop.hidden = false;
		modal.hidden = false;
		requestAnimationFrame(()=>{
			document.body.classList.add('drp-open');
			backdrop.classList.add('is-visible');
			modal.classList.add('is-visible');
		});
		setInputs();
		render();
		setFocus(active === 'end' ? 'end' : 'start');
	}

	function closeModal(){
		backdrop.classList.remove('is-visible');
		modal.classList.remove('is-visible');
		setTimeout(()=>{
			backdrop.hidden = true;
			modal.hidden = true;
			document.body.classList.remove('drp-open');
		}, 200);
	}

	function commit(){
		commitHidden(startSel, endSel);
		closeModal();
	}

	tabS.addEventListener('click', ()=> setFocus('start'));
	tabE.addEventListener('click', ()=> setFocus('end'));

	inpS.addEventListener('input', ()=>{
		inpS.value = mask(inpS.value);
		const d = parseBR(inpS.value);
		if(d){
			startSel = clampMin(d);
			endSel = addDays(startSel, OFFSET);
			setInputs();
			render();
		}
	});

	inpE.addEventListener('input', ()=>{
		inpE.value = mask(inpE.value);
		const d = parseBR(inpE.value);
		if(d){
			if(d.getTime() < (todayTime + OFFSET*DAY)) return;
			endSel = clampMin(d);
			startSel = addDays(endSel, -OFFSET);
			setInputs();
			render();
		}
	});

	btnPrev.addEventListener('click', ()=>{
		const candidate = new Date(viewBase.getFullYear(), viewBase.getMonth() - 2, 1);
		if(candidate.getTime() < earliest.getTime()) return;
		viewBase = candidate;
		render();
	});

	btnNext.addEventListener('click', ()=>{
		viewBase = new Date(viewBase.getFullYear(), viewBase.getMonth() + 2, 1);
		render();
	});

	btnApply.addEventListener('click', commit);

	btnClear.addEventListener('click', ()=>{
		startSel = null;
		endSel = null;
		setInputs();
		render();
	});

	backdrop.addEventListener('click', (e)=>{ if(e.target === backdrop) closeModal(); });
	function onEsc(ev){ if(ev.key==='Escape'){ closeModal(); document.removeEventListener('keydown', onEsc); } }

	startBtn?.addEventListener('click', ()=>{ document.addEventListener('keydown', onEsc); openWithState('start'); });
	endBtn?.addEventListener('click', ()=>{ document.addEventListener('keydown', onEsc); openWithState('end'); });
})();

(function(){
	const grid   = document.querySelector('#carrosselRoteiros');
	if(!grid) return;

	const prev   = document.getElementById('rmPrev');
	const next   = document.getElementById('rmNext');
	const arrows = document.querySelector('.rp-more-arrows');

	function fitCols(){
		const item = grid.querySelector('.roteiro-card');
		if(!item) return 0;
		const gap   = parseFloat(getComputedStyle(grid).gap) || 0;
		const w     = item.getBoundingClientRect().width;
		const avail = grid.clientWidth;
		return Math.max(1, Math.floor((avail + gap) / (w + gap)));
	}

	function shouldShow(){
		const total    = grid.querySelectorAll('.roteiro-card').length;
		if(total <= 1) return false;
		const cols     = fitCols();
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