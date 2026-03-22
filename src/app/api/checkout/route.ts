import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"
import { generateInvoicePDF } from "@/lib/pdf/invoice"

function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 9000) + 1000
  return `BLZR-${year}${month}-${random}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      buyer_name,
      buyer_email,
      buyer_phone,
      buyer_company,
      delivery_address,
      notes: order_notes,
      items,
    } = body

    if (!buyer_name || !buyer_email || !buyer_phone || !delivery_address || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const invoice_number = generateInvoiceNumber()
    const total_price = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    )

    // Build rich notes field with all buyer/order info
    const itemsList = items
      .map(
        (item: { name: string; quantity: number; unit_price: number }) =>
          `${item.name}: ${item.quantity} × R${item.unit_price} = R${item.quantity * item.unit_price}`
      )
      .join(" | ")

    const notes = [
      `Invoice: ${invoice_number}`,
      `Buyer: ${buyer_name} | ${buyer_email} | ${buyer_phone}${buyer_company ? ` | ${buyer_company}` : ""}`,
      `Delivery: ${delivery_address}`,
      order_notes ? `Notes: ${order_notes}` : null,
      `Items: ${itemsList}`,
      `Total: R${total_price.toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("\n")

    // Insert into orders table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        total: Math.round(total_price), // stored in RANDs
        notes,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order", detail: orderError.message }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map((item: {
      product_id?: string
      name: string
      quantity: number
      unit_price: number
    }) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    await supabase.from("order_items").insert(orderItems)

    // Generate PDF invoice
    let pdfAttachment: { filename: string; content: string } | null = null
    try {
      const pdfBuffer = await generateInvoicePDF({
        invoiceNumber: invoice_number,
        buyerName: buyer_name,
        buyerEmail: buyer_email,
        buyerPhone: buyer_phone,
        buyerCompany: buyer_company,
        deliveryAddress: delivery_address,
        items: items.map((item: { name: string; quantity: number; unit_price: number; category?: string }) => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          category: item.category,
        })),
        total: Math.round(total_price),
      })
      const pdfBase64 = Buffer.from(pdfBuffer).toString("base64")
      pdfAttachment = {
        filename: `Invoice-${invoice_number}.pdf`,
        content: pdfBase64,
      }
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr)
      // Continue without PDF if generation fails
    }

    // Send emails via Resend
    try {
      const itemsHtmlList = items
        .map(
          (item: { name: string; quantity: number; unit_price: number }) =>
            `<tr><td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a;">${item.name}</td><td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a; text-align: center;">${item.quantity}</td><td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a; text-align: right;">R${item.unit_price}</td><td style="padding: 8px 0; border-bottom: 1px solid #2a2a2a; text-align: right; color: #FAD03F; font-weight: bold;">R${item.quantity * item.unit_price}</td></tr>`
        )
        .join("")

      const bankDetailsBlock = `
        <div style="background: rgba(250,208,63,0.08); border: 1px solid rgba(250,208,63,0.25); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #FAD03F; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Bank Transfer Details</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #888; padding: 4px 0;">Account Name</td><td style="text-align: right; color: #fff;">Blazr (Pty) Ltd</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Bank</td><td style="text-align: right; color: #fff;">Nedbank</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Account Number</td><td style="text-align: right; color: #fff; font-family: monospace;">1338261843</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Branch Code</td><td style="text-align: right; color: #fff; font-family: monospace;">198765</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">SWIFT Code</td><td style="text-align: right; color: #fff; font-family: monospace;">NEDSZAJJ</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Reference</td><td style="text-align: right; color: #FAD03F; font-weight: bold; font-family: monospace;">${invoice_number}</td></tr>
          </table>
          <p style="margin: 12px 0 0; font-size: 12px; color: #888;">
            Please send your Proof of Payment to <a href="mailto:orders@wholesale.blazr.africa" style="color: #FAD03F;">orders@wholesale.blazr.africa</a>
          </p>
        </div>
      `

      // Email to buyer
      const buyerEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
          <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #FAD03F; margin: 0; font-size: 24px;">🌿 Blazr Wholesale</h1>
            <p style="color: #888; margin: 4px 0 0; font-size: 14px;">Order Confirmation</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h2 style="font-size: 16px; color: #4ade80; margin: 0 0 12px;">✓ Order Received!</h2>
            <p style="margin: 4px 0; font-size: 14px;">Thank you for your order, <strong>${buyer_name}</strong>!</p>
            <p style="margin: 8px 0 4px; font-size: 14px;"><strong>Invoice:</strong> <span style="color: #FAD03F; font-family: monospace; font-weight: bold;">${invoice_number}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${total_price.toLocaleString()}</span></p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
            <p style="margin: 0; font-size: 14px; color: #ccc;">${delivery_address}</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="text-align: left; padding: 8px 0;">Product</th>
                  <th style="text-align: center; padding: 8px 0;">Qty</th>
                  <th style="text-align: right; padding: 8px 0;">Unit</th>
                  <th style="text-align: right; padding: 8px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtmlList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px 0 0; text-align: right; color: #fff; font-weight: bold; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0 0; text-align: right; color: #FAD03F; font-weight: bold; font-size: 16px;">R${total_price.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${bankDetailsBlock}

          <p style="font-size: 13px; color: #888; margin-bottom: 0;">
            We&apos;ll process your order and contact you at <strong>${buyer_phone}</strong> within 24 hours to confirm.
          </p>

          <p style="color: #555; font-size: 12px; text-align: center; margin-top: 30px;">
            Blazr Wholesale · <a href="https://wholesale.blazr.africa" style="color: #666;">wholesale.blazr.africa</a>
          </p>
        </div>
      `

      // Email to admin
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
          <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #FAD03F; margin: 0; font-size: 24px;">🌿 Blazr Wholesale</h1>
            <p style="color: #888; margin: 4px 0 0; font-size: 14px;">New Order Received</p>
          </div>

          <div style="background: rgba(250,208,63,0.08); border: 1px solid rgba(250,208,63,0.25); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h2 style="font-size: 16px; color: #FAD03F; margin: 0 0 12px;">New Order — Action Required</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Invoice:</strong> <span style="color: #FAD03F; font-family: monospace; font-weight: bold;">${invoice_number}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${total_price.toLocaleString()}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order ID:</strong> <span style="font-family: monospace;">${order.id}</span></p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Buyer Information</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${buyer_name}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${buyer_email}" style="color: #FAD03F;">${buyer_email}</a></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${buyer_phone}</p>
            ${buyer_company ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Company:</strong> ${buyer_company}</p>` : ""}
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
            <p style="margin: 0; font-size: 14px; color: #ccc;">${delivery_address}</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #888; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                  <th style="text-align: left; padding: 8px 0;">Product</th>
                  <th style="text-align: center; padding: 8px 0;">Qty</th>
                  <th style="text-align: right; padding: 8px 0;">Unit</th>
                  <th style="text-align: right; padding: 8px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtmlList}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px 0 0; text-align: right; color: #fff; font-weight: bold; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0 0; text-align: right; color: #FAD03F; font-weight: bold; font-size: 16px;">R${total_price.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p style="color: #555; font-size: 12px; text-align: center; margin-top: 30px;">
            Blazr Wholesale Admin · Order System
          </p>
        </div>
      `

      // Send buyer email
      if (buyer_email && buyer_email.includes("@")) {
        const emailPayload: Record<string, unknown> = {
          from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
          to: [buyer_email],
          subject: `Order Confirmed — ${invoice_number}`,
          html: buyerEmailHtml,
        }
        if (pdfAttachment) {
          emailPayload.attachments = [pdfAttachment]
        }
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailPayload),
        })
      }

      // Send admin email
      const adminEmailPayload: Record<string, unknown> = {
        from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
        to: ["gtlhopane@gmail.com"],
        subject: `New Order ${invoice_number} — ${buyer_name} (R${total_price.toLocaleString()})`,
        html: adminEmailHtml,
      }
      if (pdfAttachment) {
        adminEmailPayload.attachments = [pdfAttachment]
      }
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminEmailPayload),
      })
    } catch (emailErr) {
      console.error("Email error:", emailErr)
      // Don't fail the order if email fails
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      invoice_number,
    })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
