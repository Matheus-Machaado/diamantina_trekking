const langMenu = (() => {
	const toggleEl = document.getElementById('langTrigger');
	const listEl = document.getElementById('langMenu');
	const items = listEl.querySelectorAll('a');
	const state = { open: false };

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
				el.style.transition = 'transform 0s';
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
		const row = card.querySelector('.roteiro-card-line');
		const btn = card.querySelector('.roteiro-toggle');
		const icon = btn ? btn.querySelector('i') : null;
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
				if (icon) { icon.classList.remove('bx-plus'); icon.classList.add('bx-minus'); }
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
				if (icon) { icon.classList.remove('bx-minus'); icon.classList.add('bx-plus'); }
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

(function(){
	const section = document.getElementById('depoimentos');
	if(!section) return;

	const viewport = section.querySelector('.depo-viewport');
	const track = section.querySelector('.depo-track');
	const cards = Array.from(track.children);
	const prevBtn = section.querySelector('.depo-nav.left');
	const nextBtn = section.querySelector('.depo-nav.right');
	const dotsBox = section.querySelector('.depo-dots');

	function perView(){
		return parseInt(getComputedStyle(viewport).getPropertyValue('--pv')) || 3;
	}
	function gapPx(){
		return parseFloat(getComputedStyle(track).gap) || 0;
	}

	let index = 0;
	let pages = Math.max(1, cards.length - perView() + 1);
	let dots = [];

	function buildDots(){
		dotsBox.innerHTML = '';
		dots = [];
		for(let i=0;i<pages;i++){
			const d = document.createElement('span');
			d.className = 'depo-dot' + (i===index ? ' is-active' : '');
			d.dataset.index = i;
			d.addEventListener('click', ()=>goTo(i));
			dotsBox.appendChild(d);
			dots.push(d);
		}
	}

	function updateDots(){
		dots.forEach((d,i)=> d.classList.toggle('is-active', i===index));
	}

	function goTo(i){
		if(pages <= 1){
			index = 0;
		}else{
			index = ((i % pages) + pages) % pages;
		}
		const cardW = cards[0].getBoundingClientRect().width;
		const step = cardW + gapPx();
		const x = step * index;
		track.style.transform = `translateX(${-x}px)`;
		updateDots();
	}

	function recalc(){
		const oldPages = pages;
		pages = Math.max(1, cards.length - perView() + 1);
		index = ((index % pages) + pages) % pages;
		if(pages !== oldPages) buildDots();
		goTo(index);
	}

	prevBtn.addEventListener('click', ()=> goTo(index - 1));
	nextBtn.addEventListener('click', ()=> goTo(index + 1));
	window.addEventListener('resize', recalc);

	buildDots();
	goTo(0);
})();

(function(){
	const section  = document.getElementById('roteiro-destaque');
	if(!section) return;

	const media    = section.querySelector('.rd-media');
	const copy     = section.querySelector('.rd-copy');
	const viewport = section.querySelector('.rd-viewport');
	const track    = section.querySelector('.rd-track');
	const slides   = Array.from(track.children);
	const dotsBox  = section.querySelector('.rd-dots');
	const sharebar = section.querySelector('.rd-sharebar');
	const mqlStack = window.matchMedia('(max-width: 980px)');

	function m(el){ const cs=getComputedStyle(el); return (parseFloat(cs.marginTop)||0)+(parseFloat(cs.marginBottom)||0); }
	function extras(){ return dotsBox.offsetHeight+m(dotsBox)+sharebar.offsetHeight+m(sharebar); }

	let raf = null;
	function syncHeights(){
		if(raf){ cancelAnimationFrame(raf); raf=null; }
		raf = requestAnimationFrame(()=>{
			if(mqlStack.matches){
				media.style.height='';
				viewport.style.height='';
				return;
			}
			media.style.height='auto';
			viewport.style.height='auto';

			const copyH = Math.ceil(copy.scrollHeight);
			const vpH   = Math.max(0, copyH - extras());

			viewport.style.height = vpH + 'px';
			media.style.height    = copyH + 'px';
		});
	}

	let index = 0;
	let dots  = [];

	function stepWidth(){ return viewport.getBoundingClientRect().width; }

	function buildDots(){
		dotsBox.innerHTML = '';
		dots = slides.map((_,i)=>{
			const d=document.createElement('span');
			d.className='depo-dot' + (i===index?' is-active':'');
			d.addEventListener('click',()=>{ goTo(i); restartAuto(); });
			dotsBox.appendChild(d);
			return d;
		});
		syncHeights();
	}

	function updateDots(){ dots.forEach((d,i)=>d.classList.toggle('is-active', i===index)); }

	function goTo(i){
		index = ((i % slides.length) + slides.length) % slides.length;
		const x = stepWidth() * index;
		track.style.transform = `translateX(${-x}px)`;
		updateDots();
	}

	const recalc = ()=>{ syncHeights(); goTo(index); };
	window.addEventListener('resize', recalc);
	mqlStack.addEventListener?.('change', recalc);

	const ro = new ResizeObserver(syncHeights);
	ro.observe(copy);
	ro.observe(dotsBox);
	ro.observe(sharebar);

	const imgs = section.querySelectorAll('.rd-slide img');
	let loaded = 0;
	imgs.forEach(img=>{
		if(img.complete){ if(++loaded===imgs.length) syncHeights(); }
		else { img.addEventListener('load', ()=>{ if(++loaded===imgs.length) syncHeights(); }); }
	});

	const AUTO_MS = 5000;
	let timer=null;
	function startAuto(){ stopAuto(); timer=setInterval(()=>goTo(index+1), AUTO_MS); }
	function stopAuto(){ if(timer){ clearInterval(timer); timer=null; } }
	function restartAuto(){ stopAuto(); startAuto(); }

	viewport.addEventListener('mouseenter', stopAuto);
	viewport.addEventListener('mouseleave', startAuto);
	dotsBox.addEventListener('mouseenter', stopAuto);
	dotsBox.addEventListener('mouseleave', startAuto);
	section.addEventListener('focusin', stopAuto);
	section.addEventListener('focusout', startAuto);
	document.addEventListener('visibilitychange', ()=>{ document.hidden?stopAuto():startAuto(); });

	buildDots();
	goTo(0);
	startAuto();
	syncHeights();
})();

(function(){
	const section = document.getElementById('perguntas');
	if(!section) return;

	section.querySelectorAll('.faq-item').forEach(item=>{
		const btn = item.querySelector('.faq-q');
		const icon = btn.querySelector('i');
		const ans = item.querySelector('.faq-a');

		function open(){
			ans.style.height='auto';
			const h = ans.scrollHeight;
			ans.style.height='0px';
			void ans.offsetHeight;
			ans.style.height=h+'px';
			item.classList.add('is-open');
			btn.setAttribute('aria-expanded','true');
			icon.classList.remove('bx-plus');
			icon.classList.add('bx-minus');
			ans.addEventListener('transitionend', function onEnd(){
				if(item.classList.contains('is-open')) ans.style.height='auto';
				ans.removeEventListener('transitionend', onEnd);
			});
		}
		function close(){
			const h = ans.scrollHeight;
			ans.style.height=h+'px';
			void ans.offsetHeight;
			ans.style.height='0px';
			item.classList.remove('is-open');
			btn.setAttribute('aria-expanded','false');
			icon.classList.remove('bx-minus');
			icon.classList.add('bx-plus');
		}
		function toggle(){ item.classList.contains('is-open') ? close() : open(); }

		btn.addEventListener('click', toggle);
		btn.addEventListener('keydown', e=>{
			if(e.key==='Enter' || e.key===' '){ e.preventDefault(); toggle(); }
		});

		if(item.classList.contains('is-open')){
			btn.setAttribute('aria-expanded','true');
			icon.classList.remove('bx-plus'); icon.classList.add('bx-minus');
			ans.style.height='auto';
		}
	});
})();

(function () {
	const floatAnchor = document.querySelector('.zap-float');
	const DEFAULT_ZAP =
		'https://wa.me/557598440434?text=' +
		encodeURIComponent('Olá Diamantina Trekking! Quero um atendimento online.');

	const ZAP_URL = (floatAnchor && floatAnchor.getAttribute('href')) || DEFAULT_ZAP;

	if (floatAnchor) {
		floatAnchor.setAttribute('href', ZAP_URL);
		floatAnchor.setAttribute('target', '_blank');
		floatAnchor.setAttribute('rel', 'noopener');
	}

	document.querySelectorAll('[data-zap="link"]').forEach((el) => {
		if (el.tagName.toLowerCase() === 'a') {
			el.setAttribute('href', ZAP_URL);
			el.setAttribute('target', '_blank');
			el.setAttribute('rel', 'noopener');
		} else {
			const openZap = () => window.open(ZAP_URL, '_blank', 'noopener');
			el.addEventListener('click', openZap);
			el.setAttribute('role', 'link');
			el.setAttribute('tabindex', '0');
			el.addEventListener('keydown', (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					openZap();
				}
			});
		}
	});
})();

(function(){
	const io = new IntersectionObserver((entries, obs) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;

			const el = entry.target;
			const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
			if (delay) el.style.transitionDelay = `${delay}ms`;

			if (el.hasAttribute('data-reveal-stagger')) {
				[...el.children].forEach((child, i) => {
					child.style.setProperty('--stagger-index', i);
				});
			}

			el.classList.add('is-revealed');
			obs.unobserve(el); 
		});
	}, {
		threshold: 0.18,
		rootMargin: '0px 0px -8% 0px'
	});

	document.querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el) => io.observe(el));
})();
