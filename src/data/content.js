const P = '/products/'

export const BRAND = {
  name: 'RISHIKAR SPORTS',
  short: 'RISHIKAR',
  tagline: 'Quality You Trust, Performance You Deserve',
  about:
    'Rishikar Sports is a sportswear manufacturing unit in Chapra, Bihar. We make jerseys, tracksuits, hoodies, tees and kit bags for clubs, academies, schools and companies — with your logo, your colours, your numbers.',
  phone: '6299094402',
  phoneIntl: '+916299094402',
  email: 'rishikarsports@gmail.com',
  address: 'CN137, Plot No 602, Tari, Near Atithee Vihar, Dahiawan Tola, Chapra, Saran, Bihar 841301',
  addressShort: 'Dahiawan Tola, Tari, Chapra, Bihar 841301',
  hours: 'Mon–Sat, 9am–7pm',
  moq: 11,
}

export const HERO = {
  kicker: 'Custom team kits from 11 pieces',
  headline: ['We make every player', 'look confident.'],
  text:
    'Sportswear manufacturing from our own unit in Chapra, Bihar. Full-sublimation jerseys, tracksuits, hoodies and kit bags — your logo, your colours, delivered across India.',
  cards: [
    { img: P + 'polo.png', to: '/product/rs-pro-polo' },
    { img: P + 'jersey.png', to: '/product/rs-pro-sublimated-jersey' },
    { img: P + 'bag.png', to: '/product/rs-duffle-kit-bag' },
  ],
  tags: [
    { label: 'RS PRO Polo', sub: '₹699 · Best seller' },
    { label: 'Custom kits', sub: 'From 11 pieces' },
    { label: '10–12 days', sub: 'Design to delivery' },
  ],
}

export const MARQUEE = ['T-Shirts', 'Tracksuits', 'Shorts', 'Hoodies', 'Jerseys', 'Kit Bags', 'Custom Printing', 'Embroidery']

export const MANUFACTURE = [
  { name: 'Jerseys', sub: 'Football · Cricket · Basketball', to: '/c/jerseys', img: P + 'jersey.png' },
  { name: 'Polos & Tees', sub: 'Dry-fit, corporate, training', to: '/c/tshirts', img: P + 'polo.png' },
  { name: 'Tracksuits', sub: 'Summer and winter sets', to: '/c/teamwear/tracksuits', img: P + 'jacket.png' },
  { name: 'Hoodies', sub: 'Zipper and pullover', to: '/c/teamwear/hoodies', img: P + 'hoodie.png' },
  { name: 'Kit Bags', sub: 'Duffles and team bags', to: '/c/accessories/kit-bags', img: P + 'bag.png' },
]

export const CATEGORY_TILES = [
  { slug: 'jerseys', name: 'Jerseys', sub: 'Full sublimation · your design', img: P + 'jersey.png', size: 'xl' },
  { slug: 'tshirts', name: 'T-Shirts & Polos', sub: 'Dry-fit, corporate, training', img: P + 'polo.png', size: 'wide' },
  { slug: 'teamwear', name: 'Teamwear', sub: 'Tracksuits · hoodies · lowers', img: P + 'jacket.png' },
  { slug: 'accessories', name: 'Accessories', sub: 'Bags · caps · bottles', img: P + 'bag.png' },
]

export const PROMO_CARDS = [
  { tone: 'orange', kicker: 'Team orders', title: 'Your logo on every piece', to: '/custom', img: P + 'hoodie.png', cta: 'Get a bulk quote' },
  { tone: 'navy', kicker: 'Academies & schools', title: 'Kit the whole squad', to: '/c/teamwear/tracksuits', img: P + 'jacket.png', cta: 'Shop teamwear' },
]

export const USPS = [
  { icon: 'shield', title: 'Premium quality', text: 'Own unit, checked piece by piece' },
  { icon: 'refresh', title: 'Comfort & durability', text: 'Fabric that survives the season' },
  { icon: 'zap', title: 'Custom designs', text: 'Free mock-up before production' },
  { icon: 'truck', title: 'On-time delivery', text: '10–12 days, shipped pan-India' },
]

export const PROCESS = [
  { n: '01', title: 'Share your idea', text: 'Send your logo, colours and quantity on WhatsApp or the enquiry form.' },
  { n: '02', title: 'Free design mock-up', text: 'Our designer sends a 3D mock-up. Change it as many times as you like.' },
  { n: '03', title: 'Approve & produce', text: 'Once you approve, we cut, print, stitch and quality-check in our own unit.' },
  { n: '04', title: 'Delivered to you', text: 'Packed set-wise with names and numbers, shipped anywhere in India.' },
]

export const TESTIMONIALS = [
  { name: 'Ranjan K.', role: 'Football club secretary, Chapra', text: 'Ordered 22 sublimated jerseys with names and numbers. Print quality is sharp and the delivery came two days before the tournament.', rating: 5 },
  { name: 'Aditi S.', role: 'School sports teacher, Patna', text: 'We kit out 120 students every year. Sizing stays consistent batch after batch and the colours do not fade after washing.', rating: 5 },
  { name: 'Coach Imran', role: 'Cricket academy, Siwan', text: 'The tracksuits are warm without feeling heavy, and the team logo embroidery is neat. Good rate for bulk too.', rating: 4 },
]

