const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24' }
const I = (paths) => (props) => (
  <svg {...base} {...props} aria-hidden="true">
    {paths}
  </svg>
)

export const Search = I(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>)
export const Heart = I(<path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.6 3.6 4.5 6.8 4.5c2 0 3.4 1.1 4.2 2.4.8-1.3 2.2-2.4 4.2-2.4 3.2 0 5.3 3.1 4.1 6.6C17.5 15.9 12 20.5 12 20.5Z" />)
export const HeartFill = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 20.5s-7.5-4.6-9.3-9.4C1.5 7.6 3.6 4.5 6.8 4.5c2 0 3.4 1.1 4.2 2.4.8-1.3 2.2-2.4 4.2-2.4 3.2 0 5.3 3.1 4.1 6.6C17.5 15.9 12 20.5 12 20.5Z" /></svg>
export const Bag = I(<><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></>)
export const User = I(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" /></>)
export const Menu = I(<><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>)
export const X = I(<><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>)
export const ChevronDown = I(<path d="m6 9 6 6 6-6" />)
export const ChevronRight = I(<path d="m9 6 6 6-6 6" />)
export const ChevronLeft = I(<path d="m15 6-6 6 6 6" />)
export const ArrowRight = I(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>)
export const Plus = I(<><path d="M12 5v14" /><path d="M5 12h14" /></>)
export const Minus = I(<path d="M5 12h14" />)
export const Star = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="m12 2.5 2.9 6.2 6.7.8-4.9 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7L2.4 9.5l6.7-.8L12 2.5Z" /></svg>
export const StarHalf = (p) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><defs><linearGradient id="half"><stop offset="50%" stopColor="currentColor" /><stop offset="50%" stopColor="#d9dbe3" /></linearGradient></defs><path fill="url(#half)" d="m12 2.5 2.9 6.2 6.7.8-4.9 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7L2.4 9.5l6.7-.8L12 2.5Z" /></svg>
export const Truck = I(<><path d="M3 7h11v9H3z" /><path d="M14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></>)
export const Refresh = I(<><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v5h-5" /></>)
export const Shield = I(<><path d="M12 3 4.5 6v6c0 4.5 3.2 7.6 7.5 9 4.3-1.4 7.5-4.5 7.5-9V6L12 3Z" /><path d="m9 12 2 2 4-4" /></>)
export const Flag = I(<><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>)
export const Check = I(<path d="m5 12 5 5L20 7" />)
export const MapPin = I(<><path d="M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11Z" /><circle cx="12" cy="10" r="2.2" /></>)
export const Phone = I(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />)
export const Mail = I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>)
export const Clock = I(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)
export const Package = I(<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M4 7.5l8 4.5 8-4.5" /><path d="M12 12v9" /></>)
export const Filter = I(<><path d="M4 6h16" /><path d="M7 12h10" /><path d="M10 18h4" /></>)
export const Grid = I(<><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></>)
export const Trash = I(<><path d="M5 7h14" /><path d="M9 7V5h6v2" /><path d="M7 7l1 13h8l1-13" /></>)
export const Lock = I(<><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>)
export const CreditCard = I(<><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M3 10h18" /></>)
export const Wallet = I(<><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1V7Z" /><path d="M4 7a2 2 0 0 1 2-2h11v2" /><circle cx="16.5" cy="14" r="1" /></>)
export const Cash = I(<><rect x="3" y="7" width="18" height="10" rx="2" /><circle cx="12" cy="12" r="2.5" /></>)
export const Ruler = I(<><path d="m3 17 14-14 4 4L7 21l-4-4Z" /><path d="m7 13 2 2" /><path d="m10 10 2 2" /><path d="m13 7 2 2" /></>)
export const Zap = I(<path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" />)
export const Award = I(<><circle cx="12" cy="9" r="5" /><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" /></>)
export const Leaf = I(<><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Z" /><path d="M5 19 13 11" /></>)
export const Instagram = I(<><rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" /><circle cx="17" cy="7" r=".8" fill="currentColor" /></>)
export const Facebook = I(<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" />)
export const Youtube = I(<><rect x="3" y="6" width="18" height="12" rx="4" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" /></>)
export const Twitter = I(<path d="M4 4l6.5 8.5L4 20h2l5.4-6.2L16 20h4l-6.8-9L19.5 4h-2l-5 5.7L8 4H4Z" />)
export const LogOut = I(<><path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4" /><path d="m15 8 5 4-5 4" /><path d="M20 12H9" /></>)
export const Home = I(<><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9Z" /></>)
export const Info = I(<><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 8h.01" /></>)
export const Bird = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M2 12c4-1 7-4 9-8 1 3 3 5 6 6-1 1-3 2-5 2 3 1 6 1 10 0-2 3-6 5-10 5-1 2-3 3-5 3 1-1 1.5-2 1.5-3C6 17 3.5 15 2 12Z" /></svg>
export const KMark = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M5 3h4.2v7.4L15.6 3h5.1l-7.2 8.6L21 21h-5.2L9.2 13v8H5z" /></svg>
export const WhatsApp = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.8 4.9-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2a.6.6 0 0 0 0-.6c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.9 11.9 0 0 0 4.6 4 5.3 5.3 0 0 0 3.2.6 2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.2-.3-.2-.5-.3Z" /></svg>
export const Factory = I(<><path d="M3 21V10l6 4V10l6 4V7l6 3v11z" /><path d="M7 21v-4" /><path d="M13 21v-4" /></>)
export const Scissors = I(<><circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><path d="M8 7.5 20 18" /><path d="M8 16.5 20 6" /></>)
