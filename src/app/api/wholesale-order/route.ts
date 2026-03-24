import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

function generateOrderNumber(sequence: number): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `BLZ-${yyyy}${mm}${dd}-${String(sequence).padStart(3, '0')}`
}

function getTodaySequence(): number {
  // Simplified — in production use a database sequence
  return Math.floor(Math.random() * 900) + 100
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { buyer_name, buyer_email, buyer_phone, buyer_company, delivery_address, notes, items, category = "vapes" } = body

    if (!buyer_name || !buyer_email || !buyer_phone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()

    // Generate order number
    const seq = getTodaySequence()
    const order_number = generateOrderNumber(seq)

    const subtotal = items.reduce((sum: number, item: any) =>
      sum + (item.quantity * item.unit_price), 0)
    const total = subtotal  // no tax for now

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("wholesale_orders")
      .insert({
        order_number,
        full_name: buyer_name,
        business_name: buyer_company || null,
        email: buyer_email,
        phone: buyer_phone,
        delivery_address: delivery_address || null,
        subtotal: Math.round(subtotal / 100),
        total: Math.round(total / 100),
        order_status: "pending",
        payment_status: "awaiting_pop",
        notes: notes || null,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order", detail: orderError.message }, { status: 500 })
    }

    // Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_name: item.strain_name || item.name || "Product",
      category: item.category || category,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase
      .from("wholesale_order_items")
      .insert(orderItems)

    if (itemsError) {
      console.error("Order items error:", itemsError)
    }

    // Build email HTML
    const itemsList = items.map((item: any) => {
      const name = item.strain_name || item.name || "Product"
      const qty = item.quantity
      const price = item.unit_price / 100
      const line = qty * price
      return `• ${name}: ${qty} × R${price.toFixed(0)} = R${line.toFixed(0)}`
    }).join("\n")

    const bankDetails = `
Bank: Nedbank
Account Name: Blazr (Pty) Ltd
Account Number: 1338261843
Branch Code: 198765
SWIFT: NEDSZAJJ
Reference: ${order_number}
    `.trim()

    // Send buyer confirmation email
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
          to: [buyer_email],
          subject: `Order Confirmed — ${order_number}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#111;color:#fff;">
              <div style="border-bottom:2px solid #FAD03F;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#FAD03F;margin:0;">🌿 Blazr Wholesale</h1>
                <p style="color:#888;margin:4px 0 0;">Order Confirmation</p>
              </div>
              <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h2 style="color:#4ade80;font-size:16px;margin:0 0 12px;">✓ Order Received!</h2>
                <p style="margin:4px 0;font-size:14px;">Thank you, <strong>${buyer_name}</strong>!</p>
                <p style="margin:8px 0 4px;font-size:14px;"><strong>Order Number:</strong> <span style="color:#FAD03F;font-family:monospace;font-size:16px;">${order_number}</span></p>
                <p style="margin:4px 0;font-size:14px;"><strong>Total:</strong> <span style="color:#FAD03F;font-size:18px;font-weight:bold;">R${(total/100).toLocaleString()}</span></p>
              </div>
              <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="color:#888;font-size:12px;margin:0 0 12px;text-transform:uppercase;">Order Items</h3>
                <pre style="margin:0;font-size:13px;color:#ccc;white-space:pre-wrap;">${itemsList}</pre>
              </div>
              <div style="background:rgba(250,208,63,0.08);border:1px solid rgba(250,208,63,0.25);border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="color:#FAD03F;font-size:14px;margin:0 0 12px;">Payment Instructions</h3>
                <pre style="margin:0;font-size:13px;color:#ccc;white-space:pre-wrap;">${bankDetails}</pre>
                <p style="margin:12px 0 0;font-size:12px;color:#888;">Please use <strong style="color:#FAD03F">${order_number}</strong> as payment reference.</p>
              </div>
              <p style="font-size:13px;color:#888;">Questions? WhatsApp us on +27 66 324 9083</p>
            </div>
          `,
        }),
      })
    } catch (emailErr) {
      console.error("Buyer email error:", emailErr)
    }

    // Send admin email
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer re_cnnve3Ua_M5k1mJ4hBLLWyyiMD52Yv8xL",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Blazr Wholesale <blazr@wholesale.blazr.africa>",
          to: ["wholesale@blazr.africa"],
          subject: `New Order ${order_number} — ${buyer_name} (R${(total/100).toLocaleString()})`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#111;color:#fff;">
              <div style="border-bottom:2px solid #FAD03F;padding-bottom:16px;margin-bottom:24px;">
                <h1 style="color:#FAD03F;margin:0;">🌿 Blazr Wholesale</h1>
                <p style="color:#888;margin:4px 0 0;">New Order — Action Required</p>
              </div>
              <div style="background:rgba(250,208,63,0.08);border:1px solid rgba(250,208,63,0.25);border-radius:12px;padding:20px;margin-bottom:20px;">
                <h2 style="color:#FAD03F;font-size:16px;margin:0 0 12px;">New Order Received</h2>
                <p style="margin:4px 0;font-size:14px;"><strong>Order:</strong> <span style="color:#FAD03F;font-family:monospace;">${order_number}</span></p>
                <p style="margin:4px 0;font-size:14px;"><strong>Total:</strong> <span style="color:#FAD03F;font-size:18px;font-weight:bold;">R${(total/100).toLocaleString()}</span></p>
              </div>
              <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="color:#888;font-size:12px;margin:0 0 12px;">Buyer</h3>
                <p style="margin:4px 0;font-size:14px;"><strong>Name:</strong> ${buyer_name}</p>
                <p style="margin:4px 0;font-size:14px;"><strong>Email:</strong> <a href="mailto:${buyer_email}" style="color:#FAD03F;">${buyer_email}</a></p>
                <p style="margin:4px 0;font-size:14px;"><strong>Phone:</strong> ${buyer_phone}</p>
                ${buyer_company ? `<p style="margin:4px 0;font-size:14px;"><strong>Company:</strong> ${buyer_company}</p>` : ""}
                ${delivery_address ? `<p style="margin:4px 0;font-size:14px;"><strong>Delivery:</strong> ${delivery_address}</p>` : ""}
              </div>
              <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
                <h3 style="color:#888;font-size:12px;margin:0 0 12px;">Items</h3>
                <pre style="margin:0;font-size:13px;color:#ccc;white-space:pre-wrap;">${itemsList}</pre>
              </div>
            </div>
          `,
        }),
      })
    } catch (adminErr) {
      console.error("Admin email error:", adminErr)
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number,
      total: Math.round(total / 100),
    })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
