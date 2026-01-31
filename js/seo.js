import * as i18n from './i18n.js';

const BRAND = 'Diamantina Trekking';

const COPY = {
	pt: {
		home: {
			title: `Trilhas na Chapada Diamantina | ${BRAND}`,
			description:
				'Trilhas guiadas, travessias e experiências autênticas na Chapada Diamantina com segurança, guia local e suporte completo. Veja os roteiros.'
		},
		list: {
			title: `Roteiros na Chapada Diamantina | ${BRAND}`,
			description:
				'Confira todos os roteiros: trilhas, cachoeiras e mirantes na Chapada Diamantina. Filtre por intensidade e escolha sua próxima aventura.'
		},
		detail: {
			title: `Roteiro | ${BRAND}`,
			description:
				'Detalhes do roteiro na Chapada Diamantina: duração, intensidade, imagens e valores. Fale conosco e reserve.'
		},
		ogImageAlt: 'Diamantina Trekking — Chapada Diamantina'
	},
	en: {
		home: {
			title: `Guided hikes in Chapada Diamantina | ${BRAND}`,
			description:
				'Guided hikes, crossings and authentic experiences in Chapada Diamantina with safety, local guide and full support. Browse the tours.'
		},
		list: {
			title: `Tours in Chapada Diamantina | ${BRAND}`,
			description:
				'Explore all tours: trails, waterfalls and viewpoints in Chapada Diamantina. Filter by intensity and pick your next adventure.'
		},
		detail: {
			title: `Tour | ${BRAND}`,
			description:
				'Tour details in Chapada Diamantina: duration, intensity, photos and pricing. Contact us and book your experience.'
		},
		ogImageAlt: 'Diamantina Trekking — Chapada Diamantina'
	},
	fr: {
		home: {
			title: `Randonnées guidées à Chapada Diamantina | ${BRAND}`,
			description:
				'Randonnées guidées, traversées et expériences authentiques à Chapada Diamantina, en toute sécurité, avec guide local et assistance complète.'
		},
		list: {
			title: `Itinéraires à Chapada Diamantina | ${BRAND}`,
			description:
				'Découvrez tous les itinéraires : sentiers, cascades et points de vue à Chapada Diamantina. Filtrez par intensité et choisissez votre aventure.'
		},
		detail: {
			title: `Itinéraire | ${BRAND}`,
			description:
				"Détails de l’itinéraire : durée, intensité, photos et tarifs. Contactez-nous et réservez votre expérience."
		},
		ogImageAlt: 'Diamantina Trekking — Chapada Diamantina'
	}
};

function getLangKey() {
	try {
		const l = (typeof i18n?.getLang === 'function' && i18n.getLang()) || '';
		if (l === 'en' || l === 'fr' || l === 'pt') return l;
	} catch (_) {}

	const html = (document.documentElement.getAttribute('lang') || 'pt').toLowerCase();
	if (html.startsWith('en')) return 'en';
	if (html.startsWith('fr')) return 'fr';
	return 'pt';
}

function ogLocale(lang) {
	if (lang === 'en') return 'en_GB';
	if (lang === 'fr') return 'fr_FR';
	return 'pt_BR';
}

function detectPage() {
	if (document.getElementById('rpGrid')) return 'detail';
	if (document.getElementById('rlistGrid')) return 'list';
	return 'home';
}

function absUrl(href) {
	try {
		return new URL(href, location.href).href;
	} catch (_) {
		return href || '';
	}
}

function ensureMeta(attr, key) {
	let el = document.querySelector(`meta[${attr}="${key}"]`);
	if (!el) {
		el = document.createElement('meta');
		el.setAttribute(attr, key);
		document.head.appendChild(el);
	}
	return el;
}

function setMetaName(name, content) {
	const el = ensureMeta('name', name);
	el.setAttribute('content', content || '');
}

function setMetaProp(prop, content) {
	const el = ensureMeta('property', prop);
	el.setAttribute('content', content || '');
}

function ensureLink(rel) {
	let el = document.querySelector(`link[rel="${rel}"]`);
	if (!el) {
		el = document.createElement('link');
		el.setAttribute('rel', rel);
		document.head.appendChild(el);
	}
	return el;
}

function setCanonical(url) {
	const el = ensureLink('canonical');
	el.setAttribute('href', url || '');
}

