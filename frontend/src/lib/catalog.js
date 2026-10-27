import { getProducts, getMenu } from './db'

const SUB_PARENT_MAP = {
  'sublimation-jerseys': 'jerseys',
  'football-jerseys': 'jerseys',
  'cricket-jerseys': 'jerseys',
  'polo-tshirts': 'tshirts',
  'round-neck-tees': 'tshirts',
  'sleeveless-tees': 'tshirts',
  'tracksuits': 'teamwear',
  'track-jackets': 'teamwear',
  'hoodies': 'teamwear',
  'lowers': 'teamwear',
  'shorts': 'teamwear',
  'kit-bags': 'accessories',
  'caps': 'accessories',
  'bottles': 'accessories',
}

// Live catalogue: base data in src/data, overridden by anything saved from the admin panel.
export function getCatalogProducts() {
  const rawProducts = getProducts()
  return rawProducts.map((p) => {
    const cats = new Set(p.categories || [])
    for (const s of (p.subs || [])) {
      if (SUB_PARENT_MAP[s]) cats.add(SUB_PARENT_MAP[s])
    }
    return {
      ...p,
      categories: Array.from(cats),
      sizes: (p.sizes || []).filter((s) => s !== 'UN'),
      gallery: (p.gallery || [p.image]).slice(0, 6)
    }
  })
}

export const getProduct = (slug) => {
  const prods = getCatalogProducts()
  return prods.find((p) => p.slug === slug)
}

export const PRODUCTS = new Proxy([], {
  get(target, prop) {
    const prods = getCatalogProducts()
    if (prop === 'length') return prods.length
    if (prop === Symbol.iterator) return prods[Symbol.iterator].bind(prods)
    if (typeof prods[prop] === 'function') return prods[prop].bind(prods)
    return prods[prop]
  }
})

export const MENU = new Proxy([], {
  get(target, prop) {
    const m = getMenu()
    if (prop === 'length') return m.length
    if (prop === Symbol.iterator) return m[Symbol.iterator].bind(m)
    if (typeof m[prop] === 'function') return m[prop].bind(m)
    return m[prop]
  }
})

export const CATEGORY_META = {
  jerseys: { name: 'Jerseys', tagline: 'Full sublimation, your design' },
  tshirts: { name: 'T-Shirts & Polos', tagline: 'Dry-fit tops for team and office' },
  teamwear: { name: 'Teamwear', tagline: 'Tracksuits, hoodies and lowers' },
  accessories: { name: 'Accessories', tagline: 'Bags, caps and bottles' },
}

export function subMeta(subSlug) {
  const menu = getMenu()
  for (const cat of menu)
    for (const g of cat.groups)
      for (const it of g.items)
        if (it.slug === subSlug) return { ...it, category: cat.slug, categoryName: cat.name, group: g.name }
  return null
}

export function subsForCategory(catSlug) {
  const menu = getMenu()
  const cat = menu.find((c) => c.slug === catSlug)
  if (!cat) return []
  return cat.groups.flatMap((g) =>
    g.items.map((i) => ({
      ...i,
      count: queryProducts({ category: catSlug, sub: i.slug }).length,
    })).filter((i) => i.count > 0)
  )
}

const pct = (p) => (p.mrp && p.mrp > p.price ? (p.mrp - p.price) / p.mrp : 0)

export function queryProducts({ category, sub, q, colors = [], sizes = [], minPrice, maxPrice, sort = 'popular', onlyNew, onlySale } = {}) {
  let list = getCatalogProducts()
  if (sub) {
    list = list.filter((p) => p.subs && p.subs.includes(sub))
  } else if (category) {
    list = list.filter((p) => p.categories && p.categories.includes(category))
  }
  if (onlyNew) list = list.filter((p) => p.isNew)
  if (onlySale) list = list.filter((p) => p.mrp && p.mrp > p.price)
  if (q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean)
    list = list.filter((p) => {
      const hay = (p.name + ' ' + p.subs.join(' ') + ' ' + p.categories.join(' ') + ' ' + (p.description || '')).toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
  }
  if (colors.length) list = list.filter((p) => p.colors.some((c) => colors.includes(colorFamily(c.name))))
  if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)))
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice)
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice)

  const sorters = {
    popular: (a, b) => b.rating * Math.log(b.reviews + 1) - a.rating * Math.log(a.reviews + 1),
    newest: (a, b) => b.id - a.id,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    discount: (a, b) => pct(b) - pct(a),
  }
  return [...list].sort(sorters[sort] || sorters.popular)
}

// Collapse the many named colours into a few filterable families
export function colorFamily(name = '') {
  const n = name.toLowerCase()
  if (/black|charcoal|dark grey/.test(n)) return 'Black'
  if (/white|off ?white|beige|cream/.test(n)) return 'White'
  if (/grey|gray|melange|silver/.test(n)) return 'Grey'
  if (/navy|ink|air ?force|english/.test(n)) return 'Navy'
  if (/blue|royal|cyan|teal|sky|scuba|seige|smoky|indian/.test(n)) return 'Blue'
  if (/red|maroon|marron|wine|corel|coral|carnation/.test(n)) return 'Red'
  if (/green|olive|neon/.test(n)) return 'Green'
  if (/orange|yellow|gold|floro/.test(n)) return 'Orange'
  if (/purple|lilac|pink|violet/.test(n)) return 'Purple'
  return 'Other'
}
export const COLOR_FAMILIES = [
  ['Black', '#111'], ['White', '#f4f4f4'], ['Grey', '#8a8f98'], ['Navy', '#293e66'], ['Blue', '#3a62ab'],
  ['Red', '#e0313f'], ['Green', '#2e8b3d'], ['Orange', '#f58941'], ['Purple', '#8a63c9'], ['Other', '#c9a27e'],
]

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
export function sortSizes(sizes) {
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a), ib = SIZE_ORDER.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
    return a.localeCompare(b, undefined, { numeric: true })
  })
}

export function facets(list) {
  const sizes = new Set(), colors = new Set()
  let min = Infinity, max = 0
  for (const p of list) {
    p.sizes.forEach((s) => sizes.add(s))
    p.colors.forEach((c) => colors.add(colorFamily(c.name)))
    min = Math.min(min, p.price); max = Math.max(max, p.price)
  }
  return { sizes: sortSizes(sizes), colors: COLOR_FAMILIES.filter(([n]) => colors.has(n)), min: min === Infinity ? 0 : min, max }
}

export const related = (p, n = 8) => {
  const prods = getCatalogProducts()
  const same = prods.filter((x) => x.slug !== p.slug && x.subs.some((s) => p.subs.includes(s)))
  const pool = same.length >= n ? same : [...same, ...prods.filter((x) => x.slug !== p.slug && !same.includes(x) && x.categories.some((c) => p.categories.includes(c)))]
  return pool.slice(0, n)
}

export const newArrivals = (n = 12) => getCatalogProducts().filter((p) => p.isNew).sort((a, b) => b.id - a.id).slice(0, n)
export const bestSellers = (n = 8) => queryProducts({ sort: 'popular' }).slice(0, n)
export const onSale = (n = 8) => queryProducts({ onlySale: true, sort: 'discount' }).slice(0, n)

// Export products alias for backward compatibility
export const products = PRODUCTS

// Which size-chart applies to a product
export function sizeChartKey(p) {
  if (/lower|pant|trouser|shorts|jogger|bottom/i.test(p.name)) return 'bottoms'
  return 'tops'
}
