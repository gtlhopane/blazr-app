/**
 * Generate a branded Blazr invoice PDF using pdfkit.
 * Pure Node.js — works on Vercel serverless.
 */
import PDFDocument from "pdfkit"
import { LOGO_BASE64 } from "./logo-b64"

export function generateInvoicePdf(data: {
  order_number: string
  buyer_name: string
  buyer_company: string
  buyer_email: string
  buyer_phone: string
  delivery_address: string
  total: number
  date?: string
  items: Array<{ name: string; strain_name?: string; quantity: number; unit_price: number }>
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const doc = new PDFDocument({ margin: 50, size: "A4" })

    doc.on("data", (chunk: Buffer) => chunks.push(chunk))
    doc.on("end", () => resolve(Buffer.concat(chunks).toString("base64")))
    doc.on("error", reject)

    const YELLOW = "#FAD03F"
    const WHITE = "#FFFFFF"
    const LIGHT = "#AAAAAA"
    const DARK = "#555555"
    const BG = "#0A0A0A"

    const {
      order_number, buyer_name, buyer_company,
      buyer_email, buyer_phone, delivery_address,
      total, date, items,
    } = data
    const today = date || new Date().toLocaleDateString("en-ZA", {
      day: "2-digit", month: "long", year: "numeric",
    })

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(BG)

    // Header bar + yellow divider
    const headerY = 40
    doc.rect(0, 0, doc.page.width, 90).fill(BG)
    doc.rect(0, 88, doc.page.width, 2).fill(YELLOW)

    // Logo
    try {
      doc.image(Buffer.from(LOGO_BASE64, "base64"), 50, headerY, { width: 48, height: 48 })
    } catch {
      doc.rect(50, headerY, 48, 48).fillAndStroke(YELLOW, YELLOW)
      doc.fillColor("#111").fontSize(28).font("Helvetica-Bold")
        .text("B", 50, headerY + 8, { width: 48, align: "center" })
      doc.fillColor(WHITE)
    }

    // Company info
    doc.fillColor(YELLOW).fontSize(20).font("Helvetica-Bold")
      .text("Blazr Wholesale", 110, headerY + 4, { width: 280 })
    doc.fillColor(DARK).fontSize(9).font("Helvetica")
      .text("South Africa's Premier B2B Cannabis Platform", 110, headerY + 28)
      .text("PO Box 990035, Kibler Park, Johannesburg, 2053", 110, headerY + 42)

    // INVOICE heading
    doc.fillColor(YELLOW).fontSize(28).font("Helvetica-Bold")
      .text("INVOICE", doc.page.width - 50, headerY + 4, { width: 200, align: "right" })
    doc.fillColor(LIGHT).fontSize(11).font("Helvetica")
      .text(`#${order_number}`, doc.page.width - 50, headerY + 36, { width: 200, align: "right" })
      .text(today, doc.page.width - 50, headerY + 50, { width: 200, align: "right" })

    // Status badge
    const badgeY = 120
    doc.roundedRect(50, badgeY, 160, 28, 14)
      .fillAndStroke("rgba(74,222,128,0.15)", "rgba(74,222,128,0.4)")
    doc.fillColor("#4ade80").fontSize(10).font("Helvetica-Bold")
      .text("✓  ORDER CONFIRMED", 62, badgeY + 8, { width: 136 })

    // Bill To / Delivery
    const billY = 165
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("BILL TO", 50, billY)
    doc.fillColor(WHITE).fontSize(13).font("Helvetica-Bold").text(buyer_name, 50, billY + 16)
    if (buyer_company) {
      doc.fillColor(LIGHT).fontSize(11).font("Helvetica").text(buyer_company, 50, billY + 34)
    }
    doc.fillColor(LIGHT).fontSize(10).font("Helvetica")
      .text(buyer_email, 50, billY + (buyer_company ? 50 : 34))
      .text(buyer_phone, 50, billY + (buyer_company ? 64 : 48))

    const midX = doc.page.width / 2 + 20
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold").text("DELIVERY ADDRESS", midX, billY)
    doc.fillColor(LIGHT).fontSize(11).font("Helvetica")
      .text(delivery_address || "Not provided", midX, billY + 16, { width: 240 })

    // Divider
    doc.rect(50, billY + 80, doc.page.width - 100, 1).fill("#1e1e1e")

    // Table
    const tableY = billY + 100
    doc.fillColor(DARK).fontSize(9).font("Helvetica-Bold")
    const col1 = 50
    const col2 = doc.page.width - 200
    const col3 = doc.page.width - 130
    const col4 = doc.page.width - 50
    doc.text("PRODUCT", col1, tableY)
    doc.text("QTY", col2, tableY, { width: 60, align: "center" })
    doc.text("UNIT", col3, tableY, { width: 70, align: "right" })
    doc.text("TOTAL", col4, tableY, { width: 80, align: "right" })
    doc.rect(50, tableY + 8, doc.page.width - 100, 1).fill(YELLOW)

    let rowY = tableY + 20
    for (const item of items) {
      const name = item.strain_name || item.name || "Product"
      const qty = item.quantity
      const price = item.unit_price
      const line = qty * price
      doc.font("Helvetica").fontSize(12)
      doc.fillColor("#DDDDDD").text(name, col1, rowY, { width: doc.page.width - 230 })
      doc.fillColor(LIGHT).text(String(qty), col2, rowY, { width: 60, align: "center" })
      doc.text(`R${price.toLocaleString()}`, col3, rowY, { width: 70, align: "right" })
      doc.fillColor(WHITE).font("Helvetica-Bold")
        .text(`R${line.toLocaleString()}`, col4, rowY, { width: 80, align: "right" })
      doc.font("Helvetica")
      doc.rect(50, rowY + 18, doc.page.width - 100, 1).fill("#1e1e1e")
      rowY += 28
    }

    // Total
    const totalY = rowY + 10
    doc.rect(50, totalY, doc.page.width - 100, 1).fill(YELLOW)
    doc.fillColor(WHITE).fontSize(14).font("Helvetica-Bold")
      .text("TOTAL (ZAR)", col4 - 100, totalY + 10, { width: 100, align: "right" })
    doc.fillColor(YELLOW).fontSize(22).font("Helvetica-Bold")
      .text(`R${total.toLocaleString()}`, col4, totalY + 4, { width: 80, align: "right" })

    // Payment block
    const payY = totalY + 60
    doc.roundedRect(50, payY, doc.page.width - 100, 130, 8)
      .fillAndStroke("rgba(250,208,63,0.07)", "rgba(250,208,63,0.25)")
    doc.fillColor(YELLOW).fontSize(10).font("Helvetica-Bold")
      .text("PAYMENT DETAILS", 70, payY + 14)

    const bankData: [string, string][] = [
      ["Account Name", "Blazr (Pty) Ltd"],
      ["Bank", "Nedbank"],
      ["Account Number", "1338261843"],
      ["Branch Code", "198765"],
      ["SWIFT", "NEDSZAJJ"],
    ]
    let bankY = payY + 36
    doc.font("Helvetica").fontSize(11)
    for (const [label, value] of bankData) {
      doc.fillColor(DARK).text(label, 70, bankY)
      doc.fillColor(WHITE).text(value, 210, bankY)
      bankY += 16
    }

    const refX = doc.page.width - 220
    doc.fillColor(DARK).fontSize(9).text("PAYMENT REFERENCE", refX, payY + 36)
    doc.fillColor(YELLOW).fontSize(16).font("Helvetica-Bold")
      .text(order_number, refX, payY + 52)
    doc.fillColor(DARK).fontSize(9).font("Helvetica")
      .text("Send Proof of Payment to:", refX, payY + 80)
    doc.fillColor(YELLOW).fontSize(11).font("Helvetica-Bold")
      .text("wholesale@blazr.africa", refX, payY + 96)

    // Footer
    const footerY = doc.page.height - 60
    doc.rect(50, footerY - 10, doc.page.width - 100, 1).fill("#1a1a1a")
    doc.fillColor("#555555").fontSize(9).font("Helvetica")
      .text("Questions? WhatsApp +27 66 324 9083  ·  wholesale@blazr.africa  ·  Licensed wholesale cannabis platform",
        50, footerY + 4, { width: doc.page.width - 100, align: "center" })
    doc.fillColor("#333333").fontSize(8)
      .text("Blazr Wholesale · Cannabis for Private Purposes Act compliant", 50, footerY + 22, {
        width: doc.page.width - 100, align: "center",
      })

    doc.end()
  })
}
