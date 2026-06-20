import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || process.env.COMPANY_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { customerName, customerEmail, orderNumber, items, subtotal, shippingCost, total, deliveryAddress, state, estimatedDelivery } = await request.json()

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email is required' },
        { status: 400 }
      )
    }

    const itemsHTML = items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">
            ${item.name}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            ₦${item.price.toLocaleString()}
          </td>
        </tr>
      `
      )
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f8fafc;
            }
            .header {
              background: #0ea5e9;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 20px;
            }
            .order-info {
              margin: 20px 0;
              padding: 15px;
              background: #f1f5f9;
              border-radius: 8px;
            }
            .order-info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #0ea5e9;
              color: white;
              padding: 10px;
              text-align: left;
            }
            .footer {
              background: #f1f5f9;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-radius: 0 0 8px 8px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              border-top: 2px solid #0ea5e9;
              border-bottom: 2px solid #0ea5e9;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
            }
            .summary-total {
              font-size: 18px;
              font-weight: bold;
              color: #0ea5e9;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Order Confirmation</h1>
              <p>Thank you for your purchase!</p>
            </div>

            <div class="content">
              <p>Hi ${customerName},</p>
              
              <p>Your order has been confirmed. Here are the details:</p>

              <div class="order-info">
                <p><strong>Order Number:</strong> ${orderNumber}</p>
                <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</p>
                <p><strong>Estimated Delivery:</strong> ${estimatedDelivery}</p>
              </div>

              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHTML}
                </tbody>
              </table>

              <div class="summary">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span>₦${subtotal.toLocaleString()}</span>
                </div>
                <div class="summary-row">
                  <span>Shipping:</span>
                  <span>₦${shippingCost.toLocaleString()}</span>
                </div>
                <div class="summary-row summary-total">
                  <span>Total:</span>
                  <span>₦${total.toLocaleString()}</span>
                </div>
              </div>

              <h3>Delivery Address</h3>
              <div class="order-info">
                <p>${deliveryAddress}</p>
                <p>${state}, Nigeria</p>
              </div>

              <p>We'll send you a tracking number as soon as your order ships.</p>
              
              <p>If you have any questions, please reply to this email or contact our support team.</p>

              <p>Best regards,<br/>NOVA GADGETS Team</p>
            </div>

            <div class="footer">
              <p>© 2026 NOVA GADGETS. All rights reserved.</p>
              <p>For Video Editors</p>
            </div>
          </div>
        </body>
      </html>
    `

    const result = await transporter.sendMail({
      from: process.env.COMPANY_EMAIL || 'noreply@novagadgets.com',
      to: customerEmail,
      subject: `Order Confirmation - Order #${orderNumber}`,
      html: htmlContent,
      text: `Order Confirmation\n\nOrder Number: ${orderNumber}\nTotal: ₦${total.toLocaleString()}\n\nThank you for your purchase!`,
    })

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    })
  } catch (error) {
    console.error('[v0] Email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email', details: String(error) },
      { status: 500 }
    )
  }
}
