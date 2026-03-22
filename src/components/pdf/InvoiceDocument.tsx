import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import path from "path"

// Register fonts
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff2", fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FAFAFA",
    fontFamily: "Inter",
    fontSize: 10,
    padding: 40,
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
    borderBottom: "1px solid #E5E5E5",
    paddingBottom: 20,
  },
  logo: {
    width: 140,
    height: 44,
    objectFit: "contain",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 700,
    color: "#FAD03F",
    letterSpacing: 1,
    marginBottom: 4,
  },
  invoiceNumber: {
    fontSize: 9,
    color: "#666",
    marginBottom: 2,
  },
  invoiceDate: {
    fontSize: 9,
    color: "#666",
  },
  companySection: {
    flexDirection: "row",
    marginBottom: 24,
    gap: 20,
  },
  companyBlock: {
    flex: 1,
    backgroundColor: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    padding: 12,
  },
  blockLabel: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  blockValue: {
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 4,
  },
  itemsTable: {
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 4,
  },
  tableHeaderText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 4,
    padding: "10 12",
    marginBottom: 4,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#FAFAFA",
  },
  colProduct: { flex: 3 },
  colQty: { flex: 1, textAlign: "center" },
  colPrice: { flex: 1, textAlign: "right" },
  colTotal: { flex: 1, textAlign: "right" },
  productName: {
    fontSize: 10,
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 2,
  },
  productMeta: {
    fontSize: 8,
    color: "#888",
  },
  cellText: {
    fontSize: 10,
    color: "#1a1a1a",
  },
  cellTextCenter: {
    fontSize: 10,
    color: "#1a1a1a",
    textAlign: "center",
  },
  cellTextRight: {
    fontSize: 10,
    color: "#1a1a1a",
    textAlign: "right",
    fontWeight: 700,
  },
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 24,
  },
  totalsBox: {
    width: 220,
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
    padding: 14,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 9,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 10,
    color: "#fff",
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTop: "1px solid #333",
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#FAD03F",
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: "#FAD03F",
  },
  bankSection: {
    backgroundColor: "#fff",
    border: "1px solid #E5E5E5",
    borderRadius: 6,
    padding: 14,
    marginBottom: 20,
  },
  bankTitle: {
    fontSize: 8,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  bankGrid: {
    flexDirection: "row",
    gap: 20,
  },
  bankCol: {
    flex: 1,
  },
  bankRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  bankLabel: {
    fontSize: 9,
    color: "#888",
    width: 80,
  },
  bankValue: {
    fontSize: 9,
    color: "#1a1a1a",
    fontWeight: 700,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #E5E5E5",
    paddingTop: 10,
    alignItems: "center",
  },
  footerText: {
    fontSize: 8,
    color: "#aaa",
    textAlign: "center",
  },
  yellowTag: {
    backgroundColor: "#FAD03F",
    color: "#000",
    fontSize: 8,
    fontWeight: 700,
    padding: "3 8",
    borderRadius: 3,
    alignSelf: "flex-start",
    marginBottom: 6,
  },
})

const CURRENCY_FORMAT = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

function formatPrice(amount: number) {
  return CURRENCY_FORMAT.format(amount)
}

