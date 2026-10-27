const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  Footer,
  PageNumber,
  NumberFormat,
} = require('../frontend/node_modules/docx');

// Design Tokens & Colors
const NAVY = '0E2140';
const ORANGE = 'F5821F';
const BLUE_ACCENT = '1D4ED8';
const DARK_GRAY = '1E293B';
const BODY_GRAY = '334155';
const MUTED_GRAY = '64748B';
const LIGHT_BG = 'F8FAFC';
const ALT_ROW_BG = 'F1F5F9';
const BORDER_COLOR = 'CBD5E1';
const CALLOUT_BG = 'EFF6FF';
const SUCCESS_BG = 'ECFDF5';

// Helper: Heading 1
function createH1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 28, // 14pt
        color: NAVY,
        font: 'Segoe UI',
      }),
    ],
  });
}

// Helper: Heading 2
function createH2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 23, // 11.5pt
        color: ORANGE,
        font: 'Segoe UI',
      }),
    ],
  });
}

// Helper: Heading 3
function createH3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 21, // 10.5pt
        color: BLUE_ACCENT,
        font: 'Segoe UI',
      }),
    ],
  });
}

// Helper: Regular Paragraph
function createP(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before || 60, after: options.after || 80 },
    alignment: options.align || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: 'Segoe UI',
        size: options.size || 20, // 10pt
        color: options.color || BODY_GRAY,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

// Helper: Bullet Item
function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 50, after: 50 },
    children: [
      ...(boldPrefix
        ? [
            new TextRun({
              text: boldPrefix + ' ',
              bold: true,
              color: NAVY,
              font: 'Segoe UI',
              size: 20,
            }),
          ]
        : []),
      new TextRun({
        text,
        font: 'Segoe UI',
        size: 20,
        color: BODY_GRAY,
      }),
    ],
  });
}

// Helper: Callout Box
function createCallout(title, text, isSuccess = false) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: isSuccess ? '10B981' : BLUE_ACCENT },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: isSuccess ? '10B981' : BLUE_ACCENT },
      left: { style: BorderStyle.SINGLE, size: 4, color: isSuccess ? '10B981' : ORANGE },
      right: { style: BorderStyle.SINGLE, size: 1, color: isSuccess ? '10B981' : BLUE_ACCENT },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: {
              fill: isSuccess ? SUCCESS_BG : CALLOUT_BG,
              type: ShadingType.CLEAR,
            },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    bold: true,
                    size: 21,
                    color: isSuccess ? '065F46' : NAVY,
                    font: 'Segoe UI',
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [
                  new TextRun({
                    text,
                    size: 20,
                    color: isSuccess ? '047857' : BODY_GRAY,
                    font: 'Segoe UI',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// Helper: Multi-column Styled Table
function createTable(rowsData, colWidths = []) {
  const tableRows = rowsData.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    return new TableRow({
      children: row.map((cellText, cellIndex) => {
        const width = colWidths.length > cellIndex ? colWidths[cellIndex] : Math.floor(100 / row.length);
        return new TableCell({
          width: {
            size: width,
            type: WidthType.PERCENTAGE,
          },
          shading: {
            fill: isHeader ? NAVY : rowIndex % 2 === 0 ? LIGHT_BG : 'FFFFFF',
            type: ShadingType.CLEAR,
          },
          margins: { top: 100, bottom: 100, left: 120, right: 120 },
          children: [
            new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader,
                  color: isHeader ? 'FFFFFF' : DARK_GRAY,
                  font: 'Segoe UI',
                  size: isHeader ? 20 : 19,
                }),
              ],
            }),
          ],
        });
      }),
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
    },
    rows: tableRows,
  });
}

