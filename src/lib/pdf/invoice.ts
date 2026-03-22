import { renderToBuffer } from "@react-pdf/renderer"
import InvoiceDocument from "@/components/pdf/InvoiceDocument"
import path from "path"

export interface InvoiceData {
  invoiceNumber: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerCompany?: string
  deliveryAddress: string
  items: Array<{
    name: string
    quantity: number
    unit_price: number
    category?: string
  }>
  total: number
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  // Use absolute path to the logo for server-side rendering
  const logoPath = path.join(process.cwd(), "public", "logos", "103058_Blazr_Flat_RT_R_01.png")

  const buffer = await renderToBuffer(
    InvoiceDocument({ ...data, logoPath })
  )

  return buffer
}
