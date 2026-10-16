import { Link, useParams } from 'react-router-dom'
import { useStore } from '../context/StoreContext'
import { formatPrice, deliveryDate } from '../lib/utils'
import { Check } from '../components/Icons'

const PAY = { upi: 'UPI', card: 'Card', cod: 'Cash on delivery' }

export default function OrderSuccess() {
  const { id } = useParams()
  const { orders } = useStore()
  const order = orders.find((o) => o.id === id)

  if (!order) {
    return (
      <div className="container success">
        <h1>Order not found</h1>
        <p className="muted">We could not find an order with ID {id} on this device.</p>
        <div className="success__actions"><Link to="/account/orders" className="btn btn--primary">My orders</Link><Link to="/shop" className="btn btn--ghost">Continue shopping</Link></div>
      </div>
    )
  }

  return (
    <div className="container success">
      <div className="success__icon"><Check /></div>
      <span className="eyebrow">Order confirmed</span>
      <h1>Thank you, {order.address.name.split(' ')[0]}!</h1>
      <p className="muted">Your order <b>#{order.id}</b> is placed. A confirmation has been sent to {order.email}.</p>
      <div className="success__box">
        <div className="success__grid">
          <div><b>Order ID</b>#{order.id}</div>
          <div><b>Payment</b>{PAY[order.payment]}</div>
          <div><b>Total</b>{formatPrice(order.total)}</div>
          <div><b>Expected by</b>{deliveryDate(5)}</div>
        </div>
        <div className="mini-lines" style={{ maxHeight: 'none' }}>
          {order.items.map((l) => (
            <div className="mini-line" key={l.key}>
              <img src={l.image} alt="" />
              <div><b>{l.name}</b><span>{[l.color, l.size?.replace('UK-', 'UK ')].filter(Boolean).join(' · ')} · Qty {l.qty}</span></div>
              <b>{formatPrice(l.price * l.qty)}</b>
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, fontSize: 14 }}>
          <b>Delivering to</b><br />
          <span className="muted">{order.address.name}, {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}, {order.address.state} – {order.address.pincode} · {order.address.phone}</span>
        </div>
      </div>
      <div className="success__actions">
        <Link to="/account/orders" className="btn btn--primary">Track order</Link>
        <Link to="/shop" className="btn btn--ghost">Continue shopping</Link>
      </div>
    </div>
  )
}