export const FAQS = [
  { q: 'What is the minimum order quantity?', a: 'For custom printed or sublimated kits the minimum is 11 pieces per design. Plain stock items such as polos, caps and bottles can be ordered from a single piece.' },
  { q: 'How long does a custom order take?', a: 'Design mock-up within 24 hours, and production plus delivery in 10–12 working days after you approve the design. Urgent orders can be arranged — call us to check.' },
  { q: 'Can you match our club colours exactly?', a: 'Yes. Send us the colour code or a sample and we match it in sublimation. You get a mock-up for approval before we cut any fabric.' },
  { q: 'Do you do printing and embroidery both?', a: 'Both. Sublimation and screen printing for large graphics, embroidery for logos on polos, caps and jackets.' },
  { q: 'Do you ship outside Bihar?', a: 'We ship across India. Delivery is 2–4 working days for metros and 4–7 working days elsewhere after dispatch.' },
  { q: 'What if a size does not fit?', a: 'Plain stock items can be exchanged within 7 days. Customised kits with names and numbers cannot be returned, so we always send a size chart and sample sizes before bulk production.' },
]

export const POLICIES = {
  'shipping-returns': {
    title: 'Shipping & Returns',
    sections: [
      ['Shipping', 'Stock items are dispatched within 24–48 hours from our unit in Chapra, Bihar. Custom orders ship 10–12 working days after design approval. Free shipping on orders above ₹999; a flat ₹79 fee applies below that.'],
      ['Returns', 'Unused stock items with tags can be returned within 7 days of delivery. Pick-up for the first return on an order is free and refunds are processed within 5–7 working days after quality check.'],
      ['Custom orders', 'Kits printed with your logo, player names or numbers cannot be returned or exchanged unless there is a manufacturing defect. We send a mock-up and size chart for approval before production to avoid this.'],
      ['Damaged in transit', 'If a parcel arrives damaged, send us photos on WhatsApp within 48 hours and we replace the pieces at no cost.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Name, contact details, delivery addresses and order history — only what is needed to fulfil your order and support you afterwards.'],
      ['Your designs', 'Logos and artwork you send us are used only to produce your order. We never resell or reuse a club design for another customer.'],
      ['Payments', 'Card and UPI details are handled by PCI-DSS compliant payment partners. Rishikar Sports never stores full card numbers.'],
      ['Your rights', 'Write to rishikarsports@gmail.com any time to get a copy of your data or ask us to delete it.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      ['Pricing', 'All prices are in Indian Rupees and inclusive of GST. Bulk rates depend on quantity and design; the quote we send is valid for 15 days.'],
      ['Custom orders', 'Production starts only after you approve the mock-up and pay the agreed advance. Changes requested after approval may affect price and delivery date.'],
      ['Intellectual property', 'You keep ownership of your logo and artwork. The Rishikar Sports name and RS mark belong to Rishikar Sports LLP.'],
      ['Governing law', 'These terms are governed by the laws of India; courts in Saran, Bihar have exclusive jurisdiction.'],
    ],
  },
}

export const SIZE_CHART = {
  tops: { title: 'Jerseys, tees, polos, hoodies', unit: 'inches', cols: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [['XS', '36', '26', '16'], ['S', '38', '27', '17'], ['M', '40', '28', '18'], ['L', '42', '29', '19'], ['XL', '44', '30', '20'], ['XXL', '46', '31', '21'], ['XXXL', '48', '32', '22']] },
  bottoms: { title: 'Lowers, track pants, shorts', unit: 'inches', cols: ['Size', 'Waist', 'Hip', 'Inseam'], rows: [['XS', '28', '36', '29'], ['S', '30', '38', '30'], ['M', '32', '40', '30'], ['L', '34', '42', '31'], ['XL', '36', '44', '31'], ['XXL', '38', '46', '32'], ['XXXL', '40', '48', '32']] },
  kids: { title: 'Junior sizes (age)', unit: 'inches', cols: ['Size', 'Age', 'Chest', 'Length'], rows: [['20', '5–6 yrs', '20', '18'], ['22', '7–8 yrs', '22', '20'], ['24', '9–10 yrs', '24', '22'], ['26', '11–12 yrs', '26', '24'], ['28', '13–14 yrs', '28', '25']] },
}

export const COUPONS = {
  RS10: { type: 'pct', value: 10, min: 999, label: '10% off on orders above ₹999' },
  TEAM500: { type: 'flat', value: 500, min: 4999, label: '₹500 off on team orders above ₹4,999' },
  WELCOME15: { type: 'pct', value: 15, min: 1499, label: '15% off on orders above ₹1,499' },
}

export const FREE_SHIP_ABOVE = 999
export const SHIPPING_FEE = 79
export const COD_FEE = 49
