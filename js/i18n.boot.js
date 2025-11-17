import * as i18n from './i18n.js'

function qs(s){ return document.querySelector(s) }
function qsa(s){ return Array.from(document.querySelectorAll(s)) }

function setText(el, key){
	if(!el) return
	el.textContent = i18n.t(key)
}
function setHTML(el, key){
	if(!el) return
	el.innerHTML = i18n.t(key)
}
function abs(href){
	try{ return new URL(href, location.href).href }catch(_){ return location.href }
}
function pickTitle(scope){
	const t = scope.querySelector('.rp-title, .rd-title')
	if(t && t.textContent.trim()) return t.textContent.trim()
	return document.title.replace(/\s*\|.*$/,'').trim()
}
function pickLink(scope){
	if(scope.closest?.('.rp') || scope.matches?.('.rp')) return abs(location.href)
	const cta = scope.querySelector?.('.rd-cta')
	if(cta) return abs(cta.getAttribute('href') || cta.href)
	return abs(location.href)
}

function applyStaticBindings(){
	const t = i18n.t

	const nav = document.querySelector('nav.site-nav')
	if(nav){
		const link = (href,key)=>{ const a = nav.querySelector(`a[href="${href}"]`); if(a) a.textContent = t(key) }
		link('#inicio', 'nav.home')
		link('#guia', 'nav.about')
		link('#roteiros', 'nav.tours')
		link('#depoimentos', 'nav.reviews')
		link('#perguntas', 'nav.faq')
	}

	const contact = document.querySelector('.btn-contato[data-zap="link"]')
	if(contact) contact.textContent = t('header.contact')

	const langTrigger = document.getElementById('langTrigger')
	if(langTrigger){
		langTrigger.setAttribute('title', t('header.langMenu'))
		const img = langTrigger.querySelector('img')
		if(img) img.alt = t('lang.currentAlt', { name: t('lang.self') })
	}
	const menu = document.getElementById('langMenu')
	if(menu) menu.setAttribute('aria-label', t('header.langMenu'))

	const heroH1 = qs('#inicio h1')
	if(heroH1) heroH1.innerHTML = `${t('home.h1.main')}<br><span class="h1-sub">${t('home.h1.sub')}</span>`
	const heroLead = qs('.inicio-lead')
	if(heroLead) heroLead.textContent = t('home.lead')
	const heroCta1 = qs('.inicio-actions .btn-primary')
	if(heroCta1) heroCta1.textContent = t('home.cta.primary')
	const heroCta2 = qs('.inicio-actions .btn-ghost[data-zap="link"]')
	if(heroCta2) heroCta2.textContent = t('home.cta.secondary')

	const stTitle = qs('#estilos .section-title')
	if(stTitle) stTitle.textContent = t('styles.title')
	const stSub = qs('#estilos .section-sub')
	if(stSub) stSub.textContent = t('styles.sub')

	const styleCards = qsa('#estilos .estilos-card')
	if(styleCards.length >= 3){
		const map = [
			{ title:'styles.cards.family.title', text:'styles.cards.family.text', cta:'styles.cards.family.cta' },
			{ title:'styles.cards.adventure.title', text:'styles.cards.adventure.text', cta:'styles.cards.adventure.cta' },
			{ title:'styles.cards.private.title', text:'styles.cards.private.text', cta:'styles.cards.private.cta' }
		]
		styleCards.forEach((card, i)=>{
			const h3 = card.querySelector('.estilos-card-title')
			const p = card.querySelector('.estilos-card-text')
			const a = card.querySelector('a.btn')
			if(h3) h3.textContent = t(map[i].title)
			if(p) p.textContent = t(map[i].text)
			if(a) a.textContent = t(map[i].cta)
		})
	}

	const rtTitle = qs('#roteiros .section-title')
	if(rtTitle) rtTitle.textContent = t('tours.title')
	const rtSub = qs('#roteiros .section-sub')
	if(rtSub) rtSub.textContent = t('tours.sub')
	const rtAll = qs('#roteiros .roteiros-cta a')
	if(rtAll) rtAll.textContent = t('tours.ctaAll')

	const gTitle = qs('#guia .guia-title')
	if(gTitle) gTitle.textContent = t('guide.title')
	const gPs = qsa('#guia .guia-copy .guia-p')
	if(gPs[0]) gPs[0].textContent = t('guide.p1')
	if(gPs[1]) gPs[1].textContent = t('guide.p2')
	const gLabels = qsa('#guia .guia-stats .label')
	if(gLabels[0]) gLabels[0].textContent = t('guide.stats.trilhas')
	if(gLabels[1]) gLabels[1].textContent = t('guide.stats.anos')
	if(gLabels[2]) gLabels[2].textContent = t('guide.stats.linguas')

	const depTitle = qs('#depoimentos .section-title')
	if(depTitle) depTitle.textContent = t('reviews.title')
	const depSub = qs('#depoimentos .section-sub')
	if(depSub) depSub.textContent = t('reviews.sub')

	const rdCopy = qs('.rd-sharecopy')
	if(rdCopy) rdCopy.textContent = t('share.copy')
	const rdCta = qs('.rd-cta')
	if(rdCta) rdCta.textContent = t('rd.cta')

	const ppcTitle = qs('#politicas .ppc-title')
	if(ppcTitle) ppcTitle.innerHTML = t('ppc.title')
	const ppcItems = qsa('#politicas .ppc-list li span')
	if(ppcItems[0]) ppcItems[0].textContent = t('ppc.items.0')
	if(ppcItems[1]) ppcItems[1].textContent = t('ppc.items.1')
	if(ppcItems[2]) ppcItems[2].textContent = t('ppc.items.2')
	if(ppcItems[3]) ppcItems[3].textContent = t('ppc.items.3')
	if(ppcItems[4]) ppcItems[4].textContent = t('ppc.items.4')

	const faqTitle = qs('#perguntas .section-title')
	if(faqTitle) faqTitle.textContent = t('faq.title')
	const faqSub = qs('#perguntas .section-sub')
	if(faqSub) faqSub.textContent = t('faq.sub')

	const zapLabel = qs('.zap-float .zap-float-label')
	if(zapLabel) zapLabel.textContent = t('whatsapp.button')

	const foot = document.querySelector('.foot-nav')
	if(foot){
		const link = (href,key)=>{ const a = foot.querySelector(`a[href="${href}"]`); if(a) a.textContent = t(key) }
		link('#inicio', 'footer.links.home')
		link('#guia', 'footer.links.about')
		link('#roteiros', 'footer.links.tours')
		link('#depoimentos', 'footer.links.reviews')
	}
	const footCopy = qs('.foot-copy')
	if(footCopy) footCopy.textContent = t('footer.copy')
	const footAuthor = qs('.foot-author')
	if(footAuthor) footAuthor.textContent = t('footer.author')
}

