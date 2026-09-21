const P = 'https://tyka.premierhostings.com/backend/storage/products/'

export const BRAND = {
  name: 'KRIDA',
  tagline: 'Made for the game',
  about: 'KRIDA is a performance sportswear store for athletes across India — cricket whites and helmets, training kit, footwear and recovery gear, picked and tested by people who actually play.',
}

// Hero collage: three hero products + floating tags
export const FOUNDER_IMG = '/img/face.jpg'

export const HERO = {
  kicker: 'New season drop is live',
  headline: ['Made for', 'the game.'],
  text: 'Cricket whites that breathe, tights that never sag, helmets pros trust. 280+ styles across cricket, training, running and shooting — shipped anywhere in India.',
  cards: [
    { img: '/img/face.jpg', to: '/about', person: true },
    { img: P + 'helmet.webp', to: '/product/tyka-atlas-youth-ms-grill' },
    { img: P + 'TYKA-Shoe-Speed-BlackBlue-L.webp', to: '/product/speed-550-shoe' },
  ],
  tags: [
    { label: 'Team KRIDA', sub: 'Player tested, always' },
    { label: 'Speed 550', sub: 'Runner favourite' },
    { label: '4.8 ★', sub: '12k+ reviews' },
  ],
}

export const MARQUEE = ['Cricket', 'Training', 'Running', 'Football', 'Shooting', 'Recovery', 'Team kits']

export const CATEGORY_TILES = [
  { slug: 'men', name: 'Men', sub: '135+ styles · polos, tracksuits, lowers', img: '/img/face.jpg', size: 'xl', pos: 'center' },
  { slug: 'women', name: 'Women', sub: '40+ styles · tights, tees, tracksuits', img: P + 'TYKA-Polo-Bron-Airforceblue-F-webp.webp', size: 'wide' },
  { slug: 'cricket', name: 'Cricket', sub: 'Helmets · balls · whites', img: P + 'helmet.webp' },
  { slug: 'accessories', name: 'Accessories', sub: 'Bags · caps · socks', img: P + 'TYKA-Bag-Legend-Wheelie-Black-L.webp' },
]

export const PROMO_CARDS = [
  { tone: 'lime', kicker: 'Cricket season', title: 'Spikes that grip', to: '/c/cricket/shoes-1', img: P + 'spkies-pro-orange-1.webp', cta: 'Shop cricket shoes' },
  { tone: 'forest', kicker: 'Recovery', title: 'Roll it out', to: '/c/accessories/recovery-foam-rollers', img: P + 'teollstrandardsoft.webp', cta: 'Shop foam rollers' },
]

export const USPS = [
  { icon: 'truck', title: 'Free shipping', text: 'On all orders above ₹999' },
  { icon: 'refresh', title: '7-day easy returns', text: 'Free size exchanges' },
  { icon: 'shield', title: 'Secure payments', text: 'UPI · Cards · COD' },
  { icon: 'flag', title: 'Ships pan-India', text: '2–7 working days' },
]

export const TESTIMONIALS = [
  { name: 'Rohit S.', role: 'Club cricketer, Pune', text: 'The Force helmet is the lightest I have worn. Grill visibility is excellent and it survived a full season of nets.', rating: 5 },
  { name: 'Ananya M.', role: 'Marathon runner', text: 'Elite tights fit perfectly and the fabric does not sag even after long runs. Ordered a second pair the same week.', rating: 5 },
  { name: 'Coach Vikram', role: 'Academy owner, Delhi', text: 'We kit out 60 kids every year through KRIDA. Consistent sizing, quick delivery and the team uniforms hold colour wash after wash.', rating: 4 },
]

export const FAQS = [
  { q: 'How long does delivery take?', a: 'Metro cities: 2–4 working days. Rest of India: 4–7 working days. You will receive tracking details by SMS and email as soon as your order ships.' },
  { q: 'What is your return policy?', a: 'Unused items with tags can be returned within 7 days of delivery for a full refund or exchange. Helmets and innerwear are non-returnable for hygiene reasons.' },
  { q: 'How do I pick the right size?', a: 'Every product page has a Size Guide link with chest, waist and length measurements in inches. If you are between sizes, we recommend sizing up for tops and down for compression wear.' },
  { q: 'Do you offer team / bulk orders?', a: 'Yes. We supply academies, clubs and corporate teams with customised kits. Write to teams@krida.in with your requirement and quantities.' },
  { q: 'Is Cash on Delivery available?', a: 'COD is available on orders up to ₹10,000 across most pincodes. A ₹49 handling fee applies to COD orders.' },
  { q: 'How do I track my order?', a: 'Log in and open My Orders. Every order shows live status: Placed → Packed → Shipped → Out for delivery → Delivered.' },
]

