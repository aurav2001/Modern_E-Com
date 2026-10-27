import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Creates and returns a Nodemailer transporter instance if SMTP is configured.
 * Returns null if required credentials are not set in environment.
 */
export function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT) || 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const secure = process.env.SMTP_SECURE === 'false' ? false : port === 465

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false, // Prevents self-signed cert issues on shared hosting
    },
  })
}

const getSender = () => process.env.EMAIL_FROM || process.env.SMTP_USER || 'Rishikar Sports <no-reply@rishikarsports.com>'
const getAdminEmail = () => process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'rishikarsports@gmail.com'

/**
 * Verifies SMTP connection and logs status
 */
export async function verifySmtpConnection() {
  const transporter = getTransporter()
  if (!transporter) {
    console.log('[Mailer] SMTP credentials not fully configured in .env. Email dispatch disabled.')
    return false
  }

  try {
    await transporter.verify()
    console.log('✅ [Mailer] SMTP transporter successfully connected.')
    return true
  } catch (error) {
    console.warn('⚠️ [Mailer] SMTP verification failed:', error.message)
    return false
  }
}

/**
 * Send order confirmation to customer and alert to admin
 */
export async function sendOrderConfirmationEmail(order) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[Mailer] Skipping email for order ${order.id}: SMTP not configured`)
    return
  }

  const sender = getSender()
  const adminEmail = getAdminEmail()
  const customerEmail = order?.customer?.email?.trim()

  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; font-size: 14px; color: #1e293b;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 12px; color: #64748b;">
            Size: ${item.size || 'Standard'} | Fabric: ${item.fabric || 'Standard'} | Color: ${item.color || 'N/A'}
          </span>
        </td>
        <td style="padding: 12px; text-align: center; font-size: 14px; color: #1e293b;">
          ${item.qty || 1}
        </td>
        <td style="padding: 12px; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">
          ₹${Number(item.price) * (item.qty || 1)}
        </td>
      </tr>
    `
    )
    .join('')

  // 1. Customer Email (if provided)
  if (customerEmail) {
    const customerMailOptions = {
      from: sender,
      to: customerEmail,
      subject: `Order Confirmed: #${order.id} - Rishikar Sports`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
          <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">RISHIKAR SPORTS</h1>
            <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Thank you for your order!</p>
          </div>

          <div style="padding: 24px;">
            <p style="font-size: 16px; color: #334155;">Hello <strong>${order.customer?.name || 'Customer'}</strong>,</p>
            <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
              We have received your order <strong>#${order.id}</strong>. Our manufacturing and packing team is now preparing your sports gear.
            </p>

            <div style="background: #f8fafc; border-radius: 6px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 6px;">Order ID:</td>
                  <td style="text-align: right; font-weight: bold; color: #0f172a;">${order.id}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 6px;">Payment Method:</td>
                  <td style="text-align: right; font-weight: bold; color: #0f172a;">${order.paymentMethod || 'COD'}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Shipping To:</td>
                  <td style="text-align: right; color: #334155;">${order.customer?.address || ''}, ${order.customer?.city || ''} (${order.customer?.pincode || ''})</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 16px; color: #0f172a; margin-top: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background: #f1f5f9; text-align: left; font-size: 12px; color: #64748b;">
                  <th style="padding: 8px 12px;">ITEM</th>
                  <th style="padding: 8px 12px; text-align: center;">QTY</th>
                  <th style="padding: 8px 12px; text-align: right;">PRICE</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
              <table style="width: 100%; font-size: 14px; line-height: 1.8;">
                <tr>
                  <td style="color: #64748b;">Subtotal:</td>
                  <td style="text-align: right; color: #0f172a;">₹${order.subtotal}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td style="color: #16a34a;">Discount:</td>
                  <td style="text-align: right; color: #16a34a;">-₹${order.discount}</td>
                </tr>` : ''}
                <tr>
                  <td style="color: #64748b;">Delivery Fee:</td>
                  <td style="text-align: right; color: #0f172a;">${order.shippingFee === 0 ? 'FREE' : '₹' + order.shippingFee}</td>
                </tr>
                <tr style="font-size: 16px; font-weight: bold; border-top: 1px solid #cbd5e1;">
                  <td style="padding-top: 8px; color: #0f172a;">Total:</td>
                  <td style="padding-top: 8px; text-align: right; color: #d9232d;">₹${order.total}</td>
                </tr>
              </table>
            </div>
          </div>

          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">Need help? Call/WhatsApp: +91 91225 55800 / +91 90066 33948</p>
            <p style="margin: 4px 0 0;">Rishikar Sports - Customised Teamwear & Sports Apparel</p>
          </div>
        </div>
      `,
    }

    transporter.sendMail(customerMailOptions).catch((err) => {
      console.warn(`[Mailer] Error sending order email to customer (${customerEmail}):`, err.message)
    })
  }

  // 2. Admin Alert Email
  if (adminEmail) {
    const adminMailOptions = {
      from: sender,
      to: adminEmail,
      subject: `🚨 New Order Alert: #${order.id} (₹${order.total}) - ${order.customer?.name || 'Customer'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Order Received!</h2>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Total Amount:</strong> ₹${order.total} (${order.paymentMethod || 'COD'})</p>
          <p><strong>Customer:</strong> ${order.customer?.name} (<a href="tel:${order.customer?.phone}">${order.customer?.phone}</a> | ${order.customer?.email || 'No email'})</p>
          <p><strong>Shipping Address:</strong> ${order.customer?.address || ''}, ${order.customer?.city || ''}, ${order.customer?.state || ''} - ${order.customer?.pincode || ''}</p>
          ${order.notes ? `<p><strong>Notes:</strong> ${order.notes}</p>` : ''}
          
          <h3>Items (${order.items?.length || 0}):</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f1f5f9; text-align: left; font-size: 13px;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      `,
    }

    transporter.sendMail(adminMailOptions).catch((err) => {
      console.warn(`[Mailer] Error sending admin order notification:`, err.message)
    })
  }
}

