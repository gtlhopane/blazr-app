import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdmin } from "@/lib/supabase/admin"
import { generateInvoicePdf } from "@/lib/pdf-invoice"

function generateOrderNumber(sequence: number): string {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  return `BLZ-${yyyy}${mm}${dd}-${String(sequence).padStart(3, '0')}`
}

function getTodaySequence(): number {
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

    // Idempotency: check for existing pending order for this buyer in last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: existingOrder } = await supabase
      .from("wholesale_orders")
      .select("id, order_number")
      .eq("email", buyer_email)
      .eq("order_status", "pending")
      .gte("created_at", fiveMinAgo)
      .single()

    if (existingOrder) {
      return NextResponse.json({
        order_number: existingOrder.order_number,
        order_id: existingOrder.id,
        duplicate: true,
        message: "You already have a pending order. Check your dashboard.",
      })
    }

    const seq = getTodaySequence()
    const order_number = generateOrderNumber(seq)

    const subtotal = items.reduce((sum: number, item: any) =>
      sum + (item.quantity * item.unit_price), 0)
    const total = subtotal

    const { data: order, error: orderError } = await supabase
      .from("wholesale_orders")
      .insert({
        order_number,
        full_name: buyer_name,
        business_name: buyer_company || null,
        email: buyer_email,
        phone: buyer_phone,
        delivery_address: delivery_address || null,
        subtotal,
        total,
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

    const today = new Date().toLocaleDateString("en-ZA", { day: "2-digit", month: "long", year: "numeric" })
    const companyAddress = "PO Box 990035, Kibler Park, Johannesburg, 2053"

    // Build line items HTML
    const itemsRows = items.map((item: any) => {
      const name = item.strain_name || item.name || "Product"
      const qty = item.quantity
      const price = item.unit_price
      const line = qty * price
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#ddd;">${name}</td>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#aaa;text-align:center;">${qty}</td>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#aaa;text-align:right;">R${price.toLocaleString()}</td>
        <td style="padding:12px 0;border-bottom:1px solid #1e1e1e;font-size:14px;color:#fff;font-weight:600;text-align:right;">R${line.toLocaleString()}</td>
      </tr>`
    }).join("")

    const totalRow = `<tr>
      <td colspan="3" style="padding:16px 0 0 0;text-align:right;font-size:16px;font-weight:700;color:#fff;">TOTAL (ZAR)</td>
      <td style="padding:16px 0 0 0;text-align:right;font-size:22px;font-weight:900;color:#FAD03F;">R${total.toLocaleString()}</td>
    </tr>`

    const invoiceHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 24px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

      <!-- HEADER -->
      <tr><td style="padding:0 0 28px 0;border-bottom:2px solid #FAD03F;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="vertical-align:top;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:14px;vertical-align:top;">
                    <img src="https://blazr-app.vercel.app/logos/103058_Blazr_Flat_RT_R_02.png" width="48" height="48" style="display:block;border-radius:8px;" alt="Blazr"/>
                  </td>
                  <td>
                    <div style="font-size:22px;font-weight:900;color:#FAD03F;letter-spacing:-0.5px;">Blazr Wholesale</div>
                    <div style="font-size:12px;color:#555;margin-top:3px;">South Africa's Premier B2B Cannabis Platform</div>
                    <div style="font-size:11px;color:#444;margin-top:3px;">${companyAddress}</div>
                  </td>
                </tr>
              </table>
            </td>
            <td align="right" style="vertical-align:top;">
              <div style="font-size:28px;font-weight:900;color:#FAD03F;letter-spacing:-1px;">INVOICE</div>
              <div style="font-size:14px;color:#888;margin-top:4px;">#${order_number}</div>
              <div style="font-size:12px;color:#888;margin-top:4px;">${today}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- STATUS BADGE -->
      <tr><td style="padding:20px 0 0 0;">
        <span style="display:inline-block;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);border-radius:20px;padding:6px 16px;font-size:12px;font-weight:700;color:#4ade80;letter-spacing:1px;text-transform:uppercase;">✓ Order Confirmed</span>
      </td></tr>

      <!-- BILL TO / DELIVERY -->
      <tr><td style="padding:24px 0 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-right:20px;vertical-align:top;">
              <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Bill To</div>
              <div style="font-size:15px;font-weight:700;color:#fff;">${buyer_name}</div>
              ${buyer_company ? `<div style="font-size:13px;color:#aaa;margin-top:2px;">${buyer_company}</div>` : ""}
              <div style="font-size:13px;color:#aaa;margin-top:4px;">${buyer_email}</div>
              <div style="font-size:13px;color:#aaa;margin-top:2px;">${buyer_phone}</div>
            </td>
            <td width="50%" style="vertical-align:top;">
              <div style="font-size:11px;font-weight:700;color:#555;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:10px;">Delivery Address</div>
              <div style="font-size:13px;color:#ccc;line-height:1.6;">${delivery_address || "Not provided"}</div>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- LINE ITEMS -->
      <tr><td style="padding:24px 0 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
          <thead>
            <tr style="border-bottom:2px solid #FAD03F;">
              <th align="left" style="font-size:11px;font-weight:700;color:#666;letter-spacing:1px;text-transform:uppercase;padding:0 0 10px 0;">Product</th>
              <th align="center" style="font-size:11px;font-weight:700;color:#666;letter-spacing:1px;text-transform:uppercase;padding:0 0 10px 0;">Qty</th>
              <th align="right" style="font-size:11px;font-weight:700;color:#666;letter-spacing:1px;text-transform:uppercase;padding:0 0 10px 0;">Unit Price</th>
              <th align="right" style="font-size:11px;font-weight:700;color:#666;letter-spacing:1px;text-transform:uppercase;padding:0 0 10px 0;">Total</th>
            </tr>
          </thead>
          <tbody>${itemsRows}</tbody>
          <tfoot>${totalRow}</tfoot>
        </table>
      </td></tr>

      <!-- PAYMENT BLOCK -->
      <tr><td style="padding:32px 0 0 0;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(250,208,63,0.06);border:1px solid rgba(250,208,63,0.2);border-radius:12px;overflow:hidden;">
          <tr><td style="padding:20px 24px;">
            <div style="font-size:11px;font-weight:700;color:#FAD03F;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;">Payment Details</div>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:top;padding-right:32px;">
                  <table cellpadding="0" cellspacing="0">
                    <tr><td style="font-size:12px;color:#666;padding:3px 0;">Account Name</td><td style="font-size:13px;color:#fff;font-weight:600;padding:3px 0;text-align:right;">Blazr (Pty) Ltd</td></tr>
                    <tr><td style="font-size:12px;color:#666;padding:3px 0;">Bank</td><td style="font-size:13px;color:#fff;font-weight:600;padding:3px 0;text-align:right;">Nedbank</td></tr>
                    <tr><td style="font-size:12px;color:#666;padding:3px 0;">Account Number</td><td style="font-size:13px;color:#fff;font-weight:600;padding:3px 0;text-align:right;font-family:monospace;letter-spacing:1px;">1338261843</td></tr>
                    <tr><td style="font-size:12px;color:#666;padding:3px 0;">Branch Code</td><td style="font-size:13px;color:#fff;font-weight:600;padding:3px 0;text-align:right;font-family:monospace;letter-spacing:1px;">198765</td></tr>
                    <tr><td style="font-size:12px;color:#666;padding:3px 0;">SWIFT</td><td style="font-size:13px;color:#fff;font-weight:600;padding:3px 0;text-align:right;font-family:monospace;letter-spacing:1px;">NEDSZAJJ</td></tr>
                  </table>
                </td>
                <td style="vertical-align:top;border-left:1px solid rgba(250,208,63,0.15);padding-left:24px;">
                  <div style="font-size:11px;color:#666;margin-bottom:6px;text-transform:uppercase;letter-spacing:1px;">Payment Reference</div>
                  <div style="font-size:18px;font-weight:900;color:#FAD03F;font-family:monospace;letter-spacing:1px;">${order_number}</div>
                  <div style="font-size:12px;color:#666;margin-top:12px;">Send Proof of Payment to:</div>
                  <a href="mailto:wholesale@blazr.africa" style="font-size:13px;color:#FAD03F;text-decoration:none;font-weight:600;">wholesale@blazr.africa</a>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>

      <!-- FOOTER -->
      <tr><td style="padding:28px 0 0 0;text-align:center;">
        <div style="font-size:12px;color:#555;line-height:2;">Questions? WhatsApp <a href="https://wa.me/27663249083" style="color:#FAD03F;text-decoration:none;">+27 66 324 9083</a> · <a href="mailto:wholesale@blazr.africa" style="color:#FAD03F;text-decoration:none;">wholesale@blazr.africa</a></div>
        <div style="font-size:11px;color:#333;margin-top:10px;">Blazr Wholesale · Licensed wholesale cannabis platform · Cannabis for Private Purposes Act compliant</div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`

    // Generate PDF
    let pdfBase64 = ""
    try {
      pdfBase64 = await generateInvoicePdf({
        order_number,
        buyer_name,
        buyer_company: buyer_company || "",
        buyer_email,
        buyer_phone,
        delivery_address: delivery_address || "",
        total,
        items,
      })
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr)
    }

    const emailAttachment = pdfBase64 ? [{
      filename: `Invoice-${order_number}.pdf`,
      content: pdfBase64,
    }] : []

    // Send buyer email
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
          html: invoiceHtml,
          ...(emailAttachment.length > 0 && { attachments: emailAttachment }),
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
          subject: `New Order ${order_number} — ${buyer_name} (R${total.toLocaleString()})`,
          html: invoiceHtml,
          ...(emailAttachment.length > 0 && { attachments: emailAttachment }),
        }),
      })
    } catch (adminErr) {
      console.error("Admin email error:", adminErr)
    }

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number,
      total,
    })
  } catch (err) {
    console.error("Checkout error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
