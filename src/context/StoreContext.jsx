import { createContext, useContext, useEffect, useMemo, useReducer, useState, useCallback } from 'react'
import { loadLS, saveLS, uid } from '../lib/utils'
import { COUPONS, FREE_SHIP_ABOVE, SHIPPING_FEE, COD_FEE } from '../data/content'

const StoreContext = createContext(null)

const initial = () => ({
  cart: loadLS('krida.cart', []),
  wishlist: loadLS('krida.wishlist', []),
  user: loadLS('krida.user', null),
  users: loadLS('krida.users', []),
  orders: loadLS('krida.orders', []),
  addresses: loadLS('krida.addresses', []),
  coupon: loadLS('krida.coupon', null),
  recent: loadLS('krida.recent', []),
})

const lineKey = (slug, color, size) => `${slug}__${color || '-'}__${size || '-'}`

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const { product, color, size, qty = 1 } = action
      const key = lineKey(product.slug, color, size)
      const existing = state.cart.find((l) => l.key === key)
      const cart = existing
        ? state.cart.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + qty) } : l))
        : [
            ...state.cart,
            {
              key,
              slug: product.slug,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              image: product.colors.find((c) => c.name === color)?.image || product.image,
              color,
              size,
              qty,
            },
          ]
      return { ...state, cart }
    }
    case 'SET_QTY':
      return { ...state, cart: state.cart.map((l) => (l.key === action.key ? { ...l, qty: Math.max(1, Math.min(10, action.qty)) } : l)) }
    case 'REMOVE':
      return { ...state, cart: state.cart.filter((l) => l.key !== action.key) }
    case 'CLEAR_CART':
      return { ...state, cart: [], coupon: null }
    case 'TOGGLE_WISH':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.slug) ? state.wishlist.filter((s) => s !== action.slug) : [action.slug, ...state.wishlist],
      }
    case 'SET_COUPON':
      return { ...state, coupon: action.code }
    case 'LOGIN':
      return { ...state, user: action.user }
    case 'REGISTER':
      return { ...state, users: [...state.users, action.user], user: action.user }
    case 'UPDATE_USER': {
      const user = { ...state.user, ...action.patch }
      return { ...state, user, users: state.users.map((u) => (u.email === user.email ? user : u)) }
    }
    case 'LOGOUT':
      return { ...state, user: null }
    case 'ADD_ADDRESS':
      return { ...state, addresses: [action.address, ...state.addresses] }
    case 'REMOVE_ADDRESS':
      return { ...state, addresses: state.addresses.filter((a) => a.id !== action.id) }
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [], coupon: null }
    case 'VIEWED':
      return { ...state, recent: [action.slug, ...state.recent.filter((s) => s !== action.slug)].slice(0, 12) }
    default:
      return state
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial)
  const [toasts, setToasts] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => saveLS('krida.cart', state.cart), [state.cart])
  useEffect(() => saveLS('krida.wishlist', state.wishlist), [state.wishlist])
  useEffect(() => saveLS('krida.user', state.user), [state.user])
  useEffect(() => saveLS('krida.users', state.users), [state.users])
  useEffect(() => saveLS('krida.orders', state.orders), [state.orders])
  useEffect(() => saveLS('krida.addresses', state.addresses), [state.addresses])
  useEffect(() => saveLS('krida.coupon', state.coupon), [state.coupon])
  useEffect(() => saveLS('krida.recent', state.recent), [state.recent])

  const toast = useCallback((message, opts = {}) => {
    const id = uid()
    setToasts((t) => [...t, { id, message, ...opts }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), opts.duration || 2800)
  }, [])

  const totals = useMemo(() => {
    const subtotal = state.cart.reduce((a, l) => a + l.price * l.qty, 0)
    const mrpTotal = state.cart.reduce((a, l) => a + (l.mrp || l.price) * l.qty, 0)
    const count = state.cart.reduce((a, l) => a + l.qty, 0)
    let discount = 0
    let couponError = null
    if (state.coupon) {
      const c = COUPONS[state.coupon]
      if (!c) couponError = 'Invalid coupon'
      else if (subtotal < c.min) couponError = `Add ${'₹' + (c.min - subtotal).toLocaleString('en-IN')} more to use ${state.coupon}`
      else discount = c.type === 'pct' ? Math.round((subtotal * c.value) / 100) : c.value
    }
    const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIP_ABOVE ? 0 : SHIPPING_FEE
    return { subtotal, mrpTotal, count, discount, couponError, shipping, total: subtotal - discount + shipping, savings: mrpTotal - subtotal + discount }
  }, [state.cart, state.coupon])

  const api = useMemo(
    () => ({
      ...state,
      totals,
      toasts,
      cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
      toast,
      addToCart(product, color, size, qty = 1, { open = true } = {}) {
        dispatch({ type: 'ADD', product, color, size, qty })
        if (open) setCartOpen(true)
        else toast(`${product.name} added to bag`)
      },
      setQty: (key, qty) => dispatch({ type: 'SET_QTY', key, qty }),
      removeLine: (key) => dispatch({ type: 'REMOVE', key }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
      toggleWish(slug, name) {
        const wasIn = state.wishlist.includes(slug)
        dispatch({ type: 'TOGGLE_WISH', slug })
        toast(wasIn ? 'Removed from wishlist' : `${name || 'Item'} saved to wishlist`)
      },
      isWished: (slug) => state.wishlist.includes(slug),
      applyCoupon(code) {
        const c = code.trim().toUpperCase()
        if (!c) return dispatch({ type: 'SET_COUPON', code: null })
        if (!COUPONS[c]) {
          toast('That coupon code is not valid', { tone: 'error' })
          return false
        }
        dispatch({ type: 'SET_COUPON', code: c })
        toast(`Coupon ${c} applied`)
        return true
      },
      removeCoupon: () => dispatch({ type: 'SET_COUPON', code: null }),
      login(email, password) {
        const u = state.users.find((x) => x.email.toLowerCase() === email.toLowerCase())
        if (!u || u.password !== password) return 'Incorrect email or password'
        dispatch({ type: 'LOGIN', user: u })
        toast(`Welcome back, ${u.name.split(' ')[0]}`)
        return null
      },
      register(name, email, password, phone) {
        if (state.users.some((x) => x.email.toLowerCase() === email.toLowerCase())) return 'An account with this email already exists'
        const user = { name, email, password, phone, createdAt: Date.now() }
        dispatch({ type: 'REGISTER', user })
        toast(`Account created. Welcome, ${name.split(' ')[0]}!`)
        return null
      },
      updateUser: (patch) => dispatch({ type: 'UPDATE_USER', patch }),
      logout() {
        dispatch({ type: 'LOGOUT' })
        toast('You have been logged out')
      },
      addAddress: (address) => dispatch({ type: 'ADD_ADDRESS', address: { id: uid(), ...address } }),
      removeAddress: (id) => dispatch({ type: 'REMOVE_ADDRESS', id }),
      placeOrder({ address, payment }) {
        const codFee = payment === 'cod' ? COD_FEE : 0
        const order = {
          id: 'TYK' + Date.now().toString().slice(-8),
          placedAt: Date.now(),
          items: state.cart,
          address,
          payment,
          coupon: totals.discount ? state.coupon : null,
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          codFee,
          total: totals.total + codFee,
          status: 'Placed',
          email: state.user?.email || address.email,
        }
        dispatch({ type: 'PLACE_ORDER', order })
        return order
      },
      markViewed: (slug) => dispatch({ type: 'VIEWED', slug }),
    }),
    [state, totals, toasts, cartOpen, searchOpen, menuOpen, toast]
  )

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}

export const useStore = () => useContext(StoreContext)
