# KRIDA Store – React e-commerce (sportswear, inspired by tyka.com but with its own brand & layout)

Performance sportswear store: Men · Women · Cricket · Accessories.
280 real products (names, prices, colours, sizes, images) pulled from TYKA's public catalogue.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

## What works

- Home: typographic hero with product collage + marquee, bento category grid, new arrivals rail, shop-by-sport cards, trending tabs, dark "featured drop" section, promo cards, reviews, newsletter
- Mega menu (desktop) + drawer menu (mobile), search overlay (Ctrl/Cmd + K) with live results
- Listing pages: `/shop`, `/c/men`, `/c/men/polos`, `/sport/running`, `/new`, `/sale`, `/search?q=…`
  - filters (sub-category, price, colour, size) kept in the URL, sorting, load more, mobile filter drawer
- Product page: gallery with hover zoom, colour swatches switch photos, size picker + size guide, qty, add to bag, buy now, wishlist, pincode check, details accordion, reviews, related products, sticky mobile buy bar
- Quick add from any product card
- Bag drawer + bag page, coupons (`KRIDA10`, `FLAT200`, `WELCOME15`), free-shipping progress
- Checkout: address book with validation, UPI / card / COD (demo, no real payment), order summary
- Order confirmation, account area (overview, orders with tracking timeline, addresses, wishlist), login / signup
- About, Contact, FAQ, Size guide, Shipping/Returns, Privacy, Terms, 404

Cart, wishlist, user, addresses and orders persist in `localStorage` (demo – no backend). Coupons: `KRIDA10`, `FLAT200`, `WELCOME15`.

## Structure

```
src/
  data/       products.json, menu.json, content.js (banners, FAQs, policies, coupons)
  lib/        catalog.js (querying/filtering), utils.js
  context/    StoreContext.jsx (cart, wishlist, auth, orders, toasts)
  components/ Header, Footer, ProductCard, QuickAdd, CartDrawer, SearchOverlay, Shared, Icons
  pages/      Home, Listing, Product, Cart, Checkout, OrderSuccess, Account, Auth, Static
  styles/     global.css (design tokens + all component styles)
```

Product catalogue (280 items) and images are pulled from TYKA's public catalogue for the demo; swap `image` / `gallery` URLs in `products.json` for your own.
