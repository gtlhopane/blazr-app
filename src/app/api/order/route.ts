import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"

function generateInvoiceNumber() {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const random = Math.floor(Math.random() * 9000) + 1000
  return `BLZR-${year}${month}-${random}`
}

// Category config — add new categories here when they exist
export const PRODUCT_CATEGORIES = {
  vapes: {
    label: "Vapes",
    icon: "💨",
    slug: "vapes",
    categoryId: "5c53f38c-4003-4971-93ae-797cf7cd0e57",
  },
  // Future categories can be added here:
  // edibles: { label: "Edibles", icon: "🍬", slug: "edibles", categoryId: "..." },
  // flower: { label: "Flower", icon: "🌿", slug: "flower", categoryId: "..." },
  // oils: { label: "Oils", icon: "💧", slug: "oils", categoryId: "..." },
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { buyer_name, buyer_email, buyer_phone, buyer_company, items, category = "vapes" } = body

    if (!buyer_name || !buyer_email || !buyer_phone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createSupabaseAdmin()
    const invoice_number = generateInvoiceNumber()
    const total_units = items.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0)
    const total_price = items.reduce((sum: number, item: { quantity: number; unit_price: number }) => sum + (item.quantity * item.unit_price), 0)
    const catInfo = PRODUCT_CATEGORIES[category as keyof typeof PRODUCT_CATEGORIES] || PRODUCT_CATEGORIES.vapes

    // Build notes with order metadata
    const itemSummary = items.map((i: { strain_name?: string; name?: string; quantity: number }) =>
      `${i.strain_name || i.name || "Item"}: ${i.quantity}`
    ).join(", ")

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        status: "pending",
        total: Math.round(total_price / 100),
        notes: `${catInfo.label} order | Invoice: ${invoice_number} | Units: ${total_units} | Items: ${itemSummary}`,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order insert error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Insert order items — category stored in notes field since schema doesn't have category col
    const orderItems = items.map((item: {
      strain_id?: string;
      product_id?: string;
      name?: string;
      strain_name?: string;
      quantity: number;
      unit_price: number;
    }) => ({
      order_id: order.id,
      product_id: item.product_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))

    await supabase.from("order_items").insert(orderItems)

    // Send email notification
    try {
      const itemsList = items.map((item: { strain_name?: string; name?: string; quantity: number; unit_price: number }) => {
        const itemName = item.strain_name || item.name || "Item"
        return `• ${itemName}: ${item.quantity} units × R${(item.unit_price / 100).toFixed(0)} = R${((item.quantity * item.unit_price) / 100).toFixed(0)}`
      }).join("\n")

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
          <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
            <h1 style="color: #FAD03F; margin: 0;">🌿 BioMuti / Blazr</h1>
            <p style="color: #888; margin: 4px 0 0; font-size: 14px;">Wholesale ${catInfo.label} Order</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h2 style="font-size: 16px; color: #FAD03F; margin: 0 0 12px;">New Order Received</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Invoice:</strong> <span style="color: #FAD03F; font-family: monospace;">${invoice_number}</span></p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${catInfo.icon} ${catInfo.label}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString("ZA", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Buyer Information</h3>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Name:</strong> ${buyer_name}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> ${buyer_email}</p>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Phone:</strong> ${buyer_phone}</p>
            ${buyer_company ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Company:</strong> ${buyer_company}</p>` : ""}
          </div>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h3 style="font-size: 14px; color: #888; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 1px;">Order Items</h3>
            <pre style="margin: 0; font-size: 13px; color: #ccc; white-space: pre-wrap;">${itemsList}</pre>
          </div>

          <div style="background: rgba(250,208,63,0.1); border: 1px solid rgba(250,208,63,0.3); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin: 6px 0;">
              <span style="color: #888;">Total Units</span>
              <span style="font-weight: bold;">${total_units} units</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 18px; margin: 8px 0 0; padding-top: 12px; border-top: 1px solid #333;">
              <span style="color: #fff; font-weight: bold;">Total</span>
              <span style="color: #FAD03F; font-weight: bold;">R${(total_price / 100).toLocaleString()}</span>
            </div>
          </div>

          <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
            BioMuti / Blazr Wholesale · www.blazr.africa · Contact: gtlhopane@gmail.com
          </p>
        </div>
      `

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": "Bearer re_jJ1LjCLJ8QzQdELBqPZ4y1N8BmWdZ8YJ3p",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Blazr Wholesale <blazr@biomuti.co.za>",
          to: ["gtlhopane@gmail.com"],
          subject: `New ${catInfo.label} Order ${invoice_number} — ${buyer_name} (${total_units} units)`,
          html: emailHtml,
        }),
      })

      // Confirmation to buyer
      if (buyer_email && buyer_email.includes("@")) {
        const buyerEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #111; color: #fff;">
            <div style="border-bottom: 2px solid #FAD03F; padding-bottom: 16px; margin-bottom: 24px;">
              <h1 style="color: #FAD03F; margin: 0;">🌿 BioMuti / Blazr</h1>
              <p style="color: #888; margin: 4px 0 0; font-size: 14px;">Wholesale Order Confirmation</p>
            </div>
            <div style="background: #1a1a1a; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <h2 style="font-size: 16px; color: #4ade80; margin: 0 0 12px;">✓ Order Received!</h2>
              <p style="margin: 4px 0; font-size: 14px; color: #ccc;">Thank you for your order, ${buyer_name}!</p>
              <p style="margin: 8px 0 4px; font-size: 14px;"><strong>Invoice:</strong> <span style="color: #FAD03F; font-family: monospace;">${invoice_number}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Order Total:</strong> <span style="color: #FAD03F; font-weight: bold;">R${(total_price / 100).toLocaleString()}</span></p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Total Units:</strong> ${total_units}</p>
              <p style="margin: 4px 0; font-size: 14px;"><strong>Category:</strong> ${catInfo.icon} ${catInfo.label}</p>
            </div>
            <p style="font-size: 14px; color: #ccc; margin-bottom: 20px;">
              We&apos;ll review your order and contact you at <strong>${buyer_phone}</strong> within 24 hours to confirm availability and delivery.
            </p>
            <p style="color: #666; font-size: 12px; text-align: center; margin-top: 30px;">
              BioMuti / Blazr Wholesale · www.blazr.africa
            </p>
          </div>
        `

        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": "Bearer re_jJ1LjCLJ8QzQdELBqPZ4y1N8BmWdZ8YJ3p",
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
    } catch (emailErr) {
      console.error("Email error:", emailErr)
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      invoice_number,
      category,
    })
  } catch (err) {
    console.error("Order error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
