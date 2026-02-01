import * as i18n from './i18n.js';
import * as loading from './loading.js';
import './seo.js';

const root = new URL('.', import.meta.url);

function resolveLang() {
	const urlLang = new URL(location.href).searchParams.get('lang')
	const lsLang = localStorage.getItem('lang') || localStorage.getItem('dt.lang')
	const htmlLang = document.documentElement.getAttribute('lang')
	const lang = (urlLang || lsLang || htmlLang || 'pt').toLowerCase()
	const norm = lang.startsWith('en') ? 'en' : (lang.startsWith('fr') ? 'fr' : 'pt')
	document.documentElement.setAttribute('lang', norm)
	localStorage.setItem('lang', norm)
	localStorage.setItem('dt.lang', norm)
	return norm
}

function detectPage() {
	const explicit = document.body.getAttribute('data-page');
	if (explicit) return explicit;
	if (document.getElementById('rpGrid')) return 'detail';
	if (document.getElementById('rlistGrid')) return 'list';
	return 'home';
}

async function importRoot(path) {
	return import(new URL(path, root).href);
}

async function applyI18n(lang) {
	if (typeof i18n?.setLang === 'function') {
		await i18n.setLang(lang)
	} else if (typeof i18n?.init === 'function') {
		await i18n.init()
	}
	if (typeof i18n?.apply === 'function') i18n.apply(document)
}

async function rebindSharebars() {
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
	async function copy(link){
		try{
			if(navigator.clipboard?.writeText){
				await navigator.clipboard.writeText(link);
			}else{
				const ta = document.createElement('textarea');
				ta.value = link;
				ta.style.position = 'fixed';
				ta.style.opacity = '0';
				document.body.appendChild(ta);
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}
			showToast(i18n.t('share.copied'));
		}catch(_){
			showToast(i18n.t('share.copyFail'));
		}
	}
	function abs(href){
		try{ return new URL(href, location.href).href }catch(_){ return location.href }
	}
	function pickTitle(scope){
		const t = scope.querySelector('.rp-title, .rd-title');
		if(t && t.textContent.trim()) return t.textContent.trim();
		return document.title.replace(/\s*\|.*$/,'').trim();
	}
	function pickLink(scope){
		if(scope.closest?.('.rp') || scope.matches?.('.rp')) return abs(location.href);
		const cta = scope.querySelector?.('.rd-cta');
		if(cta) return abs(cta.getAttribute('href') || cta.href);
		return abs(location.href);
	}
	function waMsg(title, link){
		return i18n.t('share.whatsMsg', { title, link });
	}
	document.querySelectorAll('.rd-sharebar, .rd-sharebar.rd-sharebar').forEach(bar=>{
		const scope = bar.closest('#roteiro-destaque, .rp, body') || document;
		const btns = bar.querySelectorAll('.rd-share .rd-share-btn');
		const whats = btns[0];
		const copyBtn = btns[1];

		if(whats){
			const clone = whats.cloneNode(true);
			whats.parentNode.replaceChild(clone, whats);
			clone.addEventListener('click', e=>{
				e.preventDefault();
				const title = pickTitle(scope);
				const link = pickLink(scope);
				const url = 'https://wa.me/?text=' + encodeURIComponent(waMsg(title, link));
				window.open(url, '_blank', 'noopener');
			});
		}
		if(copyBtn){
			const clone = copyBtn.cloneNode(true);
			copyBtn.parentNode.replaceChild(clone, copyBtn);
			clone.addEventListener('click', e=>{
				e.preventDefault();
				copy(pickLink(scope));
			});
		}
	});
}

