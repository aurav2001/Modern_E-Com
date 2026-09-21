import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StoreProvider } from './context/StoreContext'
import Header, { MobileNav } from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import SearchOverlay from './components/SearchOverlay'
import { ScrollToTop, Toasts } from './components/Shared'
import Home from './pages/Home'
import Listing from './pages/Listing'
import Product from './pages/Product'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import Account from './pages/Account'
import { Login, Signup } from './pages/Auth'
import { Wishlist, About, Contact, FAQ, SizeChartPage, Policy, NotFound } from './pages/Static'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StoreProvider>
        <ScrollToTop />
        <Header />
        <MobileNav />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Listing />} />
            <Route path="/new" element={<Listing mode="new" />} />
            <Route path="/sale" element={<Listing mode="sale" />} />
            <Route path="/search" element={<Listing />} />
            <Route path="/c/:cat" element={<Listing />} />
            <Route path="/c/:cat/:sub" element={<Listing />} />
            <Route path="/sport/:sport" element={<Listing />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order/:id" element={<OrderSuccess />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/account" element={<Account />} />
            <Route path="/account/:tab" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/size-chart" element={<SizeChartPage />} />
            <Route path="/policies/:slug" element={<Policy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <Toasts />
      </StoreProvider>
    </BrowserRouter>
  )
}