function stripParams(page, urlStr) {
	let u;
	try {
		u = new URL(urlStr, location.href);
	} catch (_) {
		return urlStr;
	}
	u.hash = '';

	// canonical should avoid duplication by ?lang=... and other params.
	const keep = new URLSearchParams();
	if (page === 'detail') {
		const id = u.searchParams.get('id');
		if (id) keep.set('id', id);
	}
	u.search = keep.toString() ? `?${keep.toString()}` : '';
	return u.href;
}

function ensureJsonLd(id = 'seo-jsonld') {
	let el = document.getElementById(id);
	if (!el) {
		el = document.createElement('script');
		el.type = 'application/ld+json';
		el.id = id;
		document.head.appendChild(el);
	}
	return el;
}

function buildJsonLd(page, title, description, canonicalAbs) {
	const logo = absUrl('img/logo-footer.png');
	const ogImage = absUrl('img/og-image-1200x630.jpg');

	const data = [
		{
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: BRAND,
			logo,
			url: absUrl('index.html')
		},
		{
			'@context': 'https://schema.org',
			'@type': 'WebSite',
			name: BRAND,
			url: absUrl('index.html')
		}
	];

	if (page === 'detail') {
		const priceRaw = Number(document.getElementById('rpGrid')?.dataset?.price || 0);
		const hoursRaw = Number(document.getElementById('rpGrid')?.dataset?.hours || 0);
		const durationIso =
			hoursRaw && Number.isFinite(hoursRaw) && hoursRaw > 0
				? `PT${Math.round(hoursRaw)}H`
				: undefined;

		data.push({
			'@context': 'https://schema.org',
			'@type': 'TouristTrip',
			name: title.replace(/\s*\|\s*.*$/, '').trim(),
			description,
			image: [ogImage],
			offers: priceRaw
				? {
						'@type': 'Offer',
						priceCurrency: 'BRL',
						price: String(priceRaw),
						url: absUrl('index.html')
					}
				: undefined,
			...(durationIso ? { duration: durationIso } : {})
		});
	}

	// Remove undefined fields
	function clean(obj) {
		if (Array.isArray(obj)) return obj.map(clean);
		if (obj && typeof obj === 'object') {
			const out = {};
			for (const [k, v] of Object.entries(obj)) {
				if (v === undefined) continue;
				out[k] = clean(v);
			}
			return out;
		}
		return obj;
	}
	return clean(data);
}

function pickDetailTitleAndDesc(copy) {
	const titleRaw = document.querySelector('.rp-title')?.textContent?.trim() || '';
	const leadRaw = document.querySelector('.rp-lead')?.textContent?.trim() || '';
	const title = titleRaw ? `${titleRaw} | ${BRAND}` : copy.detail.title;
	const description = leadRaw || copy.detail.description;
	return { title, description };
}

function updateSEO(pageHint) {
	const page = pageHint || detectPage();
	const lang = getLangKey();
	const copy = COPY[lang] || COPY.pt;

	let title = copy.home.title;
	let description = copy.home.description;

	if (page === 'list') {
		title = copy.list.title;
		description = copy.list.description;
	} else if (page === 'detail') {
		const picked = pickDetailTitleAndDesc(copy);
		title = picked.title;
		description = picked.description;
	}

	document.title = title;
	setMetaName('description', description);

	const canonicalAbs = stripParams(page, location.href);
	setCanonical(canonicalAbs);

	const ogImgAbs = absUrl('img/og-image-1200x630.jpg');
	const ogAlt = page === 'list' ? 'Roteiros na Chapada Diamantina' : copy.ogImageAlt;

	setMetaProp('og:site_name', BRAND);
	setMetaProp('og:locale', ogLocale(lang));
	setMetaProp('og:type', 'website');
	setMetaProp('og:title', title);
	setMetaProp('og:description', description);
	setMetaProp('og:url', canonicalAbs);
	setMetaProp('og:image', ogImgAbs);
	setMetaProp('og:image:alt', ogAlt);

	setMetaName('twitter:card', 'summary_large_image');
	setMetaName('twitter:title', title);
	setMetaName('twitter:description', description);
	setMetaName('twitter:image', ogImgAbs);

	const jsonLd = buildJsonLd(page, title, description, canonicalAbs);
	const jsonEl = ensureJsonLd();
	jsonEl.textContent = JSON.stringify(jsonLd, null, 2);
}

document.addEventListener('page:rehydrated', (ev) => {
	updateSEO(ev?.detail?.page);
});

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => updateSEO(), { once: true });
} else {
	updateSEO();
}
