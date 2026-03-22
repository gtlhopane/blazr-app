import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import localFont from "next/font/local"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
})

const boldena = localFont({
  src: "../fonts/Boldena-Bold.ttf",
  variable: "--font-boldena",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Blazr Wholesale — Premium Cannabis B2B Platform",
    template: "%s | Blazr Wholesale",
  },
  description:
    "South Africa's premier wholesale cannabis platform for licensed dispensaries. Greenhouse & indoor flower, edibles, vapes, and concentrates.",
  keywords: ["cannabis", "wholesale", "B2B", "dispensary", "South Africa"],
  metadataBase: new URL("https://wholesale.blazr.africa"),
  icons: {
    icon: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Blazr Wholesale",
    title: "Blazr Wholesale — Premium Cannabis B2B Platform",
    description: "South Africa's premier wholesale cannabis platform for licensed dispensaries.",
  },
}

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  colorScheme: "dark",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${poppins.variable} ${boldena.variable} min-h-screen flex flex-col bg-[#0A0A0A] text-white antialiased`}
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
