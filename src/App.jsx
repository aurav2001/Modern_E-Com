import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import Header, { MobileNav } from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import SearchOverlay from './components/SearchOverlay'
import { ScrollToTop, Toasts } from './components/Shared'
import { WhatsApp } from './components/Icons'
import { getSettings } from './lib/db'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Account from './pages/Account'
import Admin from './pages/Admin'
import { Login, Signup } from './pages/Auth'
import { Wishlist, About, Contact, FAQ, SizeChartPage, Policy, NotFound, CustomKits } from './pages/Static'
import RateList from './pages/RateList'

const waHref = () => {
  const wa = getSettings().phoneIntl.replace('+', '')
  return `https://wa.me/${wa}?text=${encodeURIComponent('Hi Rishikar Sports, I want to enquire about a team kit.')}`
}

function Shell() {
  // the admin panel has its own chrome — no storefront header, footer or floating button
  const isAdmin = useLocation().pathname.startsWith('/admin')
  return (
    <>
      <ScrollToTop />
      {!isAdmin && <Header />}
      {!isAdmin && <MobileNav />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Listing />} />
          <Route path="/new" element={<Listing mode="new" />} />
          <Route path="/sale" element={<Listing mode="sale" />} />
          <Route path="/search" element={<Listing />} />
          <Route path="/c/:cat" element={<Listing />} />
          <Route path="/c/:cat/:sub" element={<Listing />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:id" element={<OrderSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/account" element={<Account />} />
          <Route path="/account/:tab" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:tab" element={<Admin />} />
          <Route path="/custom" element={<CustomKits />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/size-chart" element={<SizeChartPage />} />
          <Route path="/rate-list" element={<RateList />} />
          <Route path="/policies/:slug" element={<Policy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAdmin && <Footer />}
      {!isAdmin && <CartDrawer />}
      {!isAdmin && <SearchOverlay />}
      <Toasts />
      {!isAdmin && (
        <a className="wa" href={waHref()} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <WhatsApp /> WhatsApp
        </a>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </BrowserRouter>
  )
}