function applyStaticBindings(){
	const t = (k,p)=>i18n.t(k,p)

	function setHeroHeading(){
		const heroH1 = document.querySelector('#inicio h1')
		if(!heroH1) return
		const main = t('home.h1.main')
		const sub = t('home.h1.sub')
		const mq = window.matchMedia('(max-width: 560px)')
		if(mq.matches){
			heroH1.textContent = main
		}else{
			heroH1.innerHTML = `${main}<br><span class="h1-sub">${sub}</span>`
		}
	}

	if(!window.__DT_HERO_HEADING_BOUND__){
		window.__DT_HERO_HEADING_BOUND__ = true
		const mqHero = window.matchMedia('(max-width: 560px)')
		if(mqHero.addEventListener){
			mqHero.addEventListener('change', setHeroHeading)
		}else if(mqHero.addListener){
			mqHero.addListener(setHeroHeading)
		}
		window.addEventListener('resize', setHeroHeading)
		document.addEventListener('i18n:change', setHeroHeading)
	}

	const siteNav = document.querySelector('nav.site-nav')
	if(siteNav){
		const setNav = (sels,key)=>{
			sels.forEach(sel=>{
				const a = siteNav.querySelector(sel)
				if(a)a.textContent = t(key)
			})
		}
		setNav(['a[href="#inicio"]','a[href="index.html#inicio"]'],'nav.home')
		setNav(['a[href="#guia"]','a[href="index.html#guia"]'],'nav.about')
		setNav(['a[href="#roteiros"]','a[href="index.html#roteiros"]','a[href="roteiros.html"]'],'nav.tours')
		setNav(['a[href="#depoimentos"]','a[href="index.html#depoimentos"]'],'nav.reviews')
		setNav(['a[href="#perguntas"]','a[href="index.html#perguntas"]'],'nav.faq')
	}

	const contact = document.querySelector('.btn-contato[data-zap="link"]')
	if(contact)contact.textContent = t('header.contact')

	const langTrigger = document.getElementById('langTrigger')
	if(langTrigger){
		langTrigger.setAttribute('title',t('header.langMenu'))
		const img = langTrigger.querySelector('img')
		if(img)img.alt = t('lang.currentAlt',{name:t('lang.self')})
	}
	const menu = document.getElementById('langMenu')
	if(menu)menu.setAttribute('aria-label',t('header.langMenu'))

	setHeroHeading()
	const heroLead = document.querySelector('.inicio-lead')
	if(heroLead)heroLead.textContent = t('home.lead')
	const heroCta1 = document.querySelector('.inicio-actions .btn-primary')
	if(heroCta1)heroCta1.textContent = t('home.cta.primary')
	const heroCta2 = document.querySelector('.inicio-actions .btn-ghost[data-zap="link"]')
	if(heroCta2)heroCta2.textContent = t('home.cta.secondary')

	const stTitle = document.querySelector('#estilos .section-title')
	if(stTitle)stTitle.textContent = t('styles.title')
	const stSub = document.querySelector('#estilos .section-sub')
	if(stSub)stSub.textContent = t('styles.sub')

	const styleCards = Array.from(document.querySelectorAll('#estilos .estilos-card'))
	if(styleCards.length>=3){
		const map = [
			{title:'styles.cards.family.title',text:'styles.cards.family.text',cta:'styles.cards.family.cta'},
			{title:'styles.cards.adventure.title',text:'styles.cards.adventure.text',cta:'styles.cards.adventure.cta'},
			{title:'styles.cards.private.title',text:'styles.cards.private.text',cta:'styles.cards.private.cta'}
		]
		styleCards.forEach((card,i)=>{
			const h3 = card.querySelector('.estilos-card-title')
			const p = card.querySelector('.estilos-card-text')
			const a = card.querySelector('a.btn')
			if(h3)h3.textContent = t(map[i].title)
			if(p)p.textContent = t(map[i].text)
			if(a)a.textContent = t(map[i].cta)
		})
	}

	const rtTitle = document.querySelector('#roteiros .section-title')
	if(rtTitle)rtTitle.textContent = t('tours.title')
	const rtSub = document.querySelector('#roteiros .section-sub')
	if(rtSub)rtSub.textContent = t('tours.sub')
	const rtAll = document.querySelector('#roteiros .roteiros-cta a')
	if(rtAll)rtAll.textContent = t('tours.ctaAll')

	const gTitle = document.querySelector('#guia .guia-title')
	if(gTitle)gTitle.textContent = t('guide.title')
	const gPs = Array.from(document.querySelectorAll('#guia .guia-copy .guia-p'))
	if(gPs[0])gPs[0].textContent = t('guide.p1')
	if(gPs[1])gPs[1].textContent = t('guide.p2')
	const gLabels = Array.from(document.querySelectorAll('#guia .guia-stats .label'))
	if(gLabels[0])gLabels[0].textContent = t('guide.stats.trilhas')
	if(gLabels[1])gLabels[1].textContent = t('guide.stats.anos')
	if(gLabels[2])gLabels[2].textContent = t('guide.stats.linguas')

	const depTitle = document.querySelector('#depoimentos .section-title')
	if(depTitle)depTitle.textContent = t('reviews.title')
	const depSub = document.querySelector('#depoimentos .section-sub')
	if(depSub)depSub.textContent = t('reviews.sub')

	const rdCopy = document.querySelector('.rd-sharecopy')
	if(rdCopy)rdCopy.textContent = t('share.copy')
	const rdCta = document.querySelector('.rd-cta')
	if(rdCta)rdCta.textContent = t('rd.cta')
	const shareBtns = document.querySelectorAll('.rd-share .rd-share-btn')
	if(shareBtns[0])shareBtns[0].setAttribute('aria-label',t('share.whatsappAria'))
	if(shareBtns[1])shareBtns[1].setAttribute('aria-label',t('share.linkAria'))

	const ppcTitle = document.querySelector('#politicas .ppc-title')
	if(ppcTitle)ppcTitle.innerHTML = t('ppc.title')
	const ppcItems = Array.from(document.querySelectorAll('#politicas .ppc-list li span'))
	if(ppcItems[0])ppcItems[0].textContent = t('ppc.items.0')
	if(ppcItems[1])ppcItems[1].textContent = t('ppc.items.1')
	if(ppcItems[2])ppcItems[2].textContent = t('ppc.items.2')
	if(ppcItems[3])ppcItems[3].textContent = t('ppc.items.3')
	if(ppcItems[4])ppcItems[4].textContent = t('ppc.items.4')

	const faqTitle = document.querySelector('#perguntas .section-title')
	if(faqTitle)faqTitle.textContent = t('faq.title')
	const faqSub = document.querySelector('#perguntas .section-sub')
	if(faqSub)faqSub.textContent = t('faq.sub')

	const zapLabel = document.querySelector('.zap-float .zap-float-label')
	if(zapLabel)zapLabel.textContent = t('whatsapp.button')

	const foot = document.querySelector('.foot-nav')
	if(foot){
		const setFoot = (sels,key)=>{
			sels.forEach(sel=>{
				const a = foot.querySelector(sel)
				if(a)a.textContent = t(key)
			})
		}
		setFoot(['a[href="#inicio"]','a[href="index.html#inicio"]'],'footer.links.home')
		setFoot(['a[href="#guia"]','a[href="index.html#guia"]'],'footer.links.about')
		setFoot(['a[href="#roteiros"]','a[href="index.html#roteiros"]','a[href="roteiros.html"]'],'footer.links.tours')
		setFoot(['a[href="#depoimentos"]','a[href="index.html#depoimentos"]'],'footer.links.reviews')
	}
	const footCopy = document.querySelector('.foot-copy')
	if(footCopy)footCopy.textContent = t('footer.copy')
	const footAuthor = document.querySelector('.foot-author')
	if(footAuthor)footAuthor.textContent = t('footer.author')

	const priceSmall = document.querySelector('.rp-price small')
	if(priceSmall)priceSmall.textContent = t('rp.priceFrom')

	const rpLabel = document.querySelector('.rp-label')
	if(rpLabel)rpLabel.textContent = t('rp.startEnd')

	const pplTitle = document.querySelector('.rp-people-title')
	if(pplTitle)pplTitle.textContent = t('rp.people.title')
	const pplSub = document.getElementById('rpPeopleLabel')
	if(pplSub)pplSub.textContent = t('rp.people.select')

	const pplRowTitle = document.querySelector('.rp-c-title')
	if(pplRowTitle)pplRowTitle.textContent = t('rp.people.personOne')
	const pplRowSub = document.querySelector('.rp-c-sub')
	if(pplRowSub)pplRowSub.textContent = t('rp.people.ageRange')

	const qtyInput = document.getElementById('rpQty')
	if(qtyInput)qtyInput.setAttribute('aria-label',t('rp.people.ariaQty'))
	const minusBtn = document.getElementById('rpMinus')
	if(minusBtn)minusBtn.setAttribute('aria-label',t('rp.people.dec'))
	const plusBtn = document.getElementById('rpPlus')
	if(plusBtn)plusBtn.setAttribute('aria-label',t('rp.people.inc'))

	const cta = document.getElementById('rpSubmit')
	if(cta&&cta.disabled)cta.textContent = t('rp.cta.disabled')

	const subBox = document.querySelector('.rp-subtotal')
	const subVal = document.getElementById('rpSubtotal')?.textContent || ''
	if(subBox)subBox.innerHTML = `${t('rp.subtotalLabel')} <b id="rpSubtotal">${subVal}</b>`

	const readBtn = document.getElementById('rpDescBtn')
	if(readBtn)readBtn.innerHTML = `<i class="bx bxs-book" aria-hidden="true"></i> ${t('rp.descBtn')}`

	const incTitle = document.querySelector('.rp-incluso .rp-subtitle')
	if(incTitle)incTitle.textContent = t('included.title')
	const incItems = Array.from(document.querySelectorAll('.rp-inc-list li'))
	if(incItems.length>=4){
		const map = [
			['included.pickup.title','included.pickup.text'],
			['included.meal.title','included.meal.text'],
			['included.tickets.title','included.tickets.text'],
			['included.guide.title','included.guide.text']
		]
		incItems.slice(0,4).forEach((li,i)=>{
			const b = li.querySelector('div > b')
			const s = li.querySelector('div > span')
			if(b)b.textContent = t(map[i][0])
			if(s)s.textContent = t(map[i][1])
		})
	}

	const aboutTitle = document.querySelector('.rp-about .rp-subtitle')
	if(aboutTitle)aboutTitle.textContent = t('rp.aboutTitle')
	const seeMore = document.getElementById('rpSeeMore')
	if(seeMore)seeMore.innerHTML = `${t('rp.seeMore')} <i class="bx bx-chevron-down"></i>`
	const seeLess = document.getElementById('rpSeeLess')
	if(seeLess)seeLess.innerHTML = `${t('rp.seeLess')} <i class="bx bx-chevron-up"></i>`

	const moreTitle = document.querySelector('.rp-more .rp-subtitle')
	if(moreTitle)moreTitle.textContent = t('rp.moreTitle')

	const galPrev = document.querySelector('.gal-prev')
	if(galPrev)galPrev.setAttribute('aria-label',t('carousel.prev'))
	const galNext = document.querySelector('.gal-next')
	if(galNext)galNext.setAttribute('aria-label',t('carousel.next'))

	const drpTitle = document.getElementById('drpTitle')
	if(drpTitle)drpTitle.textContent = t('drp.title')
	const tabStartLbl = document.querySelector('#drpTabStart .drp-tab-label')
	if(tabStartLbl)tabStartLbl.textContent = t('drp.tabStart')
	const tabEndLbl = document.querySelector('#drpTabEnd .drp-tab-label')
	if(tabEndLbl)tabEndLbl.textContent = t('drp.tabEnd')
	const inpS = document.getElementById('drpInputStart')
	const inpE = document.getElementById('drpInputEnd')
	if(inpS){
		inpS.placeholder = t('rp.date.placeholderStart')
		inpS.setAttribute('aria-label',t('rp.date.startAria'))
	}
	if(inpE){
		inpE.placeholder = t('rp.date.placeholderEnd')
		inpE.setAttribute('aria-label',t('rp.date.endAria'))
	}
	const prevBtn = document.querySelector('.drp-prev')
	if(prevBtn)prevBtn.setAttribute('aria-label',t('drp.prev'))
	const nextBtn = document.querySelector('.drp-next')
	if(nextBtn)nextBtn.setAttribute('aria-label',t('drp.next'))
	const drpClear = document.getElementById('drpClear')
	if(drpClear)drpClear.textContent = t('drp.clear')
	const drpApply = document.getElementById('drpApply')
	if(drpApply)drpApply.textContent = t('drp.apply')
}

