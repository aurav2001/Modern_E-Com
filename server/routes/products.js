import { Router } from 'express'
import { db } from '../db.js'

export const productRouter = Router()

// GET /api/products - List products with search, category & sorting
productRouter.get('/', (req, res) => {
  try {
    let list = db.getProducts()
    const { category, sub, q, sort, minPrice, maxPrice, inStock } = req.query

    if (category) {
      list = list.filter((p) => p.categories && p.categories.includes(category))
    }
    if (sub) {
      list = list.filter((p) => p.subs && p.subs.includes(sub))
    }
    if (q) {
      const query = q.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.description && p.description.toLowerCase().includes(query)) ||
          (p.fabric && p.fabric.toLowerCase().includes(query)) ||
          (p.categories && p.categories.some((c) => c.toLowerCase().includes(query)))
      )
    }
    if (minPrice) {
      list = list.filter((p) => p.price >= Number(minPrice))
    }
    if (maxPrice) {
      list = list.filter((p) => p.price <= Number(maxPrice))
    }
    if (inStock === 'true') {
      list = list.filter((p) => p.stock > 0)
    }

    if (sort === 'price-asc') {
      list.sort((a, b) => a.price - b.price)
    } else if (sort === 'price-desc') {
      list.sort((a, b) => b.price - a.price)
    } else if (sort === 'rating') {
      list.sort((a, b) => b.rating - a.rating)
    } else if (sort === 'popular') {
      list.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
    }

    res.json({
      success: true,
      total: list.length,
      data: list,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/products/:slugOrId - Single product
productRouter.get('/:slugOrId', (req, res) => {
  try {
    const list = db.getProducts()
    const { slugOrId } = req.params
    const product = list.find((p) => p.slug === slugOrId || String(p.id) === slugOrId)

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }
    res.json({ success: true, data: product })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/products - Create new product (Admin)
productRouter.post('/', (req, res) => {
  try {
    const list = db.getProducts()
    const { name, slug, price, mrp, image, gallery, colors, sizes, categories, subs, fabricOptions, fabric, description, stock } = req.body

    if (!name || !price) {
      return res.status(400).json({ success: false, message: 'Name and price are required' })
    }

    const newSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const maxId = list.reduce((max, p) => Math.max(max, p.id || 0), 1000)

    const newProduct = {
      id: maxId + 1,
      name,
      slug: newSlug,
      price: Number(price),
      mrp: mrp ? Number(mrp) : Math.round(Number(price) * 1.5),
      image: image || '/products/rs/rs-prod-01.jpg',
      gallery: gallery || [image || '/products/rs/rs-prod-01.jpg'],
      colors: colors || [{ name: 'Standard', hex: '#1e40af' }],
      sizes: sizes || ['S', 'M', 'L', 'XL', 'XXL'],
      categories: categories || ['jerseys'],
      subs: subs || ['sublimation'],
      fabricOptions: fabricOptions || [{ name: 'Superpoly', rate: Number(price) }],
      fabric: fabric || '100% Polyester Performance Knit',
      description: description || `${name} by Rishikar Sports.`,
      features: req.body.features || ['Premium Sublimation', 'Breathable & Quick Dry', 'Custom Team Print Available'],
      stock: stock !== undefined ? Number(stock) : 100,
      rating: 4.8,
      reviews: 12,
      isNew: true,
      featured: Boolean(req.body.featured),
      createdAt: new Date().toISOString(),
    }

    list.unshift(newProduct)
    db.saveProducts(list)

    res.status(201).json({ success: true, message: 'Product created', data: newProduct })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// PUT /api/products/:slugOrId - Update product
productRouter.put('/:slugOrId', (req, res) => {
  try {
    const list = db.getProducts()
    const { slugOrId } = req.params
    const index = list.findIndex((p) => p.slug === slugOrId || String(p.id) === slugOrId)

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const updated = {
      ...list[index],
      ...req.body,
      id: list[index].id, // preserve id
      price: req.body.price !== undefined ? Number(req.body.price) : list[index].price,
      mrp: req.body.mrp !== undefined ? Number(req.body.mrp) : list[index].mrp,
      stock: req.body.stock !== undefined ? Number(req.body.stock) : list[index].stock,
    }

    list[index] = updated
    db.saveProducts(list)

    res.json({ success: true, message: 'Product updated successfully', data: updated })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// DELETE /api/products/:slugOrId - Delete product
productRouter.delete('/:slugOrId', (req, res) => {
  try {
    let list = db.getProducts()
    const { slugOrId } = req.params
    const exists = list.some((p) => p.slug === slugOrId || String(p.id) === slugOrId)

    if (!exists) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    list = list.filter((p) => p.slug !== slugOrId && String(p.id) !== slugOrId)
    db.saveProducts(list)

    res.json({ success: true, message: 'Product deleted' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})
