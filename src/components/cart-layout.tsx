"use client"

import { CartProvider } from "@/contexts/CartContext"
import { CartDrawer } from "@/components/cart-drawer"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/sonner"

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster />
    </CartProvider>
  )
}
