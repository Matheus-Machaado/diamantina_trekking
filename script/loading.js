let $overlay = null
let $sr = null
let visibleSince = 0
let hideTimer = null

function ensureOverlay(){
	if ($overlay) return $overlay;

	if (!document.getElementById('loadingStyles')){
		const st = document.createElement('style');
		st.id = 'loadingStyles';
		st.textContent = `
		.loading-overlay{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
			background:rgba(33,105,79,.10); /* verde claro com opacidade baixa */ 
			backdrop-filter:saturate(120%) blur(1px);
			opacity:0;pointer-events:none;transition:opacity .18s ease}
		.loading-overlay.is-visible{opacity:1;pointer-events:auto}
		.loading-inner{display:flex;align-items:center;gap:12px;padding:18px 22px;border-radius:12px;
			background:rgba(255,255,255,.65);box-shadow:0 10px 40px rgba(0,0,0,.12)}
		.loading-spinner{width:42px;height:42px;border-radius:50%;border:4px solid rgba(0,0,0,.08);
			border-top-color:var(--brand, #21694F);animation:loading-rot 1s linear infinite}
		@keyframes loading-rot{to{transform:rotate(360deg)}}
		/* trava o scroll quando loader ativo */
		html.loading-active, body.loading-active{overflow:hidden;overscroll-behavior:contain}
		/* texto apenas para leitor de tela */
		.sr-only{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;
			overflow:hidden!important;clip:rect(0,0,0,0)!important;border:0!important}
		`;
		document.head.appendChild(st);
	}

	$overlay = document.createElement('div');
	$overlay.id = 'loadingOverlay';
	$overlay.className = 'loading-overlay';
	$overlay.setAttribute('role', 'dialog');
	$overlay.setAttribute('aria-modal', 'true');
	$overlay.setAttribute('aria-hidden', 'true');

	const inner = document.createElement('div');
	inner.className = 'loading-inner';
	inner.setAttribute('role', 'status');
	inner.setAttribute('aria-live', 'polite');

	const spinner = document.createElement('div');
	spinner.className = 'loading-spinner';

	$sr = document.createElement('span');
	$sr.className = 'sr-only';
	$sr.textContent = 'Carregando...';

	inner.appendChild(spinner);
	inner.appendChild($sr);
	$overlay.appendChild(inner);
	document.body.appendChild($overlay);

	$overlay.addEventListener('click', (e)=> e.stopPropagation());
	document.addEventListener('i18n:change', ()=>{
		try{
			const mod = window.i18n || null; 
			if (mod && typeof mod.t === 'function') $sr.textContent = mod.t('loading.aria') || 'Carregando...';
		}catch(_){}
	});

	return $overlay;
}

export function show(reason=''){
	const node = ensureOverlay()
	clearTimeout(hideTimer)
	node.dataset.reason = reason
	node.removeAttribute('aria-hidden')
	document.documentElement.classList.add('loading-active')
	document.body.classList.add('loading-active')
	visibleSince = performance.now()
	requestAnimationFrame(()=> node.classList.add('is-visible'))
}

export function hide(){
	if(!$overlay) return
	const elapsed = performance.now() - (visibleSince || 0)
	const MIN_MS = 500
	const doHide = ()=>{
		$overlay.classList.remove('is-visible')
		document.documentElement.classList.remove('loading-active')
		document.body.classList.remove('loading-active')
		setTimeout(()=>{
			if($overlay) $overlay.setAttribute('aria-hidden','true')
		}, 180)
	}
	if(elapsed < MIN_MS){
		hideTimer = setTimeout(doHide, MIN_MS - elapsed)
	}else{
		doHide()
	}
}

export function bindNavigationLoading(opts={}){
	const patterns = opts.patterns || [
		/\/(?:index\.html)?$/i,
		/\/roteiros\.html$/i,
		/\/roteiro/i								
	];

	function mustShowFor(href){
		try{
			const url = new URL(href, location.href);
			if (url.origin !== location.origin) return false;
			if (url.pathname === location.pathname && url.hash) return false;
			if (url.pathname === location.pathname && !url.hash) return false;
			return patterns.some(rx => rx.test(url.pathname.toLowerCase()));
		}catch(_){
			return false;
		}
	}

	document.addEventListener('click', (e)=>{
		const a = e.target.closest?.('a[href]');
		if (!a) return;
		
		if (a.target === '_blank' || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
		const href = a.getAttribute('href');
		if (mustShowFor(href)) show('nav');
	});

	window.addEventListener('beforeunload', ()=>{
		show('unload');
	});
}