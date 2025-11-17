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

	const PRICE = parseFloat(root.dataset.price || '0');

	const isoStart = document.getElementById('rpStart');
	const isoEnd = document.getElementById('rpEnd');
	const outStart = document.getElementById('rpStartText');
	const outEnd = document.getElementById('rpEndText');

	const pToggle = document.getElementById('rpPeopleToggle');
	const pPanel = document.getElementById('rpPeoplePanel');
	const pLabel = document.getElementById('rpPeopleLabel');
	const pMinus = document.getElementById('rpMinus');
	const pPlus = document.getElementById('rpPlus');
	const pQty = document.getElementById('rpQty');
	const pTotal = document.getElementById('rpPeopleTotal');
	const pUnit = document.getElementById('rpPeoplePrice');

	const cta = document.getElementById('rpSubmit');
	const subtotalEl = document.getElementById('rpSubtotal');

	function parseISO(s){
		if(!s) return null;
		const parts = s.split("-");
		if(parts.length !== 3) return null;
		const y = parseInt(parts[0],10);
		const m = parseInt(parts[1],10);
		const d = parseInt(parts[2],10);
		if(!y||!m||!d) return null;
		const dt = new Date(y, m-1, d);
		dt.setHours(0,0,0,0);
		return isNaN(+dt) ? null : dt;
	}
	function br(d){
		if(!d) return 'dd/mm/aaaa';
		const dd = String(d.getDate()).padStart(2,'0');
		const mm = String(d.getMonth()+1).padStart(2,'0');
		const yy = d.getFullYear();
		return dd + '/' + mm + '/' + yy;
	}
	function isHourly(){
		const label = document.querySelector('.rp-days b')?.textContent?.toLowerCase() || '';
		return /\bhora/.test(label);
	}
	function hasDates(){
		const s = parseISO(isoStart.value);
		const e = parseISO(isoEnd.value);
		if(!s || !e) return false;
		return isHourly() ? (e >= s) : (e > s);
	}
	function selectedQty(){
		return parseInt(pQty?.value||'0',10) || 0;
	}
	function formatBRL(v){
		return (v||0).toLocaleString('pt-BR',{ style:'currency', currency:'BRL' });
	}
	function updateDates(){
		outStart.textContent = br(parseISO(isoStart.value));
		outEnd.textContent = br(parseISO(isoEnd.value));
	}
	function updateCTA(){
		if(subtotalEl){
			subtotalEl.textContent = formatBRL(selectedQty() * PRICE);
		}
		const ready = selectedQty() > 0 && hasDates();
		cta.disabled = !ready;
		cta.textContent = ready ? 'Reservar agora' : 'Selecione data e quantidade de pessoas';
		if(ready){
			cta.classList.add('rp-cta-ready');
		}else{
			cta.classList.remove('rp-cta-ready');
		}
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

	function clampQty(n){
		return Math.max(0, Math.min(50, n|0));
	}
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

	const aboutEl = document.querySelector('.rp-about');
	const descEl = document.getElementById('rpDesc');
	const seeMore = document.getElementById('rpSeeMore');
	const seeLess = document.getElementById('rpSeeLess');
	const openDesc = document.getElementById('rpDescBtn');

	function expandAbout(opts){
		if(!descEl) return;
		descEl.hidden = false;
		aboutEl?.classList.add('is-open');
		seeMore?.setAttribute('aria-expanded','true');
		openDesc?.setAttribute('aria-expanded','true');
		seeMore?.setAttribute('aria-controls','rpDesc');
		openDesc?.setAttribute('aria-controls','rpDesc');
		if(seeMore) seeMore.hidden = true;
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
			if(seeMore) seeMore.hidden = false;
			seeMore?.setAttribute('aria-expanded','false');
			openDesc?.setAttribute('aria-expanded','false');
			descEl.removeEventListener('transitionend', onEnd);
		};
		descEl.addEventListener('transitionend', onEnd);
	}

	document.getElementById('rpSubmit')?.addEventListener('click', () => {
		if (cta.disabled) return;

		const title   = document.querySelector('.rp-title')?.textContent.trim() || 'Roteiro';
		const durText = document.querySelector('.rp-days b')?.textContent.trim()
					|| `${(parseInt(root.dataset.days||'1',10)||1)} ${((parseInt(root.dataset.days||'1',10)||1) > 1 ? 'dias' : 'dia')}`;
		const qty     = selectedQty();

		const s = parseISO(document.getElementById('rpStart').value);
		const e = parseISO(document.getElementById('rpEnd').value);

		const days  = Math.max(1, parseInt(root.dataset.days || '1', 10));
		const hours = Math.max(0, parseInt(root.dataset.hours || String(days * 24), 10));

		const dataLabel = (hours < 24 || days === 1) ? 'Data' : 'Período';
		let dataTexto = 'a combinar';
		if (s && e) {
			if (hours < 24 || days === 1) {
			dataTexto = br(s);
			} else {
			const nDias = Math.round((e - s) / (24 * 60 * 60 * 1000));
			dataTexto = `${br(s)} → ${br(e)} (${nDias} ${nDias > 1 ? 'dias' : 'dia'})`;
			}
		}

		const msg =
		`Olá, Diamantina Trekking!
Quero agendar um roteiro pelo site.

• Roteiro: ${title}
• Duração: ${durText}
• Pessoas: ${qty}
• ${dataLabel}: ${dataTexto}

Pode verificar disponibilidade e me passar os próximos passos? Obrigado(a)!`;

		const zapBase = (() => {
			const a = document.querySelector('.zap-float');
			if (a) {
				try {
					const u = new URL(a.getAttribute('href'), location.href);
					u.search = '';
					return u.origin + u.pathname;
				} catch (_) {}
			}
			return 'https://wa.me/5511910254958';
	})();

	const url = zapBase + '?text=' + encodeURIComponent(msg);
	window.open(url, '_blank', 'noopener');

	const inc = document.querySelector('.rp-incluso');
	if (inc) inc.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
	seeMore ?.addEventListener('click', ()=>{ descEl?.classList.contains('is-open') ? collapseAbout() : expandAbout(); });
	seeLess ?.addEventListener('click', ()=>{ collapseAbout(); });
	openDesc?.addEventListener('click', ()=>{ expandAbout({ scroll:true }); });

	document.addEventListener('rp:dates-commit', ()=>{
		updateDates();
		updateCTA();
	});

	if(pUnit){
		pUnit.textContent = formatBRL(PRICE);
	}

	setQty(parseInt(pQty?.value||'0',10) || 0);
	updateDates();
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

	const DAYS = parseInt(root.dataset.days || '1', 10);
	const DUR_LABEL = document.querySelector('.rp-days b')?.textContent?.toLowerCase() || '';
	const HOURLY = /\bhora/.test(DUR_LABEL);
	const SPAN = HOURLY ? 0 : Math.max(1, DAYS);

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
	const today = new Date(); 
	today.setHours(0,0,0,0);
	const todayTime = today.getTime();
	const MIN_VIEW = new Date(today.getFullYear(), today.getMonth(), 1);

	function clearTime(d){
		d.setHours(0,0,0,0);
	}
	function toISO(d){
		if(!d) return "";
		return d.getFullYear() + "-" +
		       String(d.getMonth()+1).padStart(2,"0") + "-" +
		       String(d.getDate()).padStart(2,"0");
	}
	function fromISO(s){
		if(!s) return null;
		const parts = s.split("-");
		if(parts.length !== 3) return null;
		const y = parseInt(parts[0],10);
		const m = parseInt(parts[1],10);
		const d = parseInt(parts[2],10);
		if(!y||!m||!d) return null;
		const dt = new Date(y, m-1, d);
		clearTime(dt);
		return isNaN(+dt) ? null : dt;
	}
	function br(d){
		if(!d) return "dd/mm/aaaa";
		const dd = String(d.getDate()).padStart(2,"0");
		const mm = String(d.getMonth()+1).padStart(2,"0");
		const yy = d.getFullYear();
		return dd + "/" + mm + "/" + yy;
	}
	function parseBR(v){
		const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
		if(!m) return null;
		const d = new Date(parseInt(m[3],10), parseInt(m[2],10)-1, parseInt(m[1],10));
		clearTime(d);
		return isNaN(+d) ? null : d;
	}
	function addDays(d,n){
		const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()+n);
		clearTime(x);
		return x;
	}
	function minEndDate(){
		return addDays(today, SPAN);
	}
	function commitHidden(s,e){
		isoStart.value = s ? toISO(s) : "";
		isoEnd.value = e ? toISO(e) : "";
		document.dispatchEvent(new CustomEvent("rp:dates-commit"));
	}

	let viewBase = new Date(MIN_VIEW);
	let focus = "start";
	let startSel = null;
	let endSel = null;

	function setFocus(f){
		focus = f;
		tabS.classList.toggle("is-active", f === "start");
		tabE.classList.toggle("is-active", f === "end");
		(f === "start" ? inpS : inpE).focus();
	}
	function mask(v){
		let x = v.replace(/\D/g,"").slice(0,8);
		if(x.length >= 5) return x.slice(0,2)+"/"+x.slice(2,4)+"/"+x.slice(4);
		if(x.length >= 3) return x.slice(0,2)+"/"+x.slice(2);
		return x;
	}
	function setInputs(){
		inpS.value = startSel ? br(startSel) : "";
		inpE.value = endSel ? br(endSel) : "";
		btnApply.disabled = !(startSel && endSel && (SPAN === 0 ? (endSel >= startSel) : (endSel > startSel)));
	}
	function monthTitle(y,m){
		return new Date(y, m, 1).toLocaleDateString("pt-BR", { month:"long" }).toLowerCase();
	}
	function NewDate(y,m,d){
		const dt = new Date(y, m, d);
		clearTime(dt);
		return dt;
	}
	const WD = ["D","S","T","Q","Q","S","S"];

	function buildMonth(y,m){
		const first = NewDate(y, m, 1);
		const last = NewDate(y, m+1, 0);
		const lead = first.getDay();
		const total = last.getDate();
		const minEndTime = minEndDate().getTime();

		let html = "";
		html += '<div class="drp-month">';
		html += '<div class="drp-month-title">'+monthTitle(y,m)+'</div>';
		html += '<div class="drp-week">'+WD.map(w=>"<span>"+w+"</span>").join("")+'</div>';
		html += '<div class="drp-grid">';

		for(let i=0;i<lead;i++){
			html += '<div class="drp-cell other"><div class="drp-day"></div></div>';
		}

		for(let d=1; d<=total; d++){
			const dt = NewDate(y, m, d);
			const t = dt.getTime();

			const isStart = startSel && t === startSel.getTime();
			const isEnd   = endSel && t === endSel.getTime();
			const inRange = startSel && endSel && t > startSel.getTime() && t < endSel.getTime();
			const atStart = isStart && endSel && endSel > startSel;
			const atEnd   = isEnd && startSel && endSel > startSel;

			let disabled = false;
			if(t < todayTime) disabled = true;
			if(focus === "end" && t < minEndTime) disabled = true;
			if(isStart || isEnd) disabled = false;

			const cls = [
				"drp-cell",
				disabled ? "disabled" : "",
				inRange ? "in-range" : "",
				isStart ? "is-start" : "",
				isEnd ? "is-end" : "",
				atStart ? "range-start" : "",
				atEnd ? "range-end" : ""
			].filter(Boolean).join(" ");

			html += '<div class="'+cls+'" data-time="'+t+'"><div class="drp-day">'+d+'</div></div>';
		}

		html += "</div></div>";
		return html;
	}

	function updateNav(){
		const cand = new Date(viewBase.getFullYear(), viewBase.getMonth() - 2, 1);
		const allowPrev = cand.getTime() >= MIN_VIEW.getTime();
		btnPrev.hidden = !allowPrev;
		btnPrev.style.display = allowPrev ? "inline-flex" : "none";
		btnPrev.disabled = !allowPrev;
		btnPrev.tabIndex = allowPrev ? 0 : -1;
		btnPrev.setAttribute("aria-hidden", allowPrev ? "false" : "true");
	}

	function render(){
		const y = viewBase.getFullYear();
		const m = viewBase.getMonth();
		monthsEl.innerHTML = buildMonth(y,m) + buildMonth(y,m+1);
		updateNav();
		monthsEl.querySelectorAll(".drp-cell:not(.disabled) .drp-day").forEach((el)=>{
			el.addEventListener("click", ()=>{
				const t = parseInt(el.parentElement.getAttribute("data-time"), 10);
				const d = new Date(t);
				clearTime(d);
				const minEnd = minEndDate().getTime();

				if(focus === "start"){
					if(d.getTime() < todayTime) return;
					startSel = d;
					endSel = addDays(startSel, SPAN);
				}else{
					if(d.getTime() < minEnd) return;
					endSel = d;
					startSel = addDays(endSel, -SPAN);
				}

				setInputs();
				render();
			});
		});
	}

	function openWithState(active){
		const s = fromISO(isoStart.value);
		const e = fromISO(isoEnd.value);
		
		const okRange = s && e && (SPAN === 0 ? (e >= s) : (e > s));
		if(okRange){
			startSel = s;
			endSel = e;
		}else if(s && !e){
			startSel = s;
			endSel = addDays(startSel, SPAN);
		}else if(!s && e){
			endSel = e;
			startSel = addDays(endSel, -SPAN);
			if(startSel.getTime() < todayTime){
				startSel = null;
				endSel = null;
			}
		}else{
			startSel = null;
			endSel = null;
		}

		if(startSel){
			viewBase = new Date(startSel.getFullYear(), startSel.getMonth(), 1);
		}else if(endSel){
			viewBase = new Date(endSel.getFullYear(), endSel.getMonth(), 1);
		}else{
			viewBase = new Date(MIN_VIEW);
		}
		clearTime(viewBase);
		viewBase.setDate(1);

		backdrop.hidden = false;
		modal.hidden = false;
		requestAnimationFrame(()=>{
			document.body.classList.add("drp-open");
			backdrop.classList.add("is-visible");
			modal.classList.add("is-visible");
		});

		setInputs();
		render();
		setFocus(active === "end" ? "end" : "start");
	}

	function closeModal(){
		backdrop.classList.remove("is-visible");
		modal.classList.remove("is-visible");
		setTimeout(()=>{
			backdrop.hidden = true;
			modal.hidden = true;
			document.body.classList.remove("drp-open");
		}, 200);
	}

	function commit(){
		const ok = startSel && endSel && (SPAN === 0 ? (endSel >= startSel) : (endSel > startSel));
		if(ok) commitHidden(startSel, endSel);
		closeModal();
	}


	tabS.addEventListener("click", ()=> setFocus("start"));
	tabE.addEventListener("click", ()=> setFocus("end"));

	inpS.addEventListener("input", ()=>{
		inpS.value = mask(inpS.value);
		const d = parseBR(inpS.value);
		if(d){
			if(d.getTime() < todayTime) return;
			startSel = d;
			endSel = addDays(startSel, SPAN);
			setInputs();
			render();
		}
	});

	inpE.addEventListener("input", ()=>{
		inpE.value = mask(inpE.value);
		const d = parseBR(inpE.value);
		if(d){
			const minEnd = minEndDate();
			if(d.getTime() < minEnd.getTime()) return;
			endSel = d;
			startSel = addDays(endSel, -SPAN);
			setInputs();
			render();
		}
	});

	btnPrev.addEventListener("click", ()=>{
		const cand = new Date(viewBase.getFullYear(), viewBase.getMonth() - 2, 1);
		if(cand < MIN_VIEW) return;
		viewBase = cand;
		render();
	});
	btnNext.addEventListener("click", ()=>{
		viewBase = new Date(viewBase.getFullYear(), viewBase.getMonth() + 2, 1);
		render();
	});

	btnApply.addEventListener("click", commit);

	btnClear.addEventListener("click", ()=>{
		startSel = null;
		endSel = null;
		setInputs();
		render();
	});

	backdrop.addEventListener("click", (e)=>{
		if(e.target === backdrop) closeModal();
	});

	function onEsc(ev){
		if(ev.key === "Escape"){
			closeModal();
			document.removeEventListener("keydown", onEsc);
		}
	}

	startBtn?.addEventListener("click", ()=>{
		document.addEventListener("keydown", onEsc);
		openWithState("start");
	});
	endBtn?.addEventListener("click", ()=>{
		document.addEventListener("keydown", onEsc);
		openWithState("end");
	});
})();