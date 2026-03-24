import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/contexts/CartContext'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: {
    template: '%s | BioMuti Group',
    default: 'BioMuti Group',
  },
  description: 'Live operations dashboard — Blazr / BioMuti',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </CartProvider>
      </body>
    </html>
  )
}
