(function(){
	if('scrollRestoration' in history) history.scrollRestoration='manual';
	window.scrollTo(0,0);
	window.addEventListener('load',function(){ window.scrollTo(0,0); });
	window.addEventListener('pageshow',function(e){ if(e.persisted) window.scrollTo(0,0); });

	const grid=document.getElementById('rlistGrid');
	const pager=document.getElementById('rlistPager');
	const filter=document.getElementById('rlistFilter');
	const selectWrap=document.querySelector('.select-wrap');
	if(!grid||!pager) return;

	const cardsAll=[...grid.querySelectorAll('.roteiro-card')];

	cardsAll.forEach(card=>{
		const level=(card.dataset.intensidade||'').toLowerCase();
		const slot=card.querySelector('.roteiro-card-img');
		if(!slot||slot.querySelector('.intensity-badge')) return;
		const text=level==='intenso'?'INTENSO':level==='moderado'?'MODERADO':'LEVE';
		const badge=document.createElement('span');
		badge.className='intensity-badge intensity-'+(level||'leve');
		badge.innerHTML='<img src="img/icons/intensidade-icon.png" alt=""><span>'+text+'</span>';
		slot.insertBefore(badge,slot.firstChild);
	});

	const PER_PAGE=9;
	let active=cardsAll;
	let page=1;

	function totalPages(){ return Math.max(1, Math.ceil(active.length/PER_PAGE)); }
	function clamp(n,min,max){ return Math.min(max, Math.max(min,n)); }
	function scrollTopSmooth(){ requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:0,behavior:'smooth'}))); }

	function showPage(p){
		page=clamp(p,1,totalPages());
		cardsAll.forEach(el=>{ el.hidden=true; });
		const start=(page-1)*PER_PAGE;
		const end=start+PER_PAGE;
		active.slice(start,end).forEach(el=>{ el.hidden=false; });
		buildPager();
		const u=new URL(location.href);
		u.searchParams.set('p',String(page));
		history.replaceState(null,'',u);
		scrollTopSmooth();
	}

	function numBtn(n){
		const b=document.createElement('button');
		b.className='rt-btn rt-num';
		b.textContent=String(n);
		b.type='button';
		if(n===page) b.setAttribute('aria-current','page');
		b.addEventListener('click',()=>showPage(n));
		return b;
	}

	function ctrl(dir,disabled){
		const b=document.createElement('button');
		b.className='rt-btn '+(dir<0?'rt-prev':'rt-next');
		b.type='button';
		b.setAttribute('aria-label',dir<0?'Anterior':'Próxima');
		b.innerHTML='<i class="bx bx-chevron-'+(dir<0?'left':'right')+'" aria-hidden="true"></i>';
		b.disabled=!!disabled;
		b.addEventListener('click',()=>showPage(page+dir));
		return b;
	}

	function dots(){
		const s=document.createElement('span');
		s.className='rt-ellipsis';
		s.textContent='...';
		return s;
	}

	function buildPager(){
		pager.innerHTML='';
		const total=totalPages();
		if(total<=1) return;
		pager.appendChild(ctrl(-1,page<=1));
		if(total<=7){
			for(let i=1;i<=total;i++) pager.appendChild(numBtn(i));
		}else{
			if(page<=4){
				for(let i=1;i<=5;i++) pager.appendChild(numBtn(i));
				pager.appendChild(dots());
				pager.appendChild(numBtn(total));
			}else if(page>=total-3){
				pager.appendChild(numBtn(1));
				pager.appendChild(dots());
				for(let i=total-4;i<=total;i++) pager.appendChild(numBtn(i));
			}else{
				pager.appendChild(numBtn(1));
				pager.appendChild(dots());
				for(let i=page-1;i<=page+1;i++) pager.appendChild(numBtn(i));
				pager.appendChild(dots());
				pager.appendChild(numBtn(total));
			}
		}
		pager.appendChild(ctrl(+1,page>=total));
	}

	function setFilter(val){
		const v=(val||'todos').toLowerCase();
		active=v==='todos'?cardsAll:cardsAll.filter(c=>(c.dataset.intensidade||'').toLowerCase()===v);
		const u=new URL(location.href);
		if(v==='todos') u.searchParams.delete('i'); else u.searchParams.set('i',v);
		u.searchParams.set('p','1');
		history.replaceState(null,'',u);
		showPage(1);
	}

	function init(){
		const url=new URL(location.href);
		const i=(url.searchParams.get('i')||'todos').toLowerCase();
		const p=parseInt(url.searchParams.get('p')||'1',10);
		if(filter) filter.value=(i==='leve'||i==='moderado'||i==='intenso')?i:'todos';
		active=(i==='leve'||i==='moderado'||i==='intenso')?cardsAll.filter(c=>(c.dataset.intensidade||'').toLowerCase()===i):cardsAll;
		showPage(isNaN(p)?1:p);
	}

	if(filter){
		filter.addEventListener('change',function(){ setFilter(this.value); });
	}

	if(filter&&selectWrap){
		filter.addEventListener('focus',function(){ selectWrap.classList.add('is-open'); });
		filter.addEventListener('blur',function(){ selectWrap.classList.remove('is-open'); });
		filter.addEventListener('mousedown',function(){ selectWrap.classList.add('is-open'); });
		filter.addEventListener('change',function(){ setTimeout(function(){ selectWrap.classList.remove('is-open'); },0); });
	}

	window.addEventListener('keydown',e=>{
		if(e.key==='ArrowLeft') showPage(page-1);
		if(e.key==='ArrowRight') showPage(page+1);
	});

	init();
})();