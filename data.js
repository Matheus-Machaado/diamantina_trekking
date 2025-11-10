const DATA_URL='./roteiros.json'
let __CACHE__=null

export async function loadRoteiros(){
	if(__CACHE__)return __CACHE__
	const res=await fetch(DATA_URL,{cache:'no-store'})
	if(!res.ok)throw new Error('Não foi possível carregar roteiros.json')
	const data=await res.json()
	const list=Array.isArray(data.roteiros)?data.roteiros:[]
	__CACHE__=list.map(normalize).sort((a,b)=>a.id-b.id)
	return __CACHE__
}

function normalize(r){
	const nivel=String(r.nivel||'').toLowerCase()
	const duracao=r.duracao||'1 Dia'
	return{
		id:Number(r.id),
		titulo:String(r.titulo||'').trim(),
		nivel:nivel==='moderado'||nivel==='intenso'?nivel:'leve',
		valor:Number(r.valor_por_pessoa??r.valor??0),
		duracao,
		dias:typeof r.dias==='number'?r.dias:guessDays(duracao),
		preview:String(r.preview||'').trim(),
		descricao:String(r.descricao||'').trim(),
		imagens:Array.isArray(r.imagens)?r.imagens:[],
		paginaPrincipal:!!(r['pagina-principal']??r.pagina_principal),
		destaque:!!r.destaque,
		descricaoDestaque:String(r['descricao-destaque']??r.descricao_destaque??'').trim()
	}
}

function guessDays(txt){
	if(!txt)return 1
	if(/meio/i.test(txt))return 1
	const m=String(txt).match(/(\d+)/)
	return m?Math.max(1,parseInt(m[1],10)||1):1
}

function fmtBRL(v){
	return(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})
}

function esc(s){
	return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}

function cardHTML(r){
	const capa=r.imagens[0]||'img/roteiros/pai-inacio/imagem-1.png'
	return`
	<article class="roteiro-card" data-intensidade="${esc(r.nivel)}">
		<div class="roteiro-card-img">
			<img src="${esc(capa)}" alt="${esc(r.titulo)}">
		</div>
		<div class="roteiro-card-body">
			<h3 class="roteiro-card-title">${esc(r.titulo)}</h3>
			<div class="roteiro-card-line" tabindex="0">
				<span>Sobre o Roteiro</span>
				<button class="roteiro-toggle" type="button" aria-expanded="false" aria-label="Mostrar descrição">
					<i class="bx bx-plus" aria-hidden="true"></i>
				</button>
			</div>
			<p class="roteiro-desc">${esc(r.preview)}</p>
			<div class="roteiro-meta">
				<span class="roteiro-meta-left"><i class="bx bxs-bolt" aria-hidden="true"></i>${esc(r.duracao)}</span>
				<span class="roteiro-meta-right"><small>A partir de</small> <b>${fmtBRL(r.valor)}</b></span>
			</div>
			<a href="roteiro-detalhe.html?id=${r.id}" class="btn btn-primary roteiro-btn">Ver Detalhes</a>
		</div>
	</article>`
}

function ensureBadges(scope){
	scope.querySelectorAll('.roteiro-card').forEach(card=>{
		const level=(card.dataset.intensidade||'').toLowerCase()
		const slot=card.querySelector('.roteiro-card-img')
		if(!slot||slot.querySelector('.intensity-badge'))return
		const text=level==='intenso'?'INTENSO':(level==='moderado'?'MODERADO':'LEVE')
		const badge=document.createElement('span')
		badge.className='intensity-badge intensity-'+(level||'leve')
		badge.innerHTML='<img src="img/icons/intensidade-icon.png" alt=""><span>'+text+'</span>'
		slot.insertBefore(badge,slot.firstChild)
	})
}

function flipLayout(container,mutate){
	const els=Array.from(container.children)
	const first=new Map(els.map(el=>[el,el.getBoundingClientRect()]))
	mutate()
	const last=new Map(els.map(el=>[el,el.getBoundingClientRect()]))
	els.forEach(el=>{
		const f=first.get(el)
		const l=last.get(el)
		if(!f||!l)return
		const dx=f.left-l.left
		const dy=f.top-l.top
		if(dx||dy){
			el.style.transform=`translate(${dx}px, ${dy}px)`
			el.style.transition='transform 0s'
			void el.offsetWidth
			el.style.transition='transform 340ms cubic-bezier(.2,.7,.2,1)'
			el.style.transform='translate(0, 0)'
		}
	})
	function cleanup(e){
		if(e.propertyName!=='transform')return
		els.forEach(el=>{
			el.style.transition=''
			el.style.transform=''
		})
		container.removeEventListener('transitionend',cleanup,true)
	}
	container.addEventListener('transitionend',cleanup,true)
}

