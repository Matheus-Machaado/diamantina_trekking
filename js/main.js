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
	function toggle(){
		state.open ? hide() : show();
	}
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

	toggleEl.addEventListener('click', (e)=>{
		e.stopPropagation();
		toggle();
	});
	toggleEl.addEventListener('keydown', (e)=>{
		if(e.key === 'Enter' || e.key === ' '){
			e.preventDefault();
			toggle();
		}
		if(e.key === 'ArrowDown'){
			show();
			items[0]?.focus();
		}
	});
	document.addEventListener('click', (e)=>{
		if(!listEl.contains(e.target) && !toggleEl.contains(e.target)) hide();
	});
	window.addEventListener('keydown', (e)=>{
		if(e.key === 'Escape'){
			hide();
			toggleEl.focus();
		}
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

(function(){
	const btn = document.getElementById('navToggle');
	const nav = document.getElementById('siteMenu');
	const backdrop = document.getElementById('navBackdrop');
	if(!btn || !nav || !backdrop) return;

	const header = document.querySelector('header');
	const headerInner = document.querySelector('.header-inner');
	const contatoWrap = document.querySelector('.contato-lingua');
	const contatoBtn = contatoWrap ? contatoWrap.querySelector('.btn-contato') : null;
	const langWrap = contatoWrap ? contatoWrap.querySelector('.lang-dropdown') : null;
	const slot = nav.querySelector('.nav-cta-slot');
	const topbar = nav.querySelector('.nav-topbar');
	const mql = window.matchMedia('(max-width: 980px)');
	const mqlMobile = window.matchMedia('(max-width: 560px)');

	function isMobile(){
		return mqlMobile.matches;
	}

	function syncHeaderVars(){
		const h = header ? header.offsetHeight : 0;
		document.documentElement.style.setProperty('--header-h', h ? (h + 'px') : null);
		document.documentElement.style.setProperty('--nav-topbar-h', h ? (h + 'px') : null);
	}

	syncHeaderVars();
	window.addEventListener('resize', syncHeaderVars);
	window.addEventListener('load', syncHeaderVars);

	let lastFocus = null;

	function focusables(scope){
		return [...scope.querySelectorAll(`
			a[href],
			button:not([disabled]),
			[tabindex]:not([tabindex="-1"]),
			select, textarea, input
		`)].filter(el => el.offsetParent !== null);
	}

	function moveToggleIntoNav(){
		if(topbar && btn.parentElement !== topbar){
			topbar.appendChild(btn);
			btn.classList.add('inside-nav');
		}
	}

	function moveToggleBack(){
		if(btn.parentElement !== headerInner){
			headerInner.appendChild(btn);
			btn.classList.remove('inside-nav');
		}
	}

	function moveContatoToNav(){
		if(!contatoBtn || !slot) return;
		if(!slot.contains(contatoBtn)){
			slot.appendChild(contatoBtn);
			contatoBtn.classList.add('btn-cta-nav');
		}
	}

	function moveContatoBack(){
		if(!contatoBtn || !contatoWrap) return;
		if(!contatoWrap.contains(contatoBtn)){
			contatoWrap.insertBefore(contatoBtn, contatoWrap.firstChild);
			contatoBtn.classList.remove('btn-cta-nav');
		}
	}

	function moveLangToTopbar(){
		if(!langWrap || !topbar) return;
		if(langWrap.parentElement !== topbar){
			topbar.insertBefore(langWrap, topbar.firstChild);
		}
	}

	function moveLangBack(){
		if(!langWrap || !contatoWrap) return;
		if(langWrap.parentElement !== contatoWrap){
			contatoWrap.appendChild(langWrap);
		}
	}

	function syncContactPlacement(){
		if(!contatoWrap) return;
		const w = window.innerWidth || document.documentElement.clientWidth || 0;
		if(!mql.matches){
			moveLangBack();
			moveContatoBack();
			return;
		}
		if(w <= 360){
			moveLangToTopbar();
		}else{
			moveLangBack();
		}
		if(isMobile()){
			moveContatoToNav();
		}else{
			moveContatoBack();
		}
	}

	window.addEventListener('resize', syncContactPlacement);

	function openNav(){
		lastFocus = document.activeElement;
		document.body.classList.add('nav-open');
		nav.classList.add('is-open');
		backdrop.hidden = false;
		btn.classList.add('is-open');
		btn.setAttribute('aria-expanded','true');
		btn.setAttribute('aria-label','Fechar menu de navegação');
		moveToggleIntoNav();
		syncContactPlacement();
		const first = focusables(nav)[0];
		if(first) first.focus();
		document.addEventListener('keydown', onKeydown);
	}

	function closeNav(){
		document.body.classList.remove('nav-open');
		nav.classList.remove('is-open');
		backdrop.hidden = true;
		btn.classList.remove('is-open');
		btn.setAttribute('aria-expanded','false');
		btn.setAttribute('aria-label','Abrir menu de navegação');
		moveToggleBack();
		syncContactPlacement();
		document.removeEventListener('keydown', onKeydown);
		if(lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
	}

	function onKeydown(e){
		if(e.key === 'Escape'){
			e.preventDefault();
			closeNav();
			return;
		}
		if(e.key === 'Tab'){
			const nodes = focusables(nav);
			if(!nodes.length) return;
			const first = nodes[0];
			const last = nodes[nodes.length - 1];
			if(e.shiftKey && document.activeElement === first){
				e.preventDefault();
				last.focus();
			}else if(!e.shiftKey && document.activeElement === last){
				e.preventDefault();
				first.focus();
			}
		}
	}

	btn.addEventListener('click', ()=>{
		nav.classList.contains('is-open') ? closeNav() : openNav();
	});

	backdrop.addEventListener('click', closeNav);

	nav.addEventListener('click', (e)=>{
		if(e.target.matches('a[href]')) closeNav();
	});

	mql.addEventListener?.('change', e => {
		if(!e.matches){
			closeNav();
		} else {
			moveToggleBack();
		}
		syncContactPlacement();
		syncHeaderVars();
	});

	mqlMobile.addEventListener?.('change', syncContactPlacement);

	syncContactPlacement();
})();

(function(){
	const header = document.querySelector('header');
	const hero = document.querySelector('#inicio');
	if(!header || !hero) return;

	const mqlFixed = window.matchMedia('(max-width: 984px)');
	let atHero = true;
	let lastY = window.pageYOffset || 0;
	let lastDir = null;
	let raf = null;
	let idleTimer = null;
	const IDLE_MS = 5000;
	const DELTA_MIN = 4;

	function hasNavOpen(){
		return document.body.classList.contains('nav-open');
	}
	function showHeader(){
		header.classList.remove('is-hidden');
	}
	function hideHeader(){
		if(atHero || hasNavOpen()) return;
		header.classList.add('is-hidden');
	}
	function startIdle(){
		clearIdle();
		if(atHero || hasNavOpen()) return;
		idleTimer = setTimeout(hideHeader, IDLE_MS);
	}
	function clearIdle(){
		if(idleTimer){
			clearTimeout(idleTimer);
			idleTimer = null;
		}
	}
	function setElevated(on){
		header.classList.toggle('is-elevated', !!on);
	}

	const heroObs = new IntersectionObserver((entries)=>{
		if(mqlFixed.matches){
			showHeader();
			setElevated(true);
			return;
		}
		const e = entries[0];
		atHero = e.isIntersecting && e.intersectionRatio > 0.35;
		if(atHero){
			showHeader();
			setElevated(false);
			clearIdle();
		}else{
			setElevated(true);
		}
	}, { threshold:[0,0.2,0.35,0.6,1] });
	heroObs.observe(hero);

	function onScroll(){
		if(mqlFixed.matches){
			showHeader();
			return;
		}
		const y = window.pageYOffset || 0;
		const dy = y - lastY;
		lastY = y;
		if(hasNavOpen()){
			showHeader();
			clearIdle();
			return;
		}
		if(atHero){
			showHeader();
			clearIdle();
			return;
		}
		if(Math.abs(dy) < DELTA_MIN){
			if(lastDir === 'up' && !header.classList.contains('is-hidden')) startIdle();
			return;
		}
		if(dy > 0){
			lastDir = 'down';
			clearIdle();
			hideHeader();
		}else{
			lastDir = 'up';
			showHeader();
			startIdle();
		}
	}

	window.addEventListener('scroll', ()=>{
		if(raf) return;
		raf = requestAnimationFrame(()=>{
			raf = null;
			onScroll();
		});
	}, { passive: true });

	const mo = new MutationObserver(()=>{
		if(hasNavOpen()){
			showHeader();
			clearIdle();
		}else{
			onScroll();
		}
	});
	mo.observe(document.body, { attributes:true, attributeFilter:['class'] });

	mqlFixed.addEventListener?.('change', ()=>{
		showHeader();
		onScroll();
	});

	showHeader();
	setElevated(true);
})();

(function(){
	function applyIntensityBadges(scope){
		const root = scope || document;
		const cards = [...root.querySelectorAll('.roteiro-card')];
		const levels = ['leve','moderado','intenso'];
		cards.forEach((card)=>{
			let level = card.dataset.intensidade;
			if(!level) level = levels[Math.floor(Math.random()*levels.length)];
			card.dataset.intensidade = level;
			const wrap = card.querySelector('.roteiro-card-img');
			if(!wrap) return;
			let b = wrap.querySelector('.intensity-badge');
			if(!b){
				b = document.createElement('span');
				b.className = 'intensity-badge';
				const ic = document.createElement('img');
				ic.src = '../img/icons/intensidade-icon.png';
				ic.alt = '';
				ic.setAttribute('aria-hidden','true');
				const t = document.createElement('span');
				t.className = 'intensity-text';
				b.appendChild(ic);
				b.appendChild(t);
				wrap.appendChild(b);
			}
			b.classList.remove('intensity-leve','intensity-moderado','intensity-intenso');
			b.classList.add('intensity-'+level);
			const t = b.querySelector('.intensity-text');
			if(t) t.textContent = level.toUpperCase();
			b.setAttribute('aria-label','Intensidade '+level);
		});
	}
	window.applyIntensityBadges = applyIntensityBadges;
	applyIntensityBadges(document);
})();

(function(){
	const section = document.getElementById('guia');
	if(!section) return;

	const nums = Array.from(section.querySelectorAll('.guia-stats .num'));
	if(!nums.length) return;

	nums.forEach(el=>{
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
		el.textContent = prefix + (0).toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
	});

	const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	function animateCount(el, duration=2000){
		const prefix = el.dataset.prefix || '';
		const suffix = el.dataset.suffix || '';
		const decimals = parseInt(el.dataset.decimals || '0', 10);
		const target = parseFloat(el.dataset.target || '0');
		if(prefersReduce){
			el.textContent = prefix + target.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
			return;
		}
		let startTs;
		function easeOutCubic(t){
			return 1 - Math.pow(1 - t, 3);
		}
		function step(ts){
			if(!startTs) startTs = ts;
			const p = Math.min((ts - startTs) / duration, 1);
			const val = target * easeOutCubic(p);
			el.textContent = prefix + val.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
			if(p < 1) requestAnimationFrame(step);
		}
		requestAnimationFrame(step);
	}

	let ran = false;

	const io = new IntersectionObserver((entries)=>{
		const e = entries[0];
		if(!ran && e.isIntersecting){
			ran = true;
			nums.forEach(el=>animateCount(el));
			io.disconnect();
		}
	}, { root: null, threshold: 0.4 });

	io.observe(section);
})();

(function(){
	const section = document.getElementById('depoimentos');
	if (!section) return;

	let viewport, track, dotsBox;
	let index = 0;
	let pages = 1;
	let dots = [];
	let bound = false;

	function perView(){
		return parseInt(getComputedStyle(viewport).getPropertyValue('--pv')) || 3;
	}
	function gapPx(){
		return parseFloat(getComputedStyle(track).gap) || 0;
	}
	function getCards(){
		return track ? Array.from(track.children) : [];
	}
	function buildDots(){
		if (!dotsBox) return;
		dotsBox.innerHTML = '';
		dots = [];
		for (let i = 0; i < pages; i++){
			const d = document.createElement('span');
			d.className = 'depo-dot' + (i === index ? ' is-active' : '');
			dotsBox.appendChild(d);
			dots.push(d);
		}
	}
	function updateDots(){
		dots.forEach((d,i)=>d.classList.toggle('is-active', i === index));
	}
	function goTo(i){
		const cards = getCards();
		if (!cards.length) return;
		index = ((i % pages) + pages) % pages;
		const cardW = cards[0].getBoundingClientRect().width || 0;
		const step = cardW + gapPx();
		track.style.transform = `translateX(${-step * index}px)`;
		updateDots();
	}
	function recalc(){
		const cards = getCards();
		const pv = perView();
		pages = Math.max(1, cards.length - pv + 1);
		index = Math.min(index, pages - 1);
		buildDots();
		goTo(index);
	}
	function bindDelegated(){
		if (bound) return;
		bound = true;

		section.addEventListener('click', (e)=>{
			const left = e.target.closest('.depo-nav.left');
			const right = e.target.closest('.depo-nav.right');
			const dot = e.target.closest('.depo-dot');
			if (left){ goTo(index - 1); return; }
			if (right){ goTo(index + 1); return; }
			if (dot){
				const i = dots.indexOf(dot);
				if (i !== -1) goTo(i);
			}
		});

		window.addEventListener('resize', recalc, { passive:true });
		document.addEventListener('page:rehydrated', (ev)=>{
			if (ev.detail?.page === 'home') setup();
		});
		document.addEventListener('i18n:change', ()=> setTimeout(recalc, 0));
	}
	function observeTrack(){
		if (!track) return;
		const mo = new MutationObserver(()=> recalc());
		mo.observe(track, { childList:true });
	}
	function setup(){
		viewport = section.querySelector('.depo-viewport');
		track = section.querySelector('.depo-track');
		dotsBox = section.querySelector('.depo-dots');
		if (!viewport || !track || !dotsBox) return;
		bindDelegated();
		observeTrack();
		recalc();
	}
	setup();
})();

(function(){
	const section = document.getElementById('roteiro-destaque');
	if(!section) return;

	const media = section.querySelector('.rd-media');
	const copy = section.querySelector('.rd-copy');
	const viewport = section.querySelector('.rd-viewport');
	const track = section.querySelector('.rd-track');
	if(!media || !copy || !viewport || !track) return;

	const slides = Array.from(track.children);
	if(!slides.length) return;

	const dotsBox = section.querySelector('.rd-dots');
	const sharebar = section.querySelector('.rd-sharebar');
	const mqlStack = window.matchMedia('(max-width: 984px)');

	function m(el){
		if(!el) return 0;
		const cs = getComputedStyle(el);
		return (parseFloat(cs.marginTop)||0) + (parseFloat(cs.marginBottom)||0);
	}
	function extras(){
		const d = dotsBox ? dotsBox.offsetHeight + m(dotsBox) : 0;
		const s = sharebar ? sharebar.offsetHeight + m(sharebar) : 0;
		return d + s;
	}

	let raf = null;

	function syncHeights(){
		if(raf){
			cancelAnimationFrame(raf);
			raf = null;
		}
		raf = requestAnimationFrame(()=>{
			if(mqlStack.matches){
				media.style.height = '';
				viewport.style.height = '';
				return;
			}

			viewport.style.height = '';
			media.style.height = '';

			const imgH = Math.ceil(viewport.getBoundingClientRect().height);
			const copyH = Math.ceil(copy.scrollHeight);
			const extraH = extras();

			if(imgH && (copyH > imgH + extraH)){
				const vpH = copyH - extraH;
				viewport.style.height = vpH + 'px';
				media.style.height = copyH + 'px';
			}else{
				viewport.style.height = '';
				media.style.height = '';
			}
		});
	}

	let index = 0;
	let dots = [];

	function stepWidth(){
		return viewport.getBoundingClientRect().width;
	}
	function buildDots(){
		if(!dotsBox) return;
		dotsBox.innerHTML = '';
		dots = slides.map((_,i)=>{
			const d = document.createElement('span');
			d.className = 'depo-dot' + (i===index ? ' is-active' : '');
			d.addEventListener('click', ()=>{
				holdAutoplay();
				goTo(i);
				restartAuto();
			});
			dotsBox.appendChild(d);
			return d;
		});
		syncHeights();
	}
	function updateDots(){
		dots.forEach((d,i)=>d.classList.toggle('is-active', i===index));
	}
	function goTo(i){
		if(!slides.length) return;
		index = ((i % slides.length) + slides.length) % slides.length;
		const x = stepWidth() * index;
		track.style.transform = `translateX(${-x}px)`;
		updateDots();
	}

	const recalc = ()=>{
		syncHeights();
		goTo(index);
	};

	window.addEventListener('resize', recalc);
	mqlStack.addEventListener?.('change', recalc);

	if(typeof ResizeObserver === 'function'){
		const ro = new ResizeObserver(syncHeights);
		if(copy) ro.observe(copy);
		if(dotsBox) ro.observe(dotsBox);
		if(sharebar) ro.observe(sharebar);
	}

	const imgs = section.querySelectorAll('.rd-slide img');
	let loaded = 0;

	if(imgs.length){
		imgs.forEach(img=>{
			if(img.complete){
				if(++loaded===imgs.length) syncHeights();
			}else{
				img.addEventListener('load', ()=>{
					if(++loaded===imgs.length) syncHeights();
				});
			}
		});
	}else{
		syncHeights();
	}

	const AUTO_MS = 5000;
	let timer = null;
	let holdUntil = 0;
	let interacting = false;

	function holdAutoplay(ms = AUTO_MS){
		holdUntil = Date.now() + ms;
	}

	function stopAuto(){
		if(timer){
			clearTimeout(timer);
			timer = null;
		}
	}

	function nextDelay(){
		const now = Date.now();
		return holdUntil > now ? (holdUntil - now) : AUTO_MS;
	}

	function tick(){
		if(interacting) holdAutoplay();
		const now = Date.now();

		if(now < holdUntil){
			stopAuto();
			timer = setTimeout(tick, holdUntil - now);
			return;
		}

		goTo(index + 1);

		stopAuto();
		timer = setTimeout(tick, AUTO_MS);
	}

	function startAuto(){
		stopAuto();
		if(slides.length > 1){
			timer = setTimeout(tick, nextDelay());
		}
	}

	function restartAuto(){
		startAuto();
	}

	viewport.addEventListener('touchstart', (e)=>{
		interacting = true;
		holdAutoplay();
	}, { passive:true });

	viewport.addEventListener('touchmove', (e)=>{
		interacting = true;
		holdAutoplay();
	}, { passive:true });

	viewport.addEventListener('touchend', (e)=>{
		interacting = false;
	}, { passive:true });

	viewport.addEventListener('touchcancel', (e)=>{
		interacting = false;
	}, { passive:true });

	viewport.addEventListener('mouseenter', stopAuto);
	viewport.addEventListener('mouseleave', startAuto);
	if(dotsBox){
		dotsBox.addEventListener('mouseenter', stopAuto);
		dotsBox.addEventListener('mouseleave', startAuto);
	}
	section.addEventListener('focusin', stopAuto);
	section.addEventListener('focusout', startAuto);
	document.addEventListener('visibilitychange', ()=>{
		document.hidden ? stopAuto() : startAuto();
	});

	buildDots();
	goTo(0);
	startAuto();
	syncHeights();
})();

(function(){
	let list = null;

	function open(item){
		const btn = item.querySelector('.faq-q');
		const icon = btn?.querySelector('i');
		const ans = item.querySelector('.faq-a');
		if(!btn || !ans) return;

		ans.style.height = 'auto';
		const h = ans.scrollHeight;
		ans.style.height = '0px';
		void ans.offsetHeight;
		ans.style.height = h + 'px';

		item.classList.add('is-open');
		btn.setAttribute('aria-expanded','true');
		if(icon){
			icon.classList.remove('bx-plus');
			icon.classList.add('bx-minus');
		}
		ans.addEventListener('transitionend', function onEnd(){
			if(item.classList.contains('is-open')) ans.style.height = 'auto';
			ans.removeEventListener('transitionend', onEnd);
		});
	}

	function close(item){
		const btn = item.querySelector('.faq-q');
		const icon = btn?.querySelector('i');
		const ans = item.querySelector('.faq-a');
		if(!btn || !ans) return;

		const h = ans.scrollHeight;
		ans.style.height = h + 'px';
		void ans.offsetHeight;
		ans.style.height = '0px';

		item.classList.remove('is-open');
		btn.setAttribute('aria-expanded','false');
		if(icon){
			icon.classList.remove('bx-minus');
			icon.classList.add('bx-plus');
		}
	}

	function toggle(item){
		item.classList.contains('is-open') ? close(item) : open(item);
	}

	function onClick(e){
		const btn = e.target.closest?.('.faq-q');
		if(!btn || !list || !list.contains(btn)) return;
		e.preventDefault();
		const item = btn.closest('.faq-item');
		if(item) toggle(item);
	}

	function onKeydown(e){
		const btn = e.target.closest?.('.faq-q');
		if(!btn || !list || !list.contains(btn)) return;
		if(e.key === 'Enter' || e.key === ' '){
			e.preventDefault();
			const item = btn.closest('.faq-item');
			if(item) toggle(item);
		}
	}

	function bind(){
		const section = document.getElementById('perguntas');
		if(!section) return;
		list = section.querySelector('.faq-list');
		if(!list) return;

		list.addEventListener('click', onClick);
		list.addEventListener('keydown', onKeydown);

		list.querySelectorAll('.faq-item.is-open').forEach(item=>{
			const btn = item.querySelector('.faq-q');
			const icon = btn?.querySelector('i');
			const ans = item.querySelector('.faq-a');
			btn?.setAttribute('aria-expanded','true');
			icon?.classList.remove('bx-plus');
			icon?.classList.add('bx-minus');
			if(ans) ans.style.height = 'auto';
		});

		document.addEventListener('i18n:change', ()=>{
			list.querySelectorAll('.faq-item.is-open .faq-a').forEach(ans=>{
				ans.style.height = 'auto';
			});
		});
	}

	bind();
	document.addEventListener('page:rehydrated', (ev)=>{
		if(!ev?.detail || ev.detail.page !== 'home') return;
		const section = document.getElementById('perguntas');
		const newList = section?.querySelector('.faq-list') || null;

		if(list !== newList){
			try { list && list.removeEventListener('click', onClick); } catch(_) {}
			try { list && list.removeEventListener('keydown', onKeydown); } catch(_) {}
			list = null;
			bind();
		}
	});
})();

(function(){
	const floatAnchor = document.querySelector('.zap-float');
	const DEFAULT_ZAP = 'https://wa.me/5511910254958?text=' + encodeURIComponent('Olá Diamantina Trekking! Quero um atendimento online.');
	const ZAP_URL = (floatAnchor && floatAnchor.getAttribute('href')) || DEFAULT_ZAP;

	if(floatAnchor){
		floatAnchor.setAttribute('href', ZAP_URL);
		floatAnchor.setAttribute('target', '_blank');
		floatAnchor.setAttribute('rel', 'noopener');
	}

	document.querySelectorAll('[data-zap="link"]').forEach((el)=>{
		if(el.tagName.toLowerCase() === 'a'){
			el.setAttribute('href', ZAP_URL);
			el.setAttribute('target', '_blank');
			el.setAttribute('rel', 'noopener');
		}else{
			const openZap = ()=>window.open(ZAP_URL, '_blank', 'noopener');
			el.addEventListener('click', openZap);
			el.setAttribute('role', 'link');
			el.setAttribute('tabindex', '0');
			el.addEventListener('keydown', (e)=>{
				if(e.key === 'Enter' || e.key === ' '){
					e.preventDefault();
					openZap();
				}
			});
		}
	});
})();

(function(){
	function observeAll(io, scope){
		(scope || document).querySelectorAll('[data-reveal], [data-reveal-stagger]').forEach((el)=>io.observe(el));
	}
	const io = new IntersectionObserver((entries, obs)=>{
		entries.forEach((entry)=>{
			if(!entry.isIntersecting) return;
			const el = entry.target;
			const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
			if(delay) el.style.transitionDelay = `${delay}ms`;
			if(el.hasAttribute('data-reveal-stagger')){
				[...el.children].forEach((child, i)=>{
					child.style.setProperty('--stagger-index', i);
				});
			}
			el.classList.add('is-revealed');
			obs.unobserve(el);
		});
	}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

	observeAll(io, document);
	document.addEventListener('page:rehydrated', ()=>observeAll(io, document));
})();

(function(){
	function abs(href){
		try{ return new URL(href, location.href).href; }catch(_){ return location.href; }
	}
	function pickTitle(scope){
		const t = scope.querySelector('.rp-title, .rd-title');
		if(t && t.textContent.trim()) return t.textContent.trim();
		return document.title.replace(/\s*\|.*$/,'').trim();
	}
	function pickLink(scope){
		if(scope.closest?.('.rp') || scope.matches?.('.rp')){
			return abs(location.href);
		}
		const cta = scope.querySelector?.('.rd-cta');
		if(cta) return abs(cta.getAttribute('href') || cta.href);
		return abs(location.href);
	}
	function waText(title, link){
		return `Bora criar uma lembrança massa? *${title}* parece perfeito pra gente.\n${link}`;
	}
	function ensureToast(){
		let toast = document.getElementById('shareToast');
		if(!toast){
			toast = document.createElement('div');
			toast.id = 'shareToast';
			toast.className = 'share-toast';
			toast.setAttribute('role','status');
			toast.setAttribute('aria-live','polite');
			document.body.appendChild(toast);
			if(!document.getElementById('shareToastStyles')){
				const st = document.createElement('style');
				st.id = 'shareToastStyles';
				st.textContent = `
				.share-toast{position:fixed;left:50%;top:-64px;transform:translate(-50%,-10px);background:var(--brand);color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.18);opacity:0;z-index:9999;transition:transform .28s ease,opacity .28s ease,top .28s ease;font-weight:700}
				.share-toast.is-visible{top:14px;opacity:1;transform:translate(-50%,0)}
				`;
				document.head.appendChild(st);
			}
		}
		return toast;
	}
	function showToast(text){
		const toast = ensureToast();
		toast.textContent = text;
		requestAnimationFrame(()=>toast.classList.add('is-visible'));
		clearTimeout(toast._timer);
		toast._timer = setTimeout(()=>{ toast.classList.remove('is-visible'); }, 8000);
	}
	async function copyToClipboard(text){
		try{
			if(navigator.clipboard && navigator.clipboard.writeText){
				await navigator.clipboard.writeText(text);
			}else{
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}
			showToast('Link copiado');
		}catch(_){
			showToast('Não foi possível copiar');
		}
	}
	function setupSharebar(bar){
		if(!bar || bar._shareReady) return;
		bar._shareReady = true;

		const scope = bar.closest('#roteiro-destaque, .rp, body') || document;
		const btns = bar.querySelectorAll('.rd-share-btn');
		const whats = btns[0];
		const copy = btns[1];

		const getTitle = ()=> bar.dataset.shareTitle || pickTitle(scope);
		const getLink  = ()=> bar.dataset.shareUrl  || pickLink(scope);

		if(whats){
			whats.addEventListener('click', (e)=>{
				e.preventDefault();
				const msg = waText(getTitle(), getLink());
				const url = 'https://wa.me/?text=' + encodeURIComponent(msg);
				window.open(url, '_blank', 'noopener');
			});
		}
		if(copy){
			copy.addEventListener('click', (e)=>{
				e.preventDefault();
				copyToClipboard(getLink());
			});
		}
	}

	document.querySelectorAll('.rd-sharebar').forEach(setupSharebar);

	const rd = document.getElementById('roteiro-destaque');
	if(rd){
		const mo = new MutationObserver(()=>rd.querySelectorAll('.rd-sharebar').forEach(setupSharebar));
		mo.observe(rd, { subtree:true, childList:true });
	}
})();

(function(){
	function addDragSupport(opts){
		const viewport  = opts.viewport;
		const onDelta   = opts.onDelta;
		const onRelease = opts.onRelease;
		const onlyMobile = !!opts.onlyMobile;
		const mqlMobile = window.matchMedia('(max-width: 560px)');
		if(!viewport || typeof onDelta !== 'function') return;

		let isDown = false;
		let startX = 0;
		let lastX  = 0;
		let moved  = false;

		function clientX(e){
			if(e.touches && e.touches.length) return e.touches[0].clientX;
			if(e.changedTouches && e.changedTouches.length) return e.changedTouches[0].clientX;
			return e.clientX;
		}

		function canStart(e){
			if(!onlyMobile) return true;
			const isTouch = e.type === 'touchstart';
			return isTouch && mqlMobile.matches;
		}

		function down(e){
			if(e.type === 'mousedown' && e.button !== 0) return;
			if(!canStart(e)) return;
			isDown = true;
			moved  = false;
			startX = clientX(e);
			lastX  = startX;
			viewport.classList.add('is-dragging');
		}

		function move(e){
			if(!isDown) return;
			const x  = clientX(e);
			const dx = x - lastX;
			if(Math.abs(x - startX) > 4) moved = true;
			lastX = x;
			onDelta(dx);
		}

		function up(e){
			if(!isDown) return;
			isDown = false;
			viewport.classList.remove('is-dragging');
			const totalDx = lastX - startX;
			if(typeof onRelease === 'function'){
				onRelease(totalDx, moved);
			}
		}

		viewport.addEventListener('mousedown', down);
		window.addEventListener('mousemove', move);
		window.addEventListener('mouseup',   up);

		viewport.addEventListener('touchstart', function(e){
			down(e);
		}, { passive:true });

		viewport.addEventListener('touchmove', function(e){
			move(e);
		}, { passive:true });

		viewport.addEventListener('touchend', function(e){
			up(e);
		}, { passive:true });

		viewport.addEventListener('touchcancel', function(e){
			up(e);
		}, { passive:true });

		mqlMobile.addEventListener?.('change', () => {
			if(!onlyMobile) return;
			if(!mqlMobile.matches){
				isDown = false;
				viewport.classList.remove('is-dragging');
			}
		});
	}

	(function(){
		const section = document.getElementById('depoimentos');
		if(!section) return;
		const viewport = section.querySelector('.depo-viewport');
		const track    = section.querySelector('.depo-track');
		if(!viewport || !track) return;

		let index = 0;

		function perView(){
			return parseInt(getComputedStyle(viewport).getPropertyValue('--pv')) || 3;
		}
		function gapPx(){
			return parseFloat(getComputedStyle(track).gap) || 0;
		}
		function cards(){
			return Array.from(track.children);
		}
		function pages(){
			const c  = cards().length;
			const pv = perView();
			return Math.max(1, c - pv + 1);
		}
		function step(){
			const c = cards();
			if(!c.length) return 0;
			const w = c[0].getBoundingClientRect().width || 0;
			return w + gapPx();
		}
		function goTo(i){
			const total = pages();
			if(!total) return;
			index = ((i % total) + total) % total;
			const x = step() * index;
			track.style.transform = `translateX(${-x}px)`;
			const dotsBox = section.querySelector('.depo-dots');
			if(dotsBox){
				const dots = Array.from(dotsBox.children);
				dots.forEach((d,idx)=>d.classList.toggle('is-active', idx === index));
			}
		}

		addDragSupport({
			viewport,
			onDelta(dx){
				const style  = getComputedStyle(track);
				const matrix = new WebKitCSSMatrix(style.transform);
				const currentX = matrix.m41;
				track.style.transition = 'none';
				track.style.transform  = `translateX(${currentX + dx}px)`;
			},
			onRelease(totalDx, moved){
				track.style.transition = '';
				if(!moved || Math.abs(totalDx) < 40){
					goTo(index);
					return;
				}
				if(totalDx < 0){
					goTo(index + 1);
				}else{
					goTo(index - 1);
				}
			}
		});

		window.addEventListener('resize', function(){
			goTo(index);
		});
	})();

	(function(){
		const section = document.getElementById('roteiro-destaque');
		if(!section) return;
		const viewport = section.querySelector('.rd-viewport');
		const track    = section.querySelector('.rd-track');
		if(!viewport || !track) return;

		const slides = Array.from(track.children);
		if(!slides.length) return;

		let index = 0;

		function total(){
			return slides.length;
		}
		function stepWidth(){
			return viewport.getBoundingClientRect().width || 0;
		}
		function goTo(i){
			const n = total();
			if(!n) return;
			index = ((i % n) + n) % n;
			const x = stepWidth() * index;
			track.style.transform = `translateX(${-x}px)`;
			const dotsBox = section.querySelector('.rd-dots');
			if(dotsBox){
				const dots = Array.from(dotsBox.children);
				dots.forEach((d,idx)=>d.classList.toggle('is-active', idx === index));
			}
		}

		addDragSupport({
			viewport,
			onlyMobile: true,
			onDelta(dx){
				const style  = getComputedStyle(track);
				const matrix = new WebKitCSSMatrix(style.transform);
				const currentX = matrix.m41;
				track.style.transition = 'none';
				track.style.transform  = `translateX(${currentX + dx}px)`;
			},
			onRelease(totalDx, moved){
				track.style.transition = '';
				if(!moved || Math.abs(totalDx) < 40){
					goTo(index);
					return;
				}
				if(totalDx < 0){
					goTo(index + 1);
				}else{
					goTo(index - 1);
				}
			}
		});

		window.addEventListener('resize', function(){
			goTo(index);
		});
	})();
})();