function updateFlagUI(){
	const map = { pt:'img/flag-br.png', en:'img/flag-gb.png', fr:'img/flag-fr.png' };
	const lang = (localStorage.getItem('lang') || document.documentElement.lang || 'pt').toLowerCase();
	const img = document.querySelector('#langTrigger img');
	if(img){
		img.src = map[lang] || map.pt;
		img.alt = i18n.t('lang.currentAlt', { name: i18n.t('lang.self') });
	}
	document.querySelectorAll('.lang-menu a[data-lang]').forEach(a=>{
		a.classList.toggle('active', a.dataset.lang === lang);
	});
}
function notifyRehydrated(page){
	try {
		document.dispatchEvent(new CustomEvent('page:rehydrated', { detail: { page } }));
	} catch (_) {}
}

async function rehydrate(){
	const page = detectPage()

	if (page === 'list') {
		const { hydrateList } = await importRoot('data.js')
		await hydrateList()
		await importRoot('main.js')
		await importRoot('roteiros.js')
		applyStaticBindings()
		await rebindSharebars()
		if (typeof i18n?.apply === 'function') i18n.apply(document)
		notifyRehydrated('list')
		return
	}

	if (page === 'detail') {
		const { hydrateDetail } = await importRoot('data.js')
		await hydrateDetail()
		await importRoot('main.js')
		await importRoot('roteiro-detalhe.js')
		applyStaticBindings()
		await rebindSharebars()
		if (typeof i18n?.apply === 'function') i18n.apply(document)
		notifyRehydrated('detail')
		return
	}

	const { hydrateIndex } = await importRoot('data.js')
	await hydrateIndex()
	await importRoot('main.js')
	applyStaticBindings()
	await rebindSharebars()
	if (typeof i18n?.apply === 'function') i18n.apply(document)
	notifyRehydrated('home')
}

