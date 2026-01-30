import * as i18n from './i18n.js'

const DATA_URL = (typeof window !== 'undefined' && window.__DATA_URL__) || './data.json'

function money(v){
	return (v||0).toLocaleString(i18n.locale(), { style:'currency', currency:'BRL' })
}

function plural(n, one, other){
	return n===1 ? i18n.t(one) : i18n.t(other)
}

function dataURL(){
	if (typeof window !== 'undefined' && window.__DATA_URL__) return window.__DATA_URL__
	return `../i18n/${i18n.getLang()}/data.json`
}

let __DATA_ALL__ = null
let __DATA_LANG__ = null

function normalizeRoteiro(r){
	const nivel = String(r.nivel||'').toLowerCase()
	const rawDur = Number(r.duracao ?? r.horas ?? 24)
	const horas = Number.isFinite(rawDur) && rawDur > 0 ? Math.ceil(rawDur) : 24
	const dias = horas < 24 ? 1 : Math.ceil(horas / 24)
	let duracaoTexto = ''
	if(horas < 24){
		duracaoTexto = horas + ' ' + (horas===1 ? i18n.t('time.hour_one') : i18n.t('time.hour_other'))
	}else{
		duracaoTexto = dias + ' ' + (dias===1 ? i18n.t('time.day_one') : i18n.t('time.day_other'))
	}
	const rawDesc = r.descricao
	let descTexto = ''
	let descLista = null
	if(Array.isArray(rawDesc)){
		descLista = rawDesc.map(x => String(x||'').trim()).filter(x => x.length > 0)
		descTexto = descLista.join('\n')
	}else{
		descTexto = String(rawDesc||'').trim()
	}
	return {
		id: Number(r.id),
		titulo: String(r.titulo||'').trim(),
		nivel: (nivel==='moderado'||nivel==='intenso') ? nivel : 'leve',
		valor: Number(r.valor_por_pessoa ?? r.valor ?? 0),
		duracao: duracaoTexto,
		dias: dias,
		horas: horas,
		preview: String(r.preview||'').trim(),
		descricao: descTexto,
		descricaoLista: descLista,
		imagens: Array.isArray(r.imagens) ? r.imagens : [],
		paginaPrincipal: !!(r['pagina-principal'] ?? r.pagina_principal),
		destaque: !!r.destaque,
		descricaoDestaque: String(r['descricao-destaque'] ?? r.descricao_destaque ?? '').trim()
	}
}

function toISODate(d){
	const y = d.getFullYear()
	const m = String(d.getMonth()+1).padStart(2,'0')
	const day = String(d.getDate()).padStart(2,'0')
	return `${y}-${m}-${day}`
}

function normalizeDate(input){
	if(!input) return ''
	if(/^\d{4}-\d{2}-\d{2}$/.test(input)) return input
	const m = String(input).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
	if(m) return `${m[3]}-${m[2]}-${m[1]}`
	const d = new Date(input)
	return isNaN(d.getTime()) ? '' : toISODate(d)
}

function normalizePergunta(p, idx){
	return {
		id: Number(p?.id ?? idx+1),
		pergunta: String(p?.pergunta || '').trim(),
		resposta: String(p?.resposta || '').trim()
	}
}

function normalizeMemoria(m){
	return {
		nome: String(m?.nome || '').trim(),
		data: normalizeDate(m?.data),
		mensagem: String(m?.mensagem || '').trim()
	}
}

function fmtBRDate(iso){
	if(!iso) return ''
	const [y,m,d] = iso.split('-')
	return `${d}/${m}/${y}`
}

function esc(s){
	return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}

function hideById(id){
	const el = document.getElementById(id)
	if(el) el.remove()
}

function cardHTML(r){
	const capa = r.imagens[0] || '../img/roteiros/pai-inacio/imagem-1.png'
	return `
	<article class="roteiro-card" data-intensidade="${esc(r.nivel)}">
		<div class="roteiro-card-img">
			<img src="${esc(capa)}" alt="${esc(r.titulo)}">
		</div>
		<div class="roteiro-card-body">
			<h3 class="roteiro-card-title" title="${esc(r.titulo)}">${esc(r.titulo)}</h3>
			<div class="roteiro-card-line" tabindex="0">
				<span>${esc(i18n.t('cards.about'))}</span>
				<button class="roteiro-toggle" type="button" aria-expanded="false" aria-label="${esc(i18n.t('cards.toggleAria'))}">
					<i class="bx bx-plus" aria-hidden="true"></i>
				</button>
			</div>
			<p class="roteiro-desc">${esc(r.preview)}</p>
			<div class="roteiro-meta">
				<span class="roteiro-meta-left">
					<i class="bx bxs-time"></i>${esc(r.duracao)}
				</span>
				<span class="roteiro-meta-right">
					<small>${esc(i18n.t('cards.from'))}</small> <b>${money(r.valor)}</b>
				</span>
			</div>
			<a href="roteiro-detalhe.html?id=${r.id}" class="btn btn-primary roteiro-btn">${esc(i18n.t('cards.details'))}</a>
		</div>
	</article>`
}