const NOW = new Date()
const INVOICE_DATE = NOW.toLocaleDateString("en-ZA", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const DUE_DATE = new Date(NOW.getTime() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-ZA", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

interface LineItem {
  name: string
  quantity: number
  unit_price: number
  category?: string
}

interface InvoiceDocumentProps {
  invoiceNumber: string
  buyerName: string
  buyerEmail: string
  buyerPhone: string
  buyerCompany?: string
  deliveryAddress: string
  items: LineItem[]
  total: number
  logoPath?: string
}

export default function InvoiceDocument({
  invoiceNumber,
  buyerName,
  buyerEmail,
  buyerPhone,
  buyerCompany,
  deliveryAddress,
  items,
  total,
  logoPath,
}: InvoiceDocumentProps) {
  const logoSrc = logoPath
    ? `file://${logoPath}`
    : "https://blazr-app.vercel.app/logos/103058_Blazr_Flat_RT_R_01.png"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Image src={logoSrc} style={styles.logo} />
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>{invoiceNumber}</Text>
            <Text style={styles.invoiceDate}>Date: {INVOICE_DATE}</Text>
            <Text style={styles.invoiceDate}>Due: {DUE_DATE}</Text>
          </View>
        </View>

        {/* Company + Buyer */}
        <View style={styles.companySection}>
          <View style={styles.companyBlock}>
            <Text style={styles.blockLabel}>From</Text>
            <Text style={styles.blockTitle}>Blazr (Pty) Ltd</Text>
            <Text style={styles.blockValue}>PO Box 990035</Text>
            <Text style={styles.blockValue}>Kibler Park</Text>
            <Text style={styles.blockValue}>Johannesburg, 2053</Text>
            <Text style={styles.blockValue}>South Africa</Text>
            <Text style={[styles.blockValue, { marginTop: 6 }]}>Tel: +27 63 249 083</Text>
            <Text style={styles.blockValue}>Email: orders@wholesale.blazr.africa</Text>
          </View>
          <View style={styles.companyBlock}>
            <Text style={styles.blockLabel}>Bill To</Text>
            <Text style={[styles.blockTitle, { marginBottom: 4 }]}>{buyerName}</Text>
            {buyerCompany && <Text style={styles.blockValue}>{buyerCompany}</Text>}
            <Text style={styles.blockValue}>{buyerEmail}</Text>
            <Text style={styles.blockValue}>{buyerPhone}</Text>
          </View>
        </View>

        <View style={styles.companySection}>
          <View style={[styles.companyBlock, { flex: 2 }]}>
            <Text style={styles.blockLabel}>Delivery Address</Text>
            <Text style={styles.blockValue}>{deliveryAddress}</Text>
          </View>
          <View style={[styles.companyBlock, { flex: 1 }]}>
            <Text style={styles.blockLabel}>Payment Due</Text>
            <Text style={[styles.blockTitle, { color: "#FAD03F" }]}>{DUE_DATE}</Text>
            <Text style={[styles.blockValue, { marginTop: 4 }]}>Please make payment within 3 business days</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colProduct]}>Product</Text>
            <Text style={[styles.tableHeaderText, styles.colQty]}>Qty</Text>
            <Text style={[styles.tableHeaderText, styles.colPrice]}>Unit Price</Text>
            <Text style={[styles.tableHeaderText, styles.colTotal]}>Total</Text>
          </View>

          {items.map((item, i) => (
            <View key={i} style={i % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
              <View style={styles.colProduct}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productMeta}>{item.category || "Wholesale"}</Text>
              </View>
              <Text style={[styles.cellTextCenter, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.cellText, styles.colPrice]}>{formatPrice(item.unit_price)}</Text>
              <Text style={[styles.cellTextRight, styles.colTotal]}>
                {formatPrice(item.quantity * item.unit_price)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>VAT</Text>
              <Text style={styles.totalValue}>Exempt (Zero-rated)</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total Due</Text>
              <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        {/* Bank Details */}
        <View style={styles.bankSection}>
          <Text style={styles.bankTitle}>Bank Transfer Details</Text>
          <View style={styles.bankGrid}>
            <View style={styles.bankCol}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account Name</Text>
                <Text style={styles.bankValue}>Blazr (Pty) Ltd</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Bank</Text>
                <Text style={styles.bankValue}>Nedbank</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Account No.</Text>
                <Text style={styles.bankValue}>1338261843</Text>
              </View>
            </View>
            <View style={styles.bankCol}>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Branch Code</Text>
                <Text style={styles.bankValue}>198765</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>SWIFT / BIC</Text>
                <Text style={styles.bankValue}>NEDSZAJJ</Text>
              </View>
              <View style={styles.bankRow}>
                <Text style={styles.bankLabel}>Reference</Text>
                <Text style={[styles.bankValue, { color: "#FAD03F" }]}>{invoiceNumber}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Blazr (Pty) Ltd · PO Box 990035, Kibler Park, Johannesburg, 2053 · Tel: +27 63 249 083 · orders@wholesale.blazr.africa
          </Text>
          <Text style={styles.footerText}>
            This invoice was generated electronically and is valid without a signature.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