function bindLangMenu(){
	document.querySelectorAll('.lang-menu a[data-lang]').forEach(a=>{
		a.addEventListener('click', async e=>{
			e.preventDefault();
			const next = a.dataset.lang;
			if(!next) return;

			loading.show('lang-change');

			if (typeof i18n?.setLang === 'function') {
				await i18n.setLang(next);
			}
			document.documentElement.lang = (next === 'pt' ? 'pt-br' : next);
			localStorage.setItem('lang', next);
			localStorage.setItem('dt.lang', next);

			const dataMod = await importRoot('data.js');
			if (typeof dataMod.invalidateDataCache === 'function') {
				dataMod.invalidateDataCache();
			}

			updateFlagUI();
			await rehydrate();
			if (typeof i18n?.apply === 'function') i18n.apply(document);
			
			loading.hide();
		});
	});
}

async function boot(){
	const lang = resolveLang()
	loading.show('boot')
	try{
		await applyI18n(lang)
		updateFlagUI()
		await rehydrate()
		if (typeof i18n?.apply === 'function') i18n.apply(document)
		setZapPrefill()
		bindLangMenu()
		loading.bindNavigationLoading()
	}finally{
		loading.hide()
	}
}

document.addEventListener('i18n:change', () => {
  	setZapPrefill()
})

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
	boot();
}

function setZapPrefill() {
	const anchors = Array.from(document.querySelectorAll('a[data-zap="link"], a.zap-float'));
	if (!anchors.length) return;

	const base = (() => {
		const ref = document.querySelector('.zap-float') || anchors[0];
		try {
			const u = new URL(ref.getAttribute('href') || 'https://wa.me/5511910254958', location.href);
			u.search = '';
			return u.origin + u.pathname;
		} catch (_) {
			return 'https://wa.me/5511910254958';
		}
	})();

	const msg = (typeof i18n?.t === 'function') ? i18n.t('wa.contact') : 'Olá Diamantina Trekking! Quero um atendimento online.';
	anchors.forEach(a => {
		try {
			const u = new URL(base, location.href);
			u.search = '?text=' + encodeURIComponent(msg);
			a.setAttribute('href', u.href);
			a.setAttribute('target', '_blank');
			a.setAttribute('rel', 'noopener');
		} catch (_) {
			a.setAttribute('href', base + '?text=' + encodeURIComponent(msg));
			a.setAttribute('target', '_blank');
			a.setAttribute('rel', 'noopener');
		}
	});
}