function faqItemHTML(item){
	return `
	<li class="faq-item">
		<button class="faq-q" type="button" aria-expanded="false">
			<span class="faq-q-text">${esc(item.pergunta)}</span>
			<i class="bx bx-plus" aria-hidden="true"></i>
		</button>
		<div class="faq-a">
			<p>${esc(item.resposta)}</p>
		</div>
	</li>`
}

function memoriaItemHTML(m){
	return `
	<li class="depo-card">
		<div class="depo-card-head">
			<h3>${esc(m.nome)}</h3>
			<time datetime="${esc(m.data)}">${esc(fmtBRDate(m.data))}</time>
		</div>
		<p>${esc(m.mensagem)}</p>
	</li>`
}

function ensureBadges(scope){
	scope.querySelectorAll('.roteiro-card').forEach(card=>{
		const level=(card.dataset.intensidade||'').toLowerCase()
		const slot=card.querySelector('.roteiro-card-img')
		if(!slot||slot.querySelector('.intensity-badge'))return
		const text=(level==='intenso')?i18n.t('intensity.intenso'):(level==='moderado'?i18n.t('intensity.moderado'):i18n.t('intensity.leve'))
		const badge=document.createElement('span')
		badge.className='intensity-badge intensity-'+(level||'leve')
		badge.innerHTML='<img src="../img/icons/intensidade-icon.png" alt=""><span>'+esc(String(text||'').toUpperCase())+'</span>'
		slot.insertBefore(badge,slot.firstChild)
	})
}

function toggleCard(card){
	const row = card.querySelector('.roteiro-card-line')
	const btn = card.querySelector('.roteiro-toggle')
	const icon = btn ? btn.querySelector('i') : null
	const desc = card.querySelector('.roteiro-desc')
	if(!row || !desc) return

	const isOpen = card.classList.contains('is-open')

	function afterTransition(){
		desc.removeEventListener('transitionend', afterTransition)
		if(card.classList.contains('is-open')){
			desc.style.height = 'auto'
		}
	}

	if(!isOpen){
		desc.style.height = 'auto'
		const h = desc.scrollHeight
		desc.style.height = '0px'
		void desc.offsetHeight
		card.classList.add('is-open')
		if(btn) btn.setAttribute('aria-expanded','true')
		if(icon){ icon.classList.remove('bx-plus'); icon.classList.add('bx-minus') }
		desc.style.height = h + 'px'
		desc.addEventListener('transitionend', afterTransition)
	}else{
		const h = desc.scrollHeight
		desc.style.height = h + 'px'
		void desc.offsetHeight
		card.classList.remove('is-open')
		if(btn) btn.setAttribute('aria-expanded','false')
		if(icon){ icon.classList.remove('bx-minus'); icon.classList.add('bx-plus') }
		desc.style.height = '0px'
		desc.addEventListener('transitionend', afterTransition)
	}
}

function initCardLineToggle(){
	if(window.__CARD_LINE_TOGGLE__)return
	window.__CARD_LINE_TOGGLE__=true
	document.addEventListener('click',function(e){
		const row=e.target.closest('.roteiro-card-line')
		if(!row)return
		const card=row.closest('.roteiro-card')
		if(!card)return
		e.preventDefault()
		toggleCard(card)
	})
	document.addEventListener('keydown',function(e){
		if(e.key!=='Enter'&&e.key!==' ')return
		const row=e.target.closest('.roteiro-card-line')
		if(!row)return
		const card=row.closest('.roteiro-card')
		if(!card)return
		e.preventDefault()
		toggleCard(card)
	})
}

function bindRoteiroToggles(scope){
	scope.querySelectorAll('.roteiro-card .roteiro-card-line').forEach(row=>{
		if(!row.hasAttribute('tabindex'))row.setAttribute('tabindex','0')
	})
}

export function invalidateDataCache(){
	__DATA_ALL__ = null
	__DATA_LANG__ = null
}

