import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0")
}

async function generateOrderNumber(supabase: ReturnType<typeof createSupabaseAdmin>) {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const dateStr = `${year}${month}${day}` // e.g. "20260324"

  // Count existing orders for today
  const from = `${dateStr}T00:00:00.000Z`
  const to = `${dateStr}T23:59:59.999Z`

  const { count, error } = await supabase
    .from("wholesale_orders")
    .select("order_number", { count: "exact", head: true })
    .gte("created_at", from)
    .lte("created_at", to)

  if (error) {
    console.error("Order number count error:", error)
    // Fallback: just use a random suffix
    const seq = Math.floor(Math.random() * 900) + 100
    return `BLZ-${dateStr}-${pad(seq)}`
  }

  const seq = (count ?? 0) + 1
  return `BLZ-${dateStr}-${pad(seq)}`
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

    // ── Generate order number ──────────────────────────────────────────────────
    const order_number = await generateOrderNumber(supabase)

    // ── Calculate totals ───────────────────────────────────────────────────────
    const subtotal = items.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + (item.quantity || 1) * (item.unit_price || 0),
      0
    )
    const total = subtotal // shipping TBD — stored in RANDs

    // ── Insert order ──────────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from("wholesale_orders")
      .insert({
        order_number,
        full_name: buyer_name,
        business_name: buyer_company || null,
        email: buyer_email,
        phone: buyer_phone,
        delivery_address,
        subtotal,
        total,
        order_status: "pending",
        payment_status: "awaiting_pop",
        notes: order_notes || null,
      })
      .select("id, order_number")
      .single()

    if (orderError) {
      console.error("Order insert error:", orderError)
      return NextResponse.json(
        { error: "Failed to create order", detail: orderError.message },
        { status: 500 }
      )
    }

    // ── Insert order items ─────────────────────────────────────────────────────
    const orderItems = items.map((item: {
      product_id?: string
      name: string
      category?: string
      quantity: number
      unit_price: number
    }) => ({
      order_id: order.id,
      product_name: item.name,
      category: item.category || null,
      quantity: item.quantity || 1,
      unit_price: item.unit_price || 0,
      line_total: (item.quantity || 1) * (item.unit_price || 0),
    }))

    const { error: itemsError } = await supabase
      .from("wholesale_order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Order items insert error:", itemsError)
    }

    // ── Send emails ────────────────────────────────────────────────────────────
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
            <tr><td style="color: #888; padding: 4px 0;">Reference</td><td style="text-align: right; color: #FAD03F; font-weight: bold; font-family: monospace;">${order_number}</td></tr>
          </table>
          <p style="margin: 12px 0 0; font-size: 12px; color: #888;">
            Please use <strong style="color:#FAD03F">${order_number}</strong> as your payment reference.<br/>
            Send Proof of Payment to <a href="mailto:wholesale@blazr.africa" style="color: #FAD03F;">wholesale@blazr.africa</a>
          </p>
        </div>
      `

      // ── Buyer email ─────────────────────────────────────────────────────────
      if (buyer_email && buyer_email.includes("@")) {
        const buyerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
            <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
              <h1 style="color: #FAD03F; margin: 0; font-size: 24px;">🌿 Blazr Wholesale</h1>
              <p style="color: #888; margin: 4px 0 0; font-size: 14px;">Order Confirmation</p>
            </div>

            <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;">
              <h2 style="font-size: 16px; color: #4ade80; margin: 0 0 12px;">✓ Order Received!</h2>
              <p style="margin: 4px 0; font-size: 14px;">Thank you for your order, <strong>${buyer_name}</strong>!</p>
              <p style="margin: 8px 0 4px; font-size: 14px;"><strong>Order Number:</strong> <span style="color: #FAD03F; font-family: monospace; font-weight: bold;">${order_number}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${total.toLocaleString()}</span></p>
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
                <tbody>${itemsHtmlList}</tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 12px 0 0; text-align: right; color: #fff; font-weight: bold; font-size: 16px;">Total</td>
                    <td style="padding: 12px 0 0; text-align: right; color: #FAD03F; font-weight: bold; font-size: 16px;">R${total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            ${bankDetailsBlock}

            <p style="font-size: 13px; color: #888; margin-bottom: 0;">
              We&apos;ll review your order and contact you at <strong>${buyer_phone}</strong> within 24 hours to confirm.
            </p>
            <p style="font-size: 13px; color: #888; margin-top: 8px;">
              Questions? WhatsApp us: <a href="https://wa.me/27663249083" style="color: #FAD03F;">+27 66 324 9083</a>
            </p>

            <p style="color: #555; font-size: 12px; text-align: center; margin-top: 30px;">
              Blazr Wholesale · <a href="https://wholesale.blazr.africa" style="color: #666;">wholesale.blazr.africa</a>
            </p>
          </div>
        `

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
            to: [buyer_email],
            subject: `Order Confirmed — ${order_number}`,
            html: buyerEmailHtml,
          }),
        })
      }

      // ── Admin email ─────────────────────────────────────────────────────────
      const adminEmailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
          <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #FAD03F; margin: 0; font-size: 24px;">🌿 Blazr Wholesale</h1>
            <p style="color: #888; margin: 4px 0 0; font-size: 14px;">New Order Received</p>
          </div>

          <div style="background: rgba(250,208,63,0.08); border: 1px solid rgba(250,208,63,0.25); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h2 style="font-size: 16px; color: #FAD03F; margin: 0 0 12px;">New Order — Action Required</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Number:</strong> <span style="color: #FAD03F; font-family: monospace; font-weight: bold;">${order_number}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold; font-size: 18px;">R${total.toLocaleString()}</span></p>
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
              <tbody>${itemsHtmlList}</tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 12px 0 0; text-align: right; color: #fff; font-weight: bold; font-size: 16px;">Total</td>
                  <td style="padding: 12px 0 0; text-align: right; color: #FAD03F; font-weight: bold; font-size: 16px;">R${total.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          ${order_notes ? `<div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px; border: 1px solid #2a2a2a;"><h3 style="font-size: 14px; color: #888; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Notes</h3><p style="margin:0; font-size:14px; color:#ccc;">${order_notes}</p></div>` : ""}

          <p style="color: #555; font-size: 12px; text-align: center; margin-top: 30px;">
            Blazr Wholesale Admin · Order System
          </p>
        </div>
      `

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
          to: ["wholesale@blazr.africa"],
          subject: `New Order ${order_number} — ${buyer_name} (R${total.toLocaleString()})`,
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
      order_number,
    })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