/**
 * Send bulk customization / jersey enquiry notification to Admin and Customer
 */
export async function sendEnquiryEmail(enquiry) {
  const transporter = getTransporter()
  if (!transporter) {
    console.log(`[Mailer] Skipping email for enquiry ${enquiry.id}: SMTP not configured`)
    return
  }

  const sender = getSender()
  const adminEmail = getAdminEmail()
  const customerEmail = enquiry?.email?.trim()

  // 1. Notify Admin
  if (adminEmail) {
    const adminMailOptions = {
      from: sender,
      to: adminEmail,
      subject: `🎯 New Custom Jersey Enquiry: ${enquiry.teamName || enquiry.name} (${enquiry.quantity} pcs)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">New Bulk Customization Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 6px; font-weight: bold; width: 35%;">Enquiry ID:</td><td style="padding: 6px;">${enquiry.id}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Customer Name:</td><td style="padding: 6px;">${enquiry.name}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Phone:</td><td style="padding: 6px;"><a href="tel:${enquiry.phone}">${enquiry.phone}</a></td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Email:</td><td style="padding: 6px;">${enquiry.email || 'N/A'}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Sport:</td><td style="padding: 6px;">${enquiry.sport}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Team Name:</td><td style="padding: 6px;">${enquiry.teamName}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Quantity:</td><td style="padding: 6px;">${enquiry.quantity} Units</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Fabric Preference:</td><td style="padding: 6px;">${enquiry.fabricPreference}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Budget/Piece:</td><td style="padding: 6px;">${enquiry.budgetPerPiece}</td></tr>
            <tr><td style="padding: 6px; font-weight: bold;">Notes/Requirements:</td><td style="padding: 6px;">${enquiry.notes || 'None'}</td></tr>
          </table>
        </div>
      `,
    }

    transporter.sendMail(adminMailOptions).catch((err) => {
      console.warn(`[Mailer] Error sending enquiry alert to admin:`, err.message)
    })
  }

  // 2. Customer Acknowledgment
  if (customerEmail) {
    const customerMailOptions = {
      from: sender,
      to: customerEmail,
      subject: `We have received your custom kit enquiry! - Rishikar Sports`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px;">
          <h2 style="color: #0f172a; margin-top: 0;">Hello ${enquiry.name},</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.5;">
            Thank you for reaching out to <strong>Rishikar Sports</strong> for your team kit customization (<strong>${enquiry.teamName}</strong>, ${enquiry.quantity} pcs).
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Our design and fabric specialist will review your request and get in touch with you shortly at <strong>${enquiry.phone}</strong> with sample designs and quotation.
          </p>
          <div style="background: #f1f5f9; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #334155;">
            <strong>Reference ID:</strong> ${enquiry.id}<br/>
            <strong>Sport:</strong> ${enquiry.sport} | <strong>Quantity:</strong> ${enquiry.quantity}
          </div>
          <p style="margin-top: 24px; font-size: 13px; color: #64748b;">
            Warm regards,<br/>
            <strong>Rishikar Sports Team</strong>
          </p>
        </div>
      `,
    }

    transporter.sendMail(customerMailOptions).catch((err) => {
      console.warn(`[Mailer] Error sending customer enquiry acknowledgment:`, err.message)
    })
  }
}

/**
 * Send welcome email to newly registered customer
 */
export async function sendWelcomeEmail(user) {
  const transporter = getTransporter()
  if (!transporter || !user?.email) {
    return
  }

  const sender = getSender()
  const mailOptions = {
    from: sender,
    to: user.email,
    subject: `Welcome to Rishikar Sports, ${user.name}! 🏏`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background: #0f172a; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">RISHIKAR SPORTS</h1>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 14px;">Bihar's Premier Sports Apparel & Uniforms</p>
        </div>
        <div style="padding: 24px; color: #334155; font-size: 15px; line-height: 1.6;">
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Welcome to the Rishikar Sports family! Your account has been successfully created.</p>
          <p>You can now easily track orders, browse customized team jerseys, athletic wear, and enjoy special tournament rates.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://rishikarsports.com" style="background: #d9232d; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Explore Collection</a>
          </div>
        </div>
      </div>
    `,
  }

  transporter.sendMail(mailOptions).catch((err) => {
    console.warn(`[Mailer] Error sending welcome email to ${user.email}:`, err.message)
  })
}