function toggleCard(card){
	const row=card.querySelector('.roteiro-card-line')
	const btn=card.querySelector('.roteiro-toggle')
	const icon=btn?btn.querySelector('i'):null
	const desc=card.querySelector('.roteiro-desc')
	if(!row||!desc)return
	const container=card.parentElement
	const isOpen=card.classList.contains('is-open')
	if(!isOpen){
		desc.style.height='auto'
		const h=desc.scrollHeight
		desc.style.height='0px'
		void desc.offsetHeight
		const mutate=()=>{
			desc.style.height=h+'px'
			card.classList.add('is-open')
			if(btn)btn.setAttribute('aria-expanded','true')
			if(icon){icon.classList.remove('bx-plus');icon.classList.add('bx-minus')}
		}
		if(container)flipLayout(container,mutate);else mutate()
		const onEnd=function(){
			if(card.classList.contains('is-open'))desc.style.height='auto'
			desc.removeEventListener('transitionend',onEnd)
		}
		desc.addEventListener('transitionend',onEnd)
	}else{
		const h=desc.scrollHeight
		desc.style.height=h+'px'
		void desc.offsetHeight
		const mutate=()=>{
			desc.style.height='0px'
			card.classList.remove('is-open')
			if(btn)btn.setAttribute('aria-expanded','false')
			if(icon){icon.classList.remove('bx-minus');icon.classList.add('bx-plus')}
		}
		if(container)flipLayout(container,mutate);else mutate()
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

export async function hydrateIndex(){
	initCardLineToggle()
	const roteiros=await loadRoteiros()
	const grid=document.querySelector('#roteiros .roteiros-grid')
	if(grid){
		const home=roteiros.filter(r=>r.paginaPrincipal).slice(0,6)
		grid.innerHTML=home.map(cardHTML).join('')
		ensureBadges(grid)
		bindRoteiroToggles(grid)
	}
	const rdSection=document.getElementById('roteiro-destaque')
	if(rdSection){
		const destaque=roteiros.find(r=>r.destaque)||roteiros.find(r=>r.paginaPrincipal)||roteiros[0]
		if(destaque){
			const titleEl=rdSection.querySelector('.rd-title')
			const textEl=rdSection.querySelector('.rd-text')
			const ctaEl=rdSection.querySelector('.rd-cta')
			if(titleEl)titleEl.textContent=destaque.titulo.toUpperCase()
			if(textEl){
				const base=destaque.descricaoDestaque||destaque.preview
				textEl.innerHTML=esc(base)+'<br>Tá esperando o quê pra embarcar nessa?'
			}
			if(ctaEl)ctaEl.setAttribute('href','roteiro-detalhe.html?id='+destaque.id)
			const track=rdSection.querySelector('.rd-track')
			if(track){
				const imgs=destaque.imagens.length?destaque.imagens:['img/roteiros/pai-inacio/imagem-1.png']
				track.innerHTML=imgs.map(src=>`<li class="rd-slide"><img src="${esc(src)}" alt="${esc(destaque.titulo)}"></li>`).join('')
			}
		}
	}
}

export async function hydrateList(){
	initCardLineToggle()
	const roteiros=await loadRoteiros()
	const grid=document.getElementById('rlistGrid')
	if(grid){
		grid.innerHTML=roteiros.map(cardHTML).join('')
		ensureBadges(grid)
		bindRoteiroToggles(grid)
	}
}

export async function hydrateDetail(){
	initCardLineToggle()
	const roteiros=await loadRoteiros()
	const id=Number(new URLSearchParams(location.search).get('id')||0)
	const r=roteiros.find(x=>x.id===id)||roteiros[0]
	if(!r)return
	const root=document.getElementById('rpGrid')
	if(root){
		root.dataset.days=String(r.dias||1)
		root.dataset.price=String(r.valor||0)
		root.dataset.intensidade=r.nivel
	}
	const titleEl=document.querySelector('.rp-title')
	const leadEl=document.querySelector('.rp-lead')
	const daysB=document.querySelector('.rp-days b')
	const priceB=document.querySelector('.rp-price b')
	if(titleEl)titleEl.textContent=r.titulo
	if(leadEl)leadEl.textContent=r.preview
	if(daysB)daysB.textContent=r.duracao
	if(priceB)priceB.textContent=fmtBRL(r.valor)
	const track=document.querySelector('.gal-track')
	if(track){
		const imgs=r.imagens.length?r.imagens:['img/roteiros/pai-inacio/imagem-1.png']
		track.innerHTML=imgs.map(src=>`<div class="gal-slide"><img src="${esc(src)}" alt="${esc(r.titulo)}"></div>`).join('')
	}
	const thumbs=document.querySelector('.gal-thumbs')
	if(thumbs){
		const imgs=r.imagens.length?r.imagens:['img/roteiros/pai-inacio/imagem-1.png']
		thumbs.innerHTML=imgs.map((src,i)=>`<button class="gal-thumb ${i===0?'is-active':''}" type="button"><img src="${esc(src)}" alt="Miniatura ${i+1}"></button>`).join('')
	}
	const preview=document.querySelector('.rp-preview')
	if(preview)preview.textContent=r.preview
	const descInner=document.querySelector('#rpDesc .rp-desc-inner')
	if(descInner){
		const blocks=r.descricao.split(/\n{2,}/).map(p=>`<p>${esc(p)}</p>`).join('')
		descInner.innerHTML=blocks||`<p>${esc(r.preview)}</p>`
	}
	const moreGrid = document.getElementById('carrosselRoteiros');
    if(moreGrid){
        const rank = (n)=>{
            const cur = r.nivel;
            if(cur==='moderado') return n==='moderado'?0:(n==='leve'?1:2);
            if(cur==='leve') return n==='leve'?0:(n==='moderado'?1:2);
            if(cur==='intenso') return n==='intenso'?0:(n==='moderado'?1:2);
            return 3;
        };
        const more = roteiros
            .filter(x=>x.id!==r.id)
            .sort((a,b)=>{
                const pa = rank(a.nivel);
                const pb = rank(b.nivel);
                if(pa!==pb) return pa-pb;
                return a.id-b.id;
            })
            .slice(0,4);
        moreGrid.innerHTML = more.map(cardHTML).join('');
        ensureBadges(moreGrid);
        bindRoteiroToggles(moreGrid);
    }
}