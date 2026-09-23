# Rishikar Sports — e-commerce site (React + Vite)

Sportswear manufacturing store for **Rishikar Sports**, Chapra, Bihar.
Custom jerseys, tracksuits, hoodies, polos, tees and kit bags — team kits from 11 pieces.

> Demo build: catalogue and orders are local (no backend). Product photos are cropped from the
> brand flyer — swap them in `public/products/` when real shoot images are ready.

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the build
```

## What's in it

- **Home** — typographic hero with product collage, marquee, USP strip, bento category grid,
  "we manufacture" cards, best sellers with tabs, dark custom-kit section, 4-step process,
  promo cards, offers rail, reviews, newsletter
- **Catalogue** — 22 products across Jerseys · T-Shirts & Polos · Teamwear · Accessories,
  with colour and size variants
- **Listing pages** — `/shop`, `/c/jerseys`, `/c/teamwear/tracksuits`, `/sale`, `/search?q=…`
  with URL-based filters (sub-category, price, colour, size), sorting and load-more
- **Product page** — gallery with zoom, colour swatches, size picker + size guide, qty,
  add to bag, buy now, wishlist, pincode check, details accordion, reviews, related products
- **Custom Kits page** (`/custom`) — process steps, what's included, bulk enquiry form that can
  hand off to WhatsApp with the enquiry pre-filled
- **Cart & checkout** — bag drawer, coupons (`RS10`, `TEAM500`, `WELCOME15`), free-shipping
  progress, address book with validation, UPI / card / COD (demo — no real payment)
- **Account** — order confirmation, orders with tracking timeline, addresses, profile, wishlist
- **Static** — About, Contact (real address, phone, email), FAQ, Size guide, policies, 404
- Floating WhatsApp button wired to the business number

- **Admin panel** (`/admin`, PIN **1234**) — dashboard with revenue chart and stats, order
  management with status updates, product CRUD with inline price/stock editing, bulk-quote
  enquiries with follow-up status, customers, and settings for contact details, shipping
  rules, coupons and the admin PIN

Cart, wishlist, user, addresses, orders, enquiries and admin edits persist in `localStorage`.

## Structure

```
public/
  logo.png              brand mark used in header, footer and favicon
  products/             product photos (jersey, polo, jacket, hoodie, pants, shorts, bag, cap, bottle)
src/
  data/       products.json, menu.json, content.js (brand, hero, FAQs, policies, coupons)
  lib/        db.js (local data store shared with the admin), catalog.js, utils.js
  context/    StoreContext.jsx (cart, wishlist, auth, orders, toasts)
  components/ Header, Footer, ProductCard, QuickAdd, CartDrawer, SearchOverlay, Shared, Icons
  pages/      Home, Listing, Product, Cart, Checkout, OrderSuccess, Account, Auth, Static, Admin
  styles/     global.css (design tokens + storefront), admin.css
```

## Changing content

| What | Where |
|---|---|
| Phone, email, address, MOQ | `BRAND` in `src/data/content.js` |
| Hero text, banners, FAQs, policies, coupons | `src/data/content.js` |
| Products, prices, colours, sizes | `src/data/products.json` |
| Menu and sub-categories | `src/data/menu.json` |
| Colours and typography | `:root` tokens at the top of `src/styles/global.css` |

Most of the above can also be changed from the admin panel at `/admin` without touching code —
those edits are saved per browser. "Reset catalogue" in Settings restores the shipped products.