export const POLICIES = {
  'shipping-returns': {
    title: 'Shipping & Returns',
    sections: [
      ['Shipping', 'Orders are dispatched within 24–48 hours from our Gurugram warehouse. Free shipping applies to orders above ₹999; a flat ₹79 fee applies below that. Delivery timelines are 2–4 working days for metros and 4–7 working days for the rest of India.'],
      ['Returns', 'You may return unused, unwashed products with original tags within 7 days of delivery. Pick-up is arranged free of cost for the first return on an order. Refunds are processed to the original payment method within 5–7 working days after quality check.'],
      ['Exchanges', 'Size exchanges are free. Choose Exchange from My Orders and the replacement ships as soon as the pick-up is confirmed.'],
      ['Non-returnable items', 'Helmets, innerwear, socks and customised team kits cannot be returned unless damaged or defective on arrival.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['What we collect', 'Name, contact details, delivery addresses and order history — only what is needed to fulfil your order and support you afterwards.'],
      ['How we use it', 'To process orders, send transactional updates, personalise recommendations and, if you opt in, share offers. We never sell personal data.'],
      ['Payments', 'Card and UPI details are handled by PCI-DSS compliant payment partners. KRIDA never stores full card numbers.'],
      ['Your rights', 'You can request a copy or deletion of your data any time by emailing privacy@krida.in.'],
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    sections: [
      ['Pricing', 'All prices are in Indian Rupees and inclusive of GST. We reserve the right to correct pricing errors before dispatch.'],
      ['Order acceptance', 'An order is confirmed only when you receive the confirmation email. We may cancel orders due to stock unavailability or suspected fraud with a full refund.'],
      ['Intellectual property', 'KRIDA, the K mark and site content are property of KRIDA Retail. Product names and images belong to their respective brands.'],
      ['Governing law', 'These terms are governed by the laws of India; courts in Gurugram, Haryana have exclusive jurisdiction.'],
    ],
  },
}

export const SIZE_CHART = {
  tops: { title: 'Tops, polos, jackets', unit: 'inches', cols: ['Size', 'Chest', 'Length', 'Shoulder'], rows: [['XS', '36', '26', '16'], ['S', '38', '27', '17'], ['M', '40', '28', '18'], ['L', '42', '29', '19'], ['XL', '44', '30', '20'], ['XXL', '46', '31', '21'], ['XXXL', '48', '32', '22']] },
  bottoms: { title: 'Shorts, lowers, tights', unit: 'inches', cols: ['Size', 'Waist', 'Hip', 'Inseam'], rows: [['XS', '28', '36', '29'], ['S', '30', '38', '30'], ['M', '32', '40', '30'], ['L', '34', '42', '31'], ['XL', '36', '44', '31'], ['XXL', '38', '46', '32'], ['XXXL', '40', '48', '32']] },
  shoes: { title: 'Footwear', unit: 'UK / EU / cm', cols: ['UK', 'EU', 'Foot length (cm)'], rows: [['5', '38', '24'], ['6', '39', '24.8'], ['7', '40.5', '25.7'], ['8', '42', '26.5'], ['9', '43', '27.3'], ['10', '44.5', '28.1'], ['11', '45.5', '29']] },
}

export const COUPONS = {
  KRIDA10: { type: 'pct', value: 10, min: 999, label: '10% off on orders above ₹999' },
  FLAT200: { type: 'flat', value: 200, min: 1999, label: '₹200 off on orders above ₹1,999' },
  WELCOME15: { type: 'pct', value: 15, min: 1499, label: '15% off on orders above ₹1,499' },
}

export const FREE_SHIP_ABOVE = 999
export const SHIPPING_FEE = 79
export const COD_FEE = 49
