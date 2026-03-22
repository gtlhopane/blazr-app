import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

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
      notes,
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

    // Insert into orders table
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        total: Math.round(total_price / 100),
        buyer_name,
        buyer_email,
        buyer_phone,
        buyer_company: buyer_company || null,
        delivery_address,
        notes: notes || null,
        invoice_number,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
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

    // Send emails via Resend
    try {
      const itemsList = items
        .map(
          (item: { name: string; quantity: number; unit_price: number }) =>
            `• ${item.name}: ${item.quantity} × R${(item.unit_price / 100).toFixed(0)} = R${((item.quantity * item.unit_price) / 100).toFixed(0)}`
        )
        .join("\n")

      const bankDetailsHtml = `
        <div style="background: rgba(250,208,63,0.08); border: 1px solid rgba(250,208,63,0.25); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #FAD03F; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Bank Transfer Details</h3>
          <table style="width: 100%; font-size: 14px;">
            <tr><td style="color: #888; padding: 4px 0;">Account Name</td><td style="text-align: right; color: #fff;">Blazr Wholesale</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Bank</td><td style="text-align: right; color: #fff;">FNB</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Account Number</td><td style="text-align: right; color: #fff; font-family: monospace;">1234567890</td></tr>
            <tr><td style="color: #888; padding: 4px 0;">Branch</td><td style="text-align: right; color: #fff; font-family: monospace;">250655</td></tr>
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
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${(total_price / 100).toLocaleString()}</span></p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Delivery Address</h3>
            <p style="margin: 0; font-size: 14px; color: #ccc;">${delivery_address}</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
            <pre style="margin: 0; font-size: 13px; color: #ccc; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          </div>

          ${bankDetailsHtml}

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
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${(total_price / 100).toLocaleString()}</span></p>
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
            ${notes ? `<p style="margin: 8px 0 0; font-size: 13px; color: #888;"><strong>Notes:</strong> ${notes}</p>` : ""}
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
            <pre style="margin: 0; font-size: 13px; color: #ccc; white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
          </div>

          <p style="color: #555; font-size: 12px; text-align: center; margin-top: 30px;">
            Blazr Wholesale Admin · Order System
          </p>
        </div>
      `

      // Send to buyer
      if (buyer_email && buyer_email.includes("@")) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_jJ1LjCLJ8QzQdELBqPZ4y1N8BmWdZ8YJ3p",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Blazr Wholesale <blazr@biomuti.co.za>",
            to: [buyer_email],
            subject: `Order Confirmed — ${invoice_number}`,
            html: buyerEmailHtml,
          }),
        })
      }

      // Send to admin
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer re_jJ1LjCLJ8QzQdELBqPZ4y1N8BmWdZ8YJ3p",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Blazr Wholesale <blazr@biomuti.co.za>",
          to: ["gtlhopane@gmail.com"],
          subject: `New Order ${invoice_number} — ${buyer_name} (R${(total_price / 100).toLocaleString()})`,
          html: adminEmailHtml,
        }),
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
