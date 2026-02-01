const STORE_KEY = 'dt.lang'
const SUPPORTED = ['pt','en','fr']
let curLang = null
let dict = {}

function norm(l){
	l = String(l||'').toLowerCase()
	if(SUPPORTED.includes(l)) return l
	if(/^pt/.test(l)) return 'pt'
	if(/^en/.test(l)) return 'en'
	if(/^fr/.test(l)) return 'fr'
	return 'pt'
}

function htmlLang(l){
	if(l==='pt') return 'pt-br'
	if(l==='en') return 'en'
	if(l==='fr') return 'fr'
	return 'pt-br'
}

async function loadUI(lang){
	try{
		const res = await fetch(`./i18n/${lang}/ui.json`, { cache:'no-store' })
		if(!res.ok) throw new Error()
		return await res.json()
	}catch(_){
		if(lang!=='pt') return await loadUI('pt')
		return {}
	}
}

export async function init(){
	let saved = localStorage.getItem(STORE_KEY) || localStorage.getItem('lang')
	if(!saved){
		saved = norm(navigator.language || navigator.userLanguage || 'pt')
	}
	curLang = norm(saved)
	dict = await loadUI(curLang)
	document.documentElement.setAttribute('lang', htmlLang(curLang))
}

export function getLang(){
	return curLang || 'pt'
}

export async function setLang(lang){
	const next = norm(lang)
	if(next === curLang) return
	curLang = next
	localStorage.setItem(STORE_KEY, curLang)
	dict = await loadUI(curLang)
	document.documentElement.setAttribute('lang', htmlLang(curLang))
	document.dispatchEvent(new CustomEvent('i18n:change', { detail:{ lang: curLang } }))
}

export function t(path, params){
	const segs = String(path||'').split('.')
	let ref = dict
	for(const s of segs){
		if(ref && Object.prototype.hasOwnProperty.call(ref, s)) ref = ref[s]
		else { ref = null; break }
	}
	let out = (typeof ref === 'string') ? ref : path
	if(params && typeof out === 'string'){
		out = out.replace(/\{(\w+)\}/g, (_,k)=> String(params[k]??''))
	}
	return out
}

export function locale(){
	const l = getLang()
	if(l==='pt') return 'pt-BR'
	if(l==='en') return 'en-GB'
	if(l==='fr') return 'fr-FR'
	return 'pt-BR'
}

export function apply(root){
	const scope = root || document
	scope.querySelectorAll('[data-i18n]').forEach(el=>{
		const key = el.getAttribute('data-i18n')
		if(!key) return
		const mode = el.getAttribute('data-i18n-mode') || 'text'
		const val = t(key)
		if(mode==='html') el.innerHTML = val
		else el.textContent = val
	})
}