async function buildProjectDoc() {
  const children = [];

  // ==========================================
  // TITLE / COVER BANNER
  // ==========================================
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: 'RISHIKAR SPORTS — ECOM-TYKA PLATFORM',
          bold: true,
          size: 34, // 17pt
          color: NAVY,
          font: 'Segoe UI',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 80 },
      children: [
        new TextRun({
          text: 'Complete Project Architecture, Features, Modules & End-to-End Working Documentation',
          bold: true,
          size: 24, // 12pt
          color: ORANGE,
          font: 'Segoe UI',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [
        new TextRun({
          text: 'Author: Antigravity AI Engineering & Gulshan Pandey | Version: 2.4 (Production Ready) | Date: October 2026',
          size: 19,
          color: MUTED_GRAY,
          font: 'Segoe UI',
          italics: true,
        }),
      ],
    })
  );

  // Executive Badge
  children.push(
    createCallout(
      '📌 Document Scope & Purpose',
      'This document provides a comprehensive, 360-degree technical and functional overview of the Rishikar Sports E-Commerce & Custom Teamwear Manufacturing platform. It covers the full technology stack, frontend UI modules, the flagship 3D/Canvas Jersey Customizer, shopping cart & multi-step checkout, Razorpay & COD payment flows, dual-engine database architecture (MySQL + local JSON fallback), complete RESTful API specifications, and admin panel management.'
    )
  );

  // ==========================================
  // CHAPTER 1: PROJECT OVERVIEW & BUSINESS CONTEXT
  // ==========================================
  children.push(createH1('1. Project Overview & Business Domain'));
  children.push(
    createP(
      'Rishikar Sports (code-named Ecom-tyka) is a full-stack, enterprise-grade e-commerce and custom sportswear manufacturing web application engineered for Rishikar Sports, located in Chapra, Saran, Bihar. Unlike typical retail e-commerce stores that resell pre-made items, Rishikar Sports operates its own sublimation printing, cutting, stitching, and finishing manufacturing unit.'
    )
  );

  children.push(createH2('1.1 Key Business Capabilities & Differentiators'));
  children.push(createBullet('Direct factory manufacturing pricing without distributors or middlemen.', 'Factory-Direct Pricing:'));
  children.push(createBullet('Full digital sublimation printing with unlimited vibrant colors, team crests, player names, and numbers that never crack or fade.', 'Sublimation Excellence:'));
  children.push(createBullet('Low Minimum Order Quantity (MOQ) of just 11 pieces for customized team kits, making it accessible to local schools, village clubs, and turf cricket teams.', 'Low MOQ for Teams:'));
  children.push(createBullet('Interactive 2D/3D Canvas Jersey Customizer allowing coaches and captains to visualize team kits, manage 11-player squad rosters, import lists from WhatsApp, and export to Excel.', 'Signature Customizer:'));
  children.push(createBullet('Automated volume-tiered wholesale discounts (15% for 11+ pcs, 22% for 26+ pcs, 30% for 51+ pcs).', 'Dynamic Tiered Discounts:'));
  children.push(createBullet('Transparent public rate list with downloadable Excel specification sheets.', 'Transparent Rate List:'));

  children.push(createH2('1.2 Physical Manufacturing Unit & Contact Metadata'));
  children.push(
    createTable(
      [
        ['Parameter', 'Store Details'],
        ['Brand Name', 'Rishikar Sports (RS Pro)'],
        ['Physical Address', 'CN137, Plot No 602, Tari, Near Atithee Vihar, Dahiawan Tola, Chapra, Saran, Bihar 841301'],
        ['Official Contact', '+91 6299094402 / rishikarsports@gmail.com'],
        ['Operating Hours', 'Monday – Saturday: 9:00 AM – 7:00 PM IST'],
        ['Core Categories', 'Custom Cricket/Football Kits, T-Shirts & Polos, Tracksuits, Hoodies, Shorts & Lowers, Sports Accessories']
      ],
      [30, 70]
    )
  );

  // ==========================================
  // CHAPTER 2: SYSTEM ARCHITECTURE & TECH STACK
  // ==========================================
  children.push(createH1('2. System Architecture & Technology Stack'));
  children.push(
    createP(
      'The platform follows a decoupled Modern Client-Server Architecture designed for extreme speed, high reliability, and flexible multi-target deployment (cPanel shared hosting, VPS, or Vercel Serverless).'
    )
  );

  children.push(createH2('2.1 Complete Technology Matrix'));
  children.push(
    createTable(
      [
        ['Layer', 'Technology', 'Role & Implementation Details'],
        ['Frontend Framework', 'React 18 + Vite 5', 'Component-based SPA, ultra-fast HMR, optimized tree-shaking and asset bundling.'],
        ['Routing & Code Splitting', 'React Router v6', 'Dynamic route matching, URL search parameter synchronization, and lazy-loading heavy routes via React.Suspense.'],
        ['State Management', 'React Context API', 'StoreContext.jsx manages global Cart, Wishlist, User Authentication, Saved Addresses, Orders, and Toasts.'],
        ['Styling & Design Tokens', 'Vanilla CSS + CSS Variables', 'Sleek dark/light theme tokens, responsive layouts, CSS Grid/Flexbox, custom micro-interactions.'],
        ['Graphics & Customizer Engine', 'HTML5 Canvas API + SVG', 'Real-time 2D/3D jersey graphics rendering, texture overlays, font rasterization, client-side PNG mockup export.'],
        ['Spreadsheet Engine', 'SheetJS (xlsx)', 'Client-side generation and export of squad rosters into Microsoft Excel (.xlsx) files.'],
        ['Backend Runtime', 'Node.js (v18+) + Express.js 5', 'High-performance REST API service handling auth, catalog, orders, payments, enquiries, and uploads.'],
        ['Backend Bundler', 'esbuild', 'Compiles the backend into a standalone, single-file bundle (app.js) for simple cPanel/Node deployment.'],
        ['Database (Primary)', 'MySQL 8 / MariaDB', 'Relational database with prepared statements, indexes on slug/category/order_number, and connection pooling.'],
        ['Database (Fallback)', 'Local JSON Storage', 'Automated fallback to structured JSON files in data/ for zero-setup local dev or serverless deployments.'],
        ['Authentication', 'JWT + bcryptjs + Admin PIN', 'Stateless JWT tokens for customers, bcrypt password hashing (salt=10), and PIN-protected admin console.'],
        ['Payment Gateway', 'Razorpay SDK + Offline Sandbox', 'Dual-mode payment: verified Razorpay orders with HMAC-SHA256 signature checking, plus auto-simulated sandbox mode.'],
        ['Email Engine', 'Nodemailer (SMTP)', 'Dispatches branded HTML order confirmation receipts to customers and instant alerts to admin.'],
        ['Security & Compression', 'Gzip + Rate Limiters + Security Headers', 'Express native Gzip compression (~75% payload cut), rate limiters against DDoS, strict MIME headers (nosniff).']
      ],
      [22, 28, 50]
    )
  );

  children.push(createH2('2.2 High-Level Architecture Flow Diagram'));
  children.push(
    createP(
      'Below is the architectural flow illustrating how the client interacts with the backend services and dual-storage persistence layer:'
    )
  );

  children.push(
    createCallout(
      '🏗️ Architectural Flow Overview',
      '[React Client (Vite 5)] \n' +
      '       │  (Fetch Requests with Authorization Bearer + x-admin-pin headers)\n' +
      '       ▼\n' +
      '[Express.js API Router (Port 5000 / /api)]\n' +
      '  ├── Middlewares: Security Headers (nosniff, frameguard) + Gzip Native Compressor + Rate Limiters\n' +
      '  ├── API Sub-Routers: /auth, /products, /orders, /payment, /enquiries, /coupons, /admin, /rate-list\n' +
      '  ├── Services: Nodemailer SMTP Dispatcher + Razorpay Verification Engine\n' +
      '  └── Dual-Engine Database Controller (db.js):\n' +
      '         ├── Primary Target: MySQL Database (via mysql2/promise connection pool)\n' +
      '         └── Automated Fallback: JSON File Persistence (data/*.json) + In-Memory Store'
    )
  );

  // ==========================================
  // CHAPTER 3: FRONTEND MODULES BREAKDOWN
  // ==========================================
  children.push(createH1('3. Comprehensive Frontend Modules Breakdown'));
  children.push(
    createP(
      'The frontend comprises 13 dedicated page views and 11 reusable component subsystems built to deliver a modern, high-conversion shopping experience.'
    )
  );

  children.push(createH2('3.1 Storefront & Product Discovery Module'));
  children.push(createBullet('Includes animated typography headline, USP strip, product collage, social proof badge (400+ clubs kitted), and manufacturing ticker marquee.', 'Hero Section (Home.jsx):'));
  children.push(createBullet('Visual navigation tiles for Jerseys, T-Shirts & Polos, Teamwear, and Accessories.', 'Category Bento Grid:'));
  children.push(createBullet('Interactive tabs (All, Jerseys, T-Shirts, Teamwear, Accessories) with real-time catalog filtering.', 'Best Sellers Showcase:'));
  children.push(createBullet('Highlights factory sublimation machines, laser-cutting, stitching quality, and high-tenacity polyester threads.', 'RS Construction Factory Section (RSConstructionSection.jsx):'));
  children.push(createBullet('Sticky top navigation bar with search bar trigger, category drop-downs, wishlist counter, cart drawer icon, and auth status.', 'Header & Mobile Nav (Header.jsx):'));
  children.push(createBullet('Modal search dialogue with live typing suggestions, category chips, and recent search history.', 'Search Overlay (SearchOverlay.jsx):'));
  children.push(createBullet('Persistent bottom-right button wired directly to WhatsApp with prefilled enquiry message.', 'Floating WhatsApp Action:'));

  children.push(createH2('3.2 Product Catalog & Detail Page Module'));
  children.push(createBullet('Supports /shop, /new, /sale, /search?q=..., /c/:cat, and /c/:cat/:sub with clean URL state persistence.', 'Multi-Route Catalog (Listing.jsx):'));
  children.push(createBullet('Real-time filtering by sub-category, price range slider, color swatches, and size checkboxes (XS to 4XL).', 'Faceted Sidebar Filters:'));
  children.push(createBullet('High-resolution product photo gallery with interactive zoom and multi-angle thumbnail selector.', 'Product Gallery & Zoom (Product.jsx):'));
  children.push(createBullet('Size buttons with integrated modal displaying accurate chest, length, and lower measurements in inches.', 'Size Picker & Interactive Size Guide:'));
  children.push(createBullet('Users can enter Indian 6-digit pincodes to check delivery eligibility and estimated transit times (3–7 business days).', 'Pincode Delivery Estimator:'));
  children.push(createBullet('Fabric specifications, care instructions, and manufacturing guarantees presented in clean collapsible panels.', 'Accordion Details:'));

  children.push(createH2('3.3 The Flagship 3D / Live Canvas Jersey Customizer (JerseyCustomizer.jsx)'));
  children.push(
    createP(
      'The Customizer is the most advanced module in the platform, allowing sports clubs to visually create custom team sublimation uniforms and submit complete team orders with player rosters.'
    )
  );

  children.push(
    createTable(
      [
        ['Feature Sub-Module', 'Implementation & Technical Description'],
        ['Live 2D/3D Canvas Rendering', 'JerseyCanvas.jsx renders front and back views dynamically. Patterns, collar styles, and textures update instantly in response to UI controls.'],
        ['Athletic Colorway Engine', '10 athletic preset colors (Navy, Orange, Royal Blue, Cricket Gold, Jet Black, White, Red, Green, Maroon, Cyan) + Full Hex color picker + 1-Click Primary/Accent Swap.'],
        ['Collar & Pattern Options', 'Collar styles (Polo Collar, Round Neck, V-Neck, Mandarin Collar) combined with cricket-pro patterns, geometric angles, and racing stripes.'],
        ['Typography & Font Selector', 'Dynamic text rendering with 4 athletic font styles: Pro Athletic (Impact), Varsity Block (Collegiate), Cyber Speed (Italic), and Tactical Stencil.'],
        ['Team Crest & Logo Upload', 'Choose from preset crests (Lion, Tiger, Eagle, Shield, Cricket Ball & Bats) OR upload custom sponsor/team logo images (PNG/JPG up to 3MB).'],
        ['Sportswear Fabric Selection', '5 factory fabric grades: Dotknit Breathable (160 GSM, ₹420), Superpoly (180 GSM, ₹350), PMC Poly Mesh (150 GSM, ₹400), 4-Way Lycra (190 GSM, ₹450), and Jacquard Pro (210 GSM, ₹550).'],
        ['Kit Package Selector', 'Match Jersey Only (₹0 extra), Jersey + Lower Set (+₹320 extra), or Full Pro Kit with Custom Cap (+₹440 extra).'],
        ['11-Player Squad Roster Table', 'Manage player table: Player Name, Jersey Number, Size (XS–4XL), Sleeve (Half/Full), and Role (Captain, VC, WK, Player).'],
        ['Live Roster Player Preview', 'Clicking "Preview" on any player in the table instantly flips the jersey to the back view and renders that specific player\'s name and number!'],
        ['Smart Paste WhatsApp Parser', 'Allows coaches to paste unformatted player lists copied from WhatsApp or text files. A smart regex parser automatically extracts names, numbers, and sizes into structured table rows!'],
        ['Excel (.xlsx) Roster Export', 'One-click export generates a formatted Microsoft Excel spreadsheet containing the entire squad roster and technical specifications.'],
        ['PNG Mockup Image Export', 'Downloads high-resolution PNG snapshots of the customized jersey canvas for team approvals.'],
        ['WhatsApp Design Sharing', 'Generates a formatted summary text with direct link to share the kit details with club members via WhatsApp.'],
        ['Dynamic Tiered Volume Pricing', 'Automated bulk discounts: 11+ pcs = 15% off (MOQ met), 26+ pcs = 22% off (Club wholesale), 51+ pcs = 30% off (Tournament bulk). Calculates unit rate, total amount, and savings.'],
        ['Add Custom Kit to Cart', 'Bundles the custom jersey specs, colorways, fabric, kit package, and full player roster into cart line items.']
      ],
      [28, 72]
    )
  );

  children.push(createH2('3.4 Shopping Cart, Coupons & Multi-Step Checkout'));
  children.push(createBullet('Slide-out side drawer and full-page view displaying line items, quantities, custom kit details, and live subtotal.', 'Cart Drawer & Cart Page (CartDrawer.jsx, Cart.jsx):'));
  children.push(createBullet('Interactive progress bar motivating users to reach the ₹999 free-shipping threshold.', 'Free Shipping Motivator:'));
  children.push(createBullet('Validates codes against order subtotal. Supports percent discounts (RS10, WELCOME15, CRICKET20) and flat discounts (TEAM500).', 'Coupon Discount Engine:'));
  children.push(createBullet('Customers can save, edit, and choose multiple delivery addresses with phone and pincode validation.', 'Address Book Management (Checkout.jsx):'));
  children.push(createBullet('Integrates Razorpay checkout modal for UPI, Google Pay, PhonePe, Paytm, credit/debit cards, and Netbanking. Includes automatic fallback to simulated sandbox mode if keys are absent.', 'Razorpay Payment Integration:'));
  children.push(createBullet('Supports Cash on Delivery with customizable handling fee (default ₹49).', 'Cash On Delivery (COD):'));
  children.push(createBullet('Displays animated confirmation, unique Order ID (e.g. RS-ORD-8941), order item breakdown, and 5-stage shipment timeline.', 'Order Success & Tracking (OrderSuccess.jsx):'));

  children.push(createH2('3.5 Customer Portal & Order History (Account.jsx, Auth.jsx)'));
  children.push(createBullet('Registration and login with email, mobile, and password. Issues JWT authentication token stored in localStorage.', 'Customer Auth:'));
  children.push(createBullet('View complete order history, order status badges (Placed, Packed, Shipped, Delivered), and item details.', 'Order Tracking Timeline:'));
  children.push(createBullet('Manage personal profile information and update contact details.', 'Profile Management:'));
  children.push(createBullet('Saved favorites gallery with one-click "Move to Cart" action.', 'Wishlist Hub:'));

  children.push(createH2('3.6 Official Factory Rate List Page (RateList.jsx)'));
  children.push(createBullet('Transparent pricing table across fabrics for round neck and polo collars.', 'Jerseys:'));
  children.push(createBullet('Side-mesh panels and breathable back combinations.', 'Combo Fabric Options:'));
  children.push(createBullet('Sublimated shorts, cricket whites, and athletic track pants.', 'Bottoms:'));
  children.push(createBullet('Custom caps, winter tracksuits, hoodies, and kit bags.', 'Other Gear:'));
  children.push(createBullet('Clear explanation of 5% sportswear GST, sample policies, and logistics rates.', 'GST, Shipping & Terms:'));
  children.push(createBullet('Downloadable official Excel rate list (Rishikar_Sports_Rate_List.xlsx).', 'Excel Rate List Download:'));
  children.push(createBullet('Every product row has a WhatsApp button that prefills the exact item name, fabric, and rate into a WhatsApp enquiry message.', 'Direct WhatsApp Inquiries:'));

  // ==========================================
  // CHAPTER 4: ADMIN MANAGEMENT CONSOLE
  // ==========================================
  children.push(createH1('4. Admin Management Console (Back-Office Operations)'));
  children.push(
    createP(
      'Located at /admin, the admin console provides business owners with full control over orders, products, quotes, customer accounts, and store settings without needing to touch code.'
    )
  );

  children.push(createH2('4.1 Admin Security & Authentication'));
  children.push(createBullet('Access is guarded by a 4-digit numeric PIN (default: 1234, configurable).', 'PIN-Based Gatekeeper:'));
  children.push(createBullet('Upon correct PIN entry, the backend issues an admin JWT token stored in rs.admin_token and sent via x-admin-pin headers.', 'Admin JWT & Headers:'));
  children.push(createBullet('The admin dashboard operates within its own dedicated layout chrome, hiding customer storefront navigation and footers.', 'Dedicated Layout Chrome:'));

  children.push(createH2('4.2 Admin Sub-Modules Matrix'));
  children.push(
    createTable(
      [
        ['Sub-Module', 'Capabilities & Operational Features'],
        ['Dashboard Analytics', 'Displays 5 real-time KPI metric cards: Total Revenue (₹), Total Orders, Active Products, New Enquiries, and Registered Customers. Includes revenue performance graphs.'],
        ['Order Management', 'Filter orders by status (Placed, Packed, Shipped, Out for delivery, Delivered, Cancelled) or search by phone/order ID. Full detail modal displays customer address, payment method, custom team jersey specifications, and full 11-player squad roster. Allows 1-click order status updates.'],
        ['Product Catalog CRUD', 'Create new products, edit existing items, delete discontinued products, and edit prices/stock inline. Features client-side Canvas auto-compression (<100KB JPEG) to guarantee immediate photo rendering without server 404s.'],
        ['Bulk Quote Enquiries CRM', 'Manages incoming team jersey quotation requests. Status pipeline: New → Contacted → Quoted → Won → Closed. Allows admin to add internal follow-up notes.'],
        ['Customer Directory', 'Lists all registered customers with email, phone number, registration date, order count, and lifetime spend.'],
        ['Store Settings & Rules', 'Configure brand contact info (Phone, Email, Physical Address), shipping rules (Free-shipping threshold, shipping fee, COD fee), coupon codes (discounts, min orders), and change the Admin PIN. Includes "Reset Catalogue" button.']
      ],
      [28, 72]
    )
  );

  // ==========================================
  // CHAPTER 5: BACKEND REST APIS
  // ==========================================
  children.push(createH1('5. Backend Architecture & RESTful API Specifications'));
  children.push(
    createP(
      'The backend is built with Express.js 5 and bundled with esbuild into a high-performance standalone app.js. All endpoints are prefixed with /api and protected by role-based middlewares.'
    )
  );

  children.push(createH2('5.1 Comprehensive API Directory'));
  children.push(
    createTable(
      [
        ['Method', 'Endpoint', 'Auth Level', 'Description & Payload'],
        ['POST', '/api/auth/register', 'Public', 'Register new customer. Body: { name, email, phone, password }. Returns JWT token + user profile.'],
        ['POST', '/api/auth/login', 'Public', 'Customer login. Body: { email, password }. Returns JWT token.'],
        ['GET', '/api/auth/me', 'Bearer JWT', 'Fetches current logged-in customer profile and address book.'],
        ['PUT', '/api/auth/profile', 'Bearer JWT', 'Updates customer profile information (name, phone, addresses).'],
        ['GET', '/api/products', 'Public', 'Fetches products list. Supports query filters: category, sub, sort, search, mode.'],
        ['GET', '/api/products/:slug', 'Public', 'Fetches single product details by slug or numeric ID.'],
        ['POST', '/api/products', 'Admin PIN/JWT', 'Creates a new product with images, variants, and price.'],
        ['PUT', '/api/products/:id', 'Admin PIN/JWT', 'Updates product details, stock, or pricing.'],
        ['DELETE', '/api/products/:id', 'Admin PIN/JWT', 'Deletes product from catalog.'],
        ['GET', '/api/orders', 'JWT / Admin', 'Admin receives all orders; logged-in customer receives only their own orders.'],
        ['GET', '/api/orders/:id', 'Optional', 'Retrieves tracking details for a specific order number.'],
        ['POST', '/api/orders', 'Public / User', 'Creates a new order. Triggers order confirmation email via Nodemailer SMTP.'],
        ['PATCH', '/api/orders/:id/status', 'Admin PIN/JWT', 'Updates order status (e.g. Shipped) and appends admin tracking notes.'],
        ['GET', '/api/payment/config', 'Public', 'Returns active payment gateway status (live Razorpay vs simulated dummy mode).'],
        ['POST', '/api/payment/create-order', 'Public', 'Creates Razorpay order ID or generates simulated test order token.'],
        ['POST', '/api/payment/verify', 'Public', 'Verifies HMAC-SHA256 signature on payment completion and creates order record.'],
        ['GET', '/api/enquiries', 'Admin PIN/JWT', 'Lists custom bulk quote enquiries submitted via website.'],
        ['POST', '/api/enquiries', 'Public', 'Submits custom quote request. Dispatches alert email to factory admin.'],
        ['PATCH', '/api/enquiries/:id', 'Admin PIN/JWT', 'Updates enquiry pipeline status (New, Quoted, Won) and notes.'],
        ['GET', '/api/coupons', 'Public', 'Lists available coupon promotional codes.'],
        ['POST', '/api/coupons/validate', 'Public', 'Validates coupon code against cart amount and returns discount value.'],
        ['POST', '/api/admin/login', 'Public', 'Validates Admin PIN and returns admin JWT token.'],
        ['GET', '/api/admin/stats', 'Admin PIN/JWT', 'Aggregates real-time business metrics for admin dashboard.'],
        ['GET', '/api/admin/settings', 'Admin PIN/JWT', 'Fetches store settings (shipping, fees, contact, PIN).'],
        ['PUT', '/api/admin/settings', 'Admin PIN/JWT', 'Updates store settings.'],
        ['GET', '/api/rate-list', 'Public', 'Fetches factory manufacturing rate list data.'],
        ['POST', '/api/upload', 'Admin PIN/JWT', 'Multipart image file upload handled via Multer with validation.']
      ],
      [12, 28, 18, 42]
    )
  );

  // ==========================================
  // CHAPTER 6: END-TO-END WORKING & DATA FLOWS
  // ==========================================
  children.push(createH1('6. End-to-End System Workflows & Data Flows (Working Kaise Kar Raha Hai)'));
  children.push(
    createP(
      'This chapter details exactly how the different components communicate and execute user workflows from beginning to end.'
    )
  );

  children.push(createH2('6.1 Workflow 1: Custom Jersey Team Kit Ordering Flow'));
  children.push(createBullet('User navigates to /custom or /customizer. The JerseyCustomizer component initializes with default sports colorways and an 11-player squad template.', 'Step 1 - Visual Design:'));
  children.push(createBullet('User selects color palette, sublimation pattern, collar type, and fonts. HTML5 Canvas re-renders the front and back views in real-time.', 'Step 2 - Canvas Rendering:'));
  children.push(createBullet('User uploads custom team crest / logo. The image is loaded via FileReader and drawn onto the left chest of the jersey canvas.', 'Step 3 - Crest Upload:'));
  children.push(createBullet('User selects manufacturing fabric grade (e.g. Dotknit 160 GSM) and kit package (e.g. Jersey + Lower Set).', 'Step 4 - Fabric & Kit Package:'));
  children.push(createBullet('User enters squad names, numbers, sizes, and sleeves. Alternatively, user uses the "Smart Paste" feature to paste a list from WhatsApp, which auto-populates the roster table.', 'Step 5 - Roster Management:'));
  children.push(createBullet('User can click "Export to Excel" to download a .xlsx backup, or "Download Mockup" to save a PNG picture.', 'Step 6 - Export & Approvals:'));
  children.push(createBullet('The tiered wholesale pricing engine calculates discounts: 11–25 pcs (15% off), 26–50 pcs (22% off), 51+ pcs (30% off).', 'Step 7 - Dynamic Pricing:'));
  children.push(createBullet('User clicks "Add Custom Team Order to Bag". The complete kit specification, fabric, colors, and full player roster array are saved into global Cart context.', 'Step 8 - Cart Injection:'));

  children.push(createH2('6.2 Workflow 2: Dual-Mode Payment & Checkout Lifecycle'));
  children.push(createBullet('User proceeds to /checkout. The app checks payment gateway configuration via /api/payment/config.', 'Step 1 - Config Check:'));
  children.push(createBullet('User enters delivery address and chooses Online Payment (Razorpay) or Cash on Delivery (COD).', 'Step 2 - Address & Method:'));
  children.push(createBullet('If Razorpay keys exist in .env, the backend creates an official Razorpay order with amount in paise. If keys are missing (or offline), it automatically switches to simulated sandbox mode with zero friction.', 'Step 3 - Gateway Dispatch:'));
  children.push(createBullet('Customer completes payment in Razorpay modal. Razorpay returns razorpay_payment_id, razorpay_order_id, and signature.', 'Step 4 - Signature Verification:'));
  children.push(createBullet('The backend verifies the cryptographic HMAC-SHA256 signature using the secret key. Upon successful verification, the order is saved into database as "Paid".', 'Step 5 - Order Confirmation:'));
  children.push(createBullet('Cart is cleared, user is redirected to /order/:id with celebratory animation, and confirmation emails are dispatched.', 'Step 6 - Post-Purchase:'));

  children.push(createH2('6.3 Workflow 3: Dual-Engine Database Storage Mechanism'));
  children.push(
    createP(
      'The platform implements an innovative hybrid storage adapter in backend/db.js to ensure 100% operational uptime across diverse hosting environments:'
    )
  );

  children.push(
    createTable(
      [
        ['Execution Mode', 'Database Target', 'Operational Behavior'],
        ['Production / cPanel / VPS', 'MySQL 8 / MariaDB', 'Uses mysql2/promise connection pool. Connects to MySQL using DB_HOST, DB_USER, DB_PASS, DB_NAME. Executes prepared SQL statements with indexes.'],
        ['Local Dev / Offline Mode', 'JSON Flat-File Engine', 'If MySQL credentials are missing or MySQL server is offline, db.js automatically stores data in data/products.json, data/orders.json, data/enquiries.json, etc.'],
        ['Vercel Serverless Mode', 'Ephemeral /tmp Memory Engine', 'On serverless environments with read-only root filesystems, db.js detects process.env.VERCEL and safely routes file persistence to /tmp/rs_data.'],
        ['In-Memory Cache Layer', 'JavaScript Memory Store', 'All read requests check an in-memory cache first, reducing disk I/O and query latency to near 0ms.']
      ],
      [25, 25, 50]
    )
  );

  children.push(createH2('6.4 Workflow 4: Automated SMTP Email Notification System'));
  children.push(createBullet('Triggered automatically when an order is created (backend/utils/mailer.js).', 'Order Confirmation Email:'));
  children.push(createBullet('Renders a responsive, branded HTML email template featuring Rishikar Sports logo, order number, delivery address, table of purchased items (with fabric/customization specs), price breakdown, and order tracking link.', 'Customer Receipt Template:'));
  children.push(createBullet('Simultaneously sends an administrative alert email to rishikarsports@gmail.com with customer phone, address, and total order value.', 'Admin Alert Email:'));
  children.push(createBullet('If SMTP credentials are not configured in .env, the mailer safely logs a warning without crashing or delaying the customer checkout process.', 'Graceful Degradation:'));

  // ==========================================
  // CHAPTER 7: DATABASE SCHEMA & DATA MODELS
  // ==========================================
  children.push(createH1('7. Database Schema & Data Models'));
  children.push(
    createP(
      'The database uses a hybrid relational-document design. Fast-query fields (slug, category, price, order status) are indexed relational columns, while complex nested structures (rosters, addresses, images) are stored in utf8mb4 LONGTEXT JSON fields.'
    )
  );

  children.push(createH2('7.1 MySQL Relational Tables (backend/schema.sql)'));
  children.push(
    createTable(
      [
        ['Table Name', 'Primary Key', 'Indexed Columns', 'Purpose & Structure'],
        ['rs_products', 'id (INT AUTO_INCREMENT)', 'slug (UNIQUE), category', 'Stores catalog products. data column contains colors, sizes, fabrics, images array, description, and tags.'],
        ['rs_orders', 'id (VARCHAR 100)', 'order_number, status', 'Stores customer orders. data column contains customer details, items array (with custom jersey rosters), subtotal, discount, tax, paymentMethod.'],
        ['rs_enquiries', 'id (VARCHAR 100)', 'status', 'Stores bulk quote requests. data column contains team name, sport category, quantity, notes, and admin follow-up history.'],
        ['rs_coupons', 'code (VARCHAR 50)', 'code', 'Stores promo discount codes. data column contains discount value, discount type (percent/flat), minOrder, and maxDiscount.'],
        ['rs_settings', 'setting_key (VARCHAR 100)', 'setting_key', 'Key-value store for store settings: storeName, phone, email, address, moq, shipping fees, admin PIN.'],
        ['rs_users', 'id (VARCHAR 100)', 'email (UNIQUE)', 'Stores customer credentials. password stores bcrypt hash. data column contains saved delivery addresses and wishlist.'],
        ['rs_rate_list', 'id (INT AUTO_INCREMENT)', 'None', 'Stores categorized factory manufacturing rate list items.']
      ],
      [18, 22, 22, 38]
    )
  );

  // ==========================================
  // CHAPTER 8: SECURITY & PERFORMANCE
  // ==========================================
  children.push(createH1('8. Security, Performance & Optimization Strategies'));
  children.push(
    createP(
      'The platform incorporates enterprise-grade performance optimizations and security safeguards to ensure fast page loads and protection against abuse.'
    )
  );

  children.push(createH2('8.1 Performance Optimizations'));
  children.push(createBullet('Heavy routes (Admin, JerseyCustomizer, RateList, Account, OrderSuccess) are split into separate bundles using React.lazy and loaded on demand.', 'Route Code Splitting:'));
  children.push(createBullet('Native Zlib Gzip middleware compresses JSON payloads exceeding 1KB, cutting data transfer sizes by approximately 75%.', 'Native Gzip Compression:'));
  children.push(createBullet('Before uploading, product images are automatically scaled (max 1000px) and compressed to ~90KB JPEG using HTML5 Canvas in api.js.', 'Client-Side Canvas Image Compression:'));
  children.push(createBullet('Uploaded static files are served with maxAge: 7d caching headers.', 'Static Asset Caching:'));

  children.push(createH2('8.2 Security & Abuse Prevention'));
  children.push(createBullet('Rate limiters protect API routes: general limiter (200 req/15min), auth limiter (20 req/15min to prevent brute-force attacks), and order limiter (15 req/15min).', 'API Rate Limiting:'));
  children.push(createBullet('X-Content-Type-Options: nosniff prevents MIME type sniffing exploits on file uploads.', 'MIME Sniffing Defense:'));
  children.push(createBullet('X-Frame-Options: SAMEORIGIN defends against clickjacking attacks.', 'Clickjacking Protection:'));
  children.push(createBullet('X-Powered-By response headers are stripped to conceal underlying server technology.', 'Technology Obfuscation:'));
  children.push(createBullet('Customer passwords are salted and hashed using bcryptjs with 10 salt rounds.', 'Password Encryption:'));

  // ==========================================
  // CHAPTER 9: DEPLOYMENT ARCHITECTURE
  // ==========================================
  children.push(createH1('9. Deployment Architecture & Hosting Options'));
  children.push(
    createP(
      'The project is architected for dual-target deployment, catering to both traditional cPanel shared hosting and modern serverless platforms like Vercel.'
    )
  );

  children.push(createH2('9.1 cPanel / VPS Deployment Workflow'));
  children.push(createBullet('Import backend/schema.sql into phpMyAdmin to create relational tables.', 'Step 1 - Database:'));
  children.push(createBullet('Upload cpanel-backend-v4.zip into cPanel Node.js selector directory. Run npm start with entry point app.js.', 'Step 2 - Backend:'));
  children.push(createBullet('Configure DB_HOST, DB_USER, DB_PASS, DB_NAME, and RAZORPAY_KEY_* in cPanel environment variables.', 'Step 3 - Environment:'));
  children.push(createBullet('Build frontend using npm run build and upload contents of dist/ to public_html.', 'Step 4 - Frontend:'));

  children.push(createH2('9.2 Vercel Serverless Deployment'));
  children.push(createBullet('Configured via vercel.json. Routes /api/* to serverless handler in api/index.js and other requests to frontend SPA.', 'SPA & Serverless Rewrites:'));
  children.push(createBullet('Serverless environment automatically redirects data persistence to /tmp/rs_data to bypass read-only filesystem restrictions.', 'Safe /tmp Persistence:'));

  // ==========================================
  // CHAPTER 10: FILE & DIRECTORY INVENTORY
  // ==========================================
  children.push(createH1('10. Complete Project Directory & File Inventory'));
  children.push(
    createTable(
      [
        ['File / Directory Path', 'Key Contents & Responsibilities'],
        ['frontend/src/pages/JerseyCustomizer.jsx', 'Signature 3D/2D jersey visualizer, 11-player squad roster table, Smart Paste WhatsApp parser, dynamic tiered pricing, Excel/PNG export.'],
        ['frontend/src/components/JerseyCanvas.jsx', 'HTML5 Canvas rendering engine for front and back jersey views, textures, crests, and athletic numbers.'],
        ['frontend/src/pages/Admin.jsx', 'Back-office console: Dashboard stats, order fulfillment, product CRUD, enquiry CRM, store settings, PIN reset.'],
        ['frontend/src/pages/Checkout.jsx', 'Multi-step checkout: address book, coupon calculation, Razorpay online gateway, and COD support.'],
        ['frontend/src/pages/RateList.jsx', 'Factory manufacturing rate list with categorized tabs, Excel rate list download, and WhatsApp buttons.'],
        ['frontend/src/pages/Home.jsx', 'Homepage with hero collage, marquee, category bento grid, bestsellers tabs, and testimonials.'],
        ['frontend/src/pages/Product.jsx', 'Product detail page with photo gallery, zoom, size guide modal, pincode checker, and accordions.'],
        ['frontend/src/pages/Listing.jsx', 'Catalog listing page with multi-faceted filtering (category, price, color, size) and URL synchronization.'],
        ['frontend/src/context/StoreContext.jsx', 'Global React Context store for cart items, wishlist, user auth token, orders, addresses, and toast alerts.'],
        ['frontend/src/lib/api.js', 'Frontend API client with automatic JWT/PIN header injection, Razorpay error fallback, and Canvas image compression.'],
        ['backend/index.js', 'Express 5 server setup, security headers, native Gzip compression, static upload serving, and route mounting.'],
        ['backend/db.js', 'Dual-storage engine: MySQL connection pooling + automated fallback to local JSON flat-file persistence.'],
        ['backend/schema.sql', 'Complete MySQL / phpMyAdmin database schema for products, orders, enquiries, coupons, users, and settings.'],
        ['backend/routes/payment.js', 'Dual-mode payment router: Razorpay order creation, HMAC-SHA256 signature verification, and simulated sandbox mode.'],
        ['backend/routes/orders.js', 'Order placement, customer history filtering, order status management, and email notifications.'],
        ['backend/routes/auth.js', 'Customer registration, bcrypt password hashing, login, and JWT token issuance.'],
        ['backend/utils/mailer.js', 'Nodemailer SMTP transporter verification, responsive HTML order confirmation emails, and admin alert emails.']
      ],
      [35, 65]
    )
  );

  // Conclusion Callout
  children.push(
    createCallout(
      '✅ Final Project Assessment',
      'The Rishikar Sports (Ecom-tyka) platform is an exceptionally complete, highly customized, and production-ready manufacturing e-commerce system. It successfully combines direct-to-consumer retail shopping with a state-of-the-art B2B customized sports uniform ordering workflow, complete with team roster automation, dynamic tiered volume discounts, dual-engine database storage, and a robust admin management portal.',
      true
    )
  );

  // Construct Document
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Segoe UI',
            size: 20,
            color: BODY_GRAY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1000,
              bottom: 1000,
              left: 1200,
              right: 1200,
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: 'Rishikar Sports Technical Architecture — Page ',
                    font: 'Segoe UI',
                    size: 18,
                    color: MUTED_GRAY,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: 'Segoe UI',
                    size: 18,
                    bold: true,
                    color: ORANGE,
                  }),
                  new TextRun({
                    text: ' of ',
                    font: 'Segoe UI',
                    size: 18,
                    color: MUTED_GRAY,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: 'Segoe UI',
                    size: 18,
                    bold: true,
                    color: ORANGE,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve('c:/Users/Gulshan Pandey/Desktop/Ecom-tyka', 'Rishikar_Sports_Project_Features_and_Architecture_Documentation.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('SUCCESS: Word document created at:', outputPath);
}

buildProjectDoc().catch((err) => {
  console.error('ERROR generating Word doc:', err);
  process.exit(1);
});