async function loadData(){
	const currentLang =
		(typeof i18n?.getLang === 'function' && i18n.getLang()) ||
		(document.documentElement.lang || 'pt')

	if(__DATA_ALL__ && __DATA_LANG__ === currentLang){
		return __DATA_ALL__
	}

	try{
		const res = await fetch(dataURL(), { cache:'no-store' })
		if(!res.ok) throw new Error()
		const raw = await res.json()
		const rlist = Array.isArray(raw.roteiros) ? raw.roteiros : []
		const flist = Array.isArray(raw.perguntas) ? raw.perguntas : []
		const mlist = Array.isArray(raw.memorias) ? raw.memorias : []
		__DATA_ALL__ = {
			roteiros: rlist.map(normalizeRoteiro).sort((a,b)=>a.id-b.id),
			perguntas: flist.map(normalizePergunta),
			memorias: mlist.map(normalizeMemoria)
		}
		__DATA_LANG__ = currentLang
		return __DATA_ALL__
	}catch(_){
		if(currentLang!=='pt'){
			try{
				const res = await fetch('./i18n/pt/data.json', { cache:'no-store' })
				if(res.ok){
					const raw = await res.json()
					const rlist = Array.isArray(raw.roteiros) ? raw.roteiros : []
					const flist = Array.isArray(raw.perguntas) ? raw.perguntas : []
					const mlist = Array.isArray(raw.memorias) ? raw.memorias : []
					__DATA_ALL__ = {
						roteiros: rlist.map(normalizeRoteiro).sort((a,b)=>a.id-b.id),
						perguntas: flist.map(normalizePergunta),
						memorias: mlist.map(normalizeMemoria)
					}
					__DATA_LANG__ = 'pt'
					return __DATA_ALL__
				}
			}catch(__){}
		}
		__DATA_ALL__ = { roteiros:[], perguntas:[], memorias:[] }
		__DATA_LANG__ = currentLang
		return __DATA_ALL__
	}
}

export async function loadRoteiros(){
	const d = await loadData()
	return d.roteiros
}

export async function loadPerguntas(){
	const d = await loadData()
	return d.perguntas
}

export async function loadMemorias(){
	const d = await loadData()
	return d.memorias
}

export async function hydrateIndex(){
	initCardLineToggle()
	const { roteiros, perguntas, memorias } = await loadData()
	if(!roteiros.length){
		hideById('roteiros')
		hideById('roteiro-destaque')
	}else{
		const grid = document.querySelector('#roteiros .roteiros-grid')
		if(grid){
			const home = roteiros.filter(r=>r.paginaPrincipal).slice(0,6)
			const items = home.length ? home : roteiros.slice(0,6)
			grid.innerHTML = items.map(cardHTML).join('')
			ensureBadges(grid)
			bindRoteiroToggles(grid)
		}
		const rdSection = document.getElementById('roteiro-destaque')
		if(rdSection){
			const destaque = roteiros.find(r=>r.destaque) || roteiros.find(r=>r.paginaPrincipal) || roteiros[0]
			if(destaque){
				const titleEl = rdSection.querySelector('.rd-title')
				const textEl = rdSection.querySelector('.rd-text')
				const ctaEl = rdSection.querySelector('.rd-cta')
				if(titleEl) titleEl.textContent = destaque.titulo.toUpperCase()
				if(textEl){
					const base = destaque.descricaoDestaque || destaque.preview
					textEl.innerHTML = esc(base) + '<br>' + esc(i18n.t('rd.teaserTail'))
				}
				if(ctaEl) ctaEl.setAttribute('href','roteiro-detalhe.html?id='+destaque.id)
				const track = rdSection.querySelector('.rd-track')
				if(track){
					const imgs = destaque.imagens.length ? destaque.imagens : ['../img/roteiros/pai-inacio/imagem-1.png']
					track.innerHTML = imgs.map(src=>`<li class="rd-slide"><img src="${esc(src)}" alt="${esc(destaque.titulo)}"></li>`).join('')
				}
			}else{
				hideById('roteiro-destaque')
			}
		}
	}
	const faqSection = document.getElementById('perguntas')
	if(faqSection){
		if(!perguntas.length){
			faqSection.remove()
		}else{
			const faqList = faqSection.querySelector('.faq-list')
			if(faqList) faqList.innerHTML = perguntas.map(faqItemHTML).join('')
		}
	}
	const depoSection = document.getElementById('depoimentos')
	if(depoSection){
		if(!memorias.length){
			depoSection.remove()
		}else{
			const track = depoSection.querySelector('.depo-track')
			if(track) track.innerHTML = memorias.map(memoriaItemHTML).join('')
		}
	}
}