function updateFlagUI(){
	const map = { pt:'img/flag-br.png', en:'img/flag-gb.png', fr:'img/flag-fr.png' }
	const lang = i18n.getLang()
	const img = qs('#langTrigger img')
	if(img){
		img.src = map[lang] || map.pt
		img.alt = i18n.t('lang.currentAlt', { name: i18n.t('lang.self') })
	}
	qsa('.lang-menu a[data-lang]').forEach(a=>{
		a.classList.toggle('active', a.dataset.lang === lang)
	})
}

function rebindSharebars(){
	function ensureToast(){
		let toast = document.getElementById('shareToast')
		if(!toast){
			toast = document.createElement('div')
			toast.id = 'shareToast'
			toast.className = 'share-toast'
			toast.setAttribute('role','status')
			toast.setAttribute('aria-live','polite')
			document.body.appendChild(toast)
			if(!document.getElementById('shareToastStyles')){
				const st = document.createElement('style')
				st.id = 'shareToastStyles'
				st.textContent = `
				.share-toast{position:fixed;left:50%;top:-64px;transform:translate(-50%,-10px);background:var(--brand);color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,.18);opacity:0;z-index:9999;transition:transform .28s ease,opacity .28s ease,top .28s ease;font-weight:700}
				.share-toast.is-visible{top:14px;opacity:1;transform:translate(-50%,0)}
				`
				document.head.appendChild(st)
			}
		}
		return toast
	}
	function showToast(text){
		const toast = ensureToast()
		toast.textContent = text
		requestAnimationFrame(()=>toast.classList.add('is-visible'))
		clearTimeout(toast._timer)
		toast._timer = setTimeout(()=>{ toast.classList.remove('is-visible') }, 8000)
	}
	async function copy(link){
		try{
			if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(link)
			else{
				const ta = document.createElement('textarea')
				ta.value = link
				ta.style.position = 'fixed'
				ta.style.opacity = '0'
				document.body.appendChild(ta)
				ta.select()
				document.execCommand('copy')
				document.body.removeChild(ta)
			}
			showToast(i18n.t('share.copied'))
		}catch(_){
			showToast(i18n.t('share.copyFail'))
		}
	}
	function waMsg(title, link){
		return i18n.t('share.whatsMsg', { title, link })
	}
	qsa('.rd-sharebar').forEach(bar=>{
		const scope = bar.closest('#roteiro-destaque, .rp, body') || document
		const btns = bar.querySelectorAll('.rd-share .rd-share-btn')
		const whats = btns[0]
		const copyBtn = btns[1]
		if(whats){
			const clone = whats.cloneNode(true)
			whats.parentNode.replaceChild(clone, whats)
			clone.addEventListener('click', e=>{
				e.preventDefault()
				const title = pickTitle(scope)
				const link = pickLink(scope)
				const url = 'https://wa.me/?text=' + encodeURIComponent(waMsg(title, link))
				window.open(url, '_blank', 'noopener')
			})
		}
		if(copyBtn){
			const clone = copyBtn.cloneNode(true)
			copyBtn.parentNode.replaceChild(clone, copyBtn)
			clone.addEventListener('click', e=>{
				e.preventDefault()
				copy(pickLink(scope))
			})
		}
	})
}

function bindLangMenu(){
	qsa('.lang-menu a[data-lang]').forEach(a=>{
		a.addEventListener('click', async e=>{
			e.preventDefault()
			await i18n.setLang(a.dataset.lang)
			updateFlagUI()
			await rehydrate()
		})
	})
}

async function rehydrate(){
	const page = location.pathname.split('/').pop() || 'index.html'
	if(page === 'index.html'){
		const { hydrateIndex } = await import('../data.js')
		await hydrateIndex()
	}else if(page === 'roteiros.html'){
		const { hydrateList } = await import('../data.js')
		await hydrateList()
	}else if(page === 'roteiro-detalhe.html'){
		const { hydrateDetail } = await import('../data.js')
		await hydrateDetail()
	}
	await import('../main.js')
	applyStaticBindings()
	rebindSharebars()
}

async function boot(){
	await i18n.init()
	updateFlagUI()
	await rehydrate()
	bindLangMenu()
}

await boot()