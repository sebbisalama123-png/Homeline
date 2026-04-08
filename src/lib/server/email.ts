import { config } from 'dotenv'

config()

function getResendApiKey(context: unknown): string | null {
  const queue: unknown[] = [context]
  const seen = new Set<unknown>()

  while (queue.length > 0) {
    const current = queue.shift()
    if (!current || typeof current !== 'object' || seen.has(current)) continue
    seen.add(current)

    const record = current as Record<string, unknown>
    const env = record.env as Record<string, unknown> | undefined
    const key = env?.RESEND_API_KEY
    if (typeof key === 'string' && key.trim().length > 0) return key

    for (const value of Object.values(record)) {
      if (value && typeof value === 'object' && !seen.has(value)) {
        queue.push(value)
      }
    }
  }

  return process.env.RESEND_API_KEY ?? null
}

type OrderEmailData = {
  to: string
  customerName: string
  orderNumber: string
  items: Array<{
    productName: string
    quantity: number
    unitPriceUgx: number
    lineTotalUgx: number
  }>
  subtotalUgx: number
  deliveryFeeUgx: number
  totalUgx: number
  location: string
}

function formatUgx(amount: number): string {
  return `UGX ${amount.toLocaleString('en-UG')}`
}

function buildEmailHtml(data: OrderEmailData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;font-size:14px;color:#3d3529;">
          ${item.productName}
          <span style="color:#8a7a68;font-size:12px;"> × ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #f0ebe3;font-size:14px;color:#3d3529;text-align:right;white-space:nowrap;">
          ${formatUgx(item.lineTotalUgx)}
        </td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Order Confirmed — Hearth & Timber</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:'Outfit',ui-sans-serif,system-ui,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#8e5f35,#b48357);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#fff;letter-spacing:0.02em;">Hearth & Timber Uganda</p>
              <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.82);">Your order is confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#fffdf9;padding:32px;border-left:1px solid #ede6da;border-right:1px solid #ede6da;">

              <p style="margin:0 0 6px;font-size:13px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#785a3f;">Order number</p>
              <p style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1f1d19;letter-spacing:0.02em;">${data.orderNumber}</p>

              <p style="margin:0 0 20px;font-size:15px;color:#3d3529;line-height:1.6;">
                Hi <strong>${data.customerName}</strong>,<br/>
                Thank you for your order! Our team will call you shortly to confirm delivery to <strong>${data.location}</strong>. Payment is cash on delivery.
              </p>

              <!-- Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0ebe3;">
                ${itemRows}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
                <tr>
                  <td style="font-size:13px;color:#8a7a68;padding:4px 0;">Subtotal</td>
                  <td style="font-size:13px;color:#3d3529;text-align:right;">${formatUgx(data.subtotalUgx)}</td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#8a7a68;padding:4px 0;">Delivery</td>
                  <td style="font-size:13px;color:#3d3529;text-align:right;">${data.deliveryFeeUgx === 0 ? 'Free' : formatUgx(data.deliveryFeeUgx)}</td>
                </tr>
                <tr>
                  <td style="font-size:15px;font-weight:700;color:#1f1d19;padding:12px 0 4px;border-top:1px solid #ede6da;">Total (COD)</td>
                  <td style="font-size:15px;font-weight:700;color:#1f1d19;text-align:right;padding-top:12px;border-top:1px solid #ede6da;">${formatUgx(data.totalUgx)}</td>
                </tr>
              </table>

              <!-- Track CTA -->
              <div style="margin-top:28px;text-align:center;">
                <a href="https://hearthandtimber.ug/orders" style="display:inline-block;background:linear-gradient(120deg,#8e5f35,#b48357);color:#fff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:999px;">
                  Track Your Order
                </a>
              </div>

              <p style="margin:24px 0 0;font-size:13px;color:#8a7a68;text-align:center;line-height:1.6;">
                Your order number is <strong style="color:#3d3529;">${data.orderNumber}</strong>.<br/>
                Save it to track your delivery at any time.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f5f2ec;border:1px solid #ede6da;border-top:0;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#8a7a68;line-height:1.7;">
                Questions? WhatsApp us at <a href="https://wa.me/256704579980" style="color:#8e5f35;text-decoration:none;">+256 704 579 980</a><br/>
                or email <a href="mailto:studio@hearthandtimber.ug" style="color:#8e5f35;text-decoration:none;">studio@hearthandtimber.ug</a>
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#b8ab9d;">© ${new Date().getFullYear()} Hearth & Timber Uganda · Plot 12, Kololo, Kampala</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function sendOrderConfirmationEmail(
  context: unknown,
  data: OrderEmailData,
): Promise<void> {
  const apiKey = getResendApiKey(context)
  if (!apiKey) {
    console.warn(
      '[email] RESEND_API_KEY not set — skipping confirmation email.',
    )
    return
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Hearth & Timber Uganda <onboarding@resend.dev>',
      to: [data.to],
      subject: `Order confirmed — ${data.orderNumber}`,
      html: buildEmailHtml(data),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('[email] Resend error', response.status, body)
  }
}