export async function hydrateList(){
	initCardLineToggle()
	const { roteiros } = await loadData()

	if(!roteiros.length){
		const target = new URL('./index.html', location.href)
		location.replace(target.href)
		return
	}

	const grid = document.getElementById('rlistGrid')
	if(grid){
		grid.innerHTML = roteiros.map(cardHTML).join('')
		ensureBadges(grid)
		bindRoteiroToggles(grid)
	}
}

export async function hydrateDetail(){
	initCardLineToggle()
	const { roteiros } = await loadData()

	if(!Array.isArray(roteiros) || !roteiros.length){
		location.replace(new URL('./roteiros.html', location.href))
		return
	}

	const sp = new URLSearchParams(location.search)
	const rawId = sp.get('id')
	const id = parseInt(rawId ?? '', 10)
	const hasValidId = Number.isInteger(id)

	const r = hasValidId ? roteiros.find(x=>Number(x.id)===id) : null
	if(!r){
		location.replace(new URL('./roteiros.html', location.href))
		return
	}

	const root = document.getElementById('rpGrid')
	if(root){
		root.dataset.days = String(r.dias||1)
		root.dataset.hours = String(r.horas||0)
		root.dataset.price = String(r.valor||0)
		root.dataset.intensidade = r.nivel
	}

	const titleEl = document.querySelector('.rp-title')
	const leadEl = document.querySelector('.rp-lead')
	const daysWrap = document.querySelector('.rp-days')
	let daysB = daysWrap?.querySelector('b')
	const clockIcon = daysWrap?.querySelector('i')
	const priceB = document.querySelector('.rp-price b')

	if(titleEl) titleEl.textContent = r.titulo
	if(leadEl) leadEl.textContent = r.preview
	if(clockIcon) clockIcon.className = 'bxrds bxs-clock-4'
	if(daysWrap && !daysB){
		daysB = document.createElement('b')
		daysWrap.appendChild(daysB)
	}
	if(daysB) daysB.textContent = r.duracao
	if(priceB) priceB.textContent = money(r.valor)

	const track = document.querySelector('.gal-track')
	if(track){
		const imgs = r.imagens.length ? r.imagens : ['../img/roteiros/pai-inacio/imagem-1.png']
		track.innerHTML = imgs.map(src=>`<div class="gal-slide"><img src="${esc(src)}" alt="${esc(r.titulo)}"></div>`).join('')
	}
	const thumbs = document.querySelector('.gal-thumbs')
	if(thumbs){
		const imgs = r.imagens.length ? r.imagens : ['../img/roteiros/pai-inacio/imagem-1.png']
		thumbs.innerHTML = imgs.map((src,i)=>`<button class="gal-thumb ${i===0?'is-active':''}" type="button"><img src="${esc(src)}" alt="${esc(i18n.t('gallery.thumb',{n:i+1}))}"></button>`).join('')
	}

	const preview = document.querySelector('.rp-preview')
	if(preview) preview.textContent = r.preview

	const descInner = document.querySelector('#rpDesc .rp-desc-inner')
	if(descInner){
		if(Array.isArray(r.descricaoLista) && r.descricaoLista.length){
			const items = r.descricaoLista.map(txt=>`<li>${esc(txt)}</li>`).join('')
			descInner.innerHTML = `<ul>${items}</ul>`
		}else{
			const texto = r.descricao || r.preview
			const blocks = texto.split(/\n{2,}/).map(p=>`<p>${esc(p)}</p>`).join('')
			descInner.innerHTML = blocks || `<p>${esc(r.preview)}</p>`
		}
	}

	const moreGrid = document.getElementById('carrosselRoteiros')
	if(moreGrid){
		const rank = (n)=>{
			const cur = r.nivel
			if(cur==='moderado') return n==='moderado'?0:(n==='leve'?1:2)
			if(cur==='leve') return n==='leve'?0:(n==='moderado'?1:2)
			if(cur==='intenso') return n==='intenso'?0:(n==='moderado'?1:2)
			return 3
		}
		const more = roteiros
			.filter(x=>x.id!==r.id)
			.sort((a,b)=>{
				const pa = rank(a.nivel)
				const pb = rank(b.nivel)
				if(pa!==pb) return pa-pb
				return a.id-b.id
			})
			.slice(0,4)
		moreGrid.innerHTML = more.map(cardHTML).join('')
		ensureBadges(moreGrid)
		bindRoteiroToggles(moreGrid)
	}
}