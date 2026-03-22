"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowLeft, Copy, Check } from "lucide-react"
import type { User } from "@supabase/supabase-js"
import Link from "next/link"
import GooglePlacesInput from "@/components/google-places-input"

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`
}

const BANK_DETAILS = {
  accountName: "Blazr (Pty) Ltd",
  bank: "Nedbank",
  accountNumber: "1338261843",
  branch: "198765",
  swift: "NEDSZAJJ",
  email: "orders@wholesale.blazr.africa",
}

interface OrderSuccess {
  invoiceNumber: string
  orderId: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, cartTotal, clearCart, loadCartFromSupabase } = useCart()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<OrderSuccess | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Form fields
  const [buyerName, setBuyerName] = useState("")
  const [buyerEmail, setBuyerEmail] = useState("")
  const [buyerPhone, setBuyerPhone] = useState("")
  const [buyerCompany, setBuyerCompany] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [orderNotes, setOrderNotes] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login?returnTo=/checkout")
        return
      }
      setUser(data.user)
      // Pre-fill from user metadata
      const meta = data.user.user_metadata || {}
      setBuyerName(meta.full_name || meta.name || "")
      setBuyerEmail(data.user.email || "")
      setBuyerPhone(meta.phone || "")
      setBuyerCompany(meta.company || "")
      setDeliveryAddress(meta.address || "")
      // Ensure cart is loaded from localStorage after auth
      loadCartFromSupabase(data.user.id)
      setLoading(false)
    })
  }, [router])

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (cartItems.length === 0) {
      setError("Your cart is empty")
      return
    }
    if (!buyerName || !buyerEmail || !buyerPhone || !deliveryAddress) {
      setError("Please fill in all required fields")
      return
    }

    setPlacing(true)
    setError(null)

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone,
          buyer_company: buyerCompany,
          delivery_address: deliveryAddress,
          notes: orderNotes,
          items: cartItems.map((item) => ({
            product_id: item.productId,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to place order")
        return
      }

      clearCart()
      setOrderSuccess({ invoiceNumber: data.invoice_number, orderId: data.order_id })
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  function copyInvoice(num: string) {
    navigator.clipboard.writeText(num)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-[#888]">Loading checkout...</div>
      </div>
    )
  }

  // === SUCCESS SCREEN ===
  if (orderSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold" style={{ fontFamily: "var(--font-boldena), sans-serif" }}>
            Order Placed!
          </h1>
          <p className="mb-6 text-[#888]">
            Thank you for your order. We&apos;ll review it and contact you shortly.
          </p>

          {/* Invoice card */}
          <Card className="card-surface mb-6 text-left">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#737373] uppercase tracking-wider">Invoice Number</p>
                  <p className="mt-1 font-mono text-xl font-bold text-[#FAD03F]">{orderSuccess.invoiceNumber}</p>
                </div>
                <button
                  onClick={() => copyInvoice(orderSuccess.invoiceNumber)}
                  className="flex items-center gap-1.5 text-xs text-[#737373] hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="h-px bg-[#1e1e1e]" />
              <div>
                <p className="text-xs text-[#737373] uppercase tracking-wider mb-3">Order Total</p>
                <p className="text-3xl font-bold text-white">{formatPrice(cartTotal > 0 ? cartTotal : 0)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Bank details */}
          <Card className="card-surface mb-6 text-left">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#FAD03F]">Bank Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#737373]">Account Name</span>
                <span className="font-medium text-white">{BANK_DETAILS.accountName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Bank</span>
                <span className="font-medium text-white">{BANK_DETAILS.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Account Number</span>
                <span className="font-mono font-medium text-white">{BANK_DETAILS.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Branch Code</span>
                <span className="font-mono font-medium text-white">{BANK_DETAILS.branch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">SWIFT Code</span>
                <span className="font-mono font-medium text-white">{BANK_DETAILS.swift}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#737373]">Reference</span>
                <span className="font-mono font-medium text-[#FAD03F]">{orderSuccess.invoiceNumber}</span>
              </div>
              <div className="mt-3 rounded-lg border border-[#FAD03F]/20 bg-[#FAD03F]/5 p-3 text-xs text-[#888]">
                Please send your Proof of Payment to{" "}
                <a href={`mailto:${BANK_DETAILS.email}`} className="text-[#FAD03F] hover:underline">
                  {BANK_DETAILS.email}
                </a>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/catalogue" className="flex-1">
              <Button variant="outline" className="w-full border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/buyer" className="flex-1">
              <Button className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // === CHECKOUT FORM ===
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[#2a2a2a] bg-gradient-to-b from-[#111]/80 to-transparent py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link href="/catalogue" className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Catalogue
          </Link>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "var(--font-boldena), sans-serif" }}>
            Checkout
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="mb-4 text-[#888]">Your cart is empty.</p>
            <Link href="/catalogue">
              <Button className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* LEFT: Form */}
            <div className="lg:col-span-2 space-y-6">
              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Buyer info */}
                <Card className="card-surface">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Buyer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs text-[#888]">Full Name *</Label>
                        <Input
                          id="name"
                          value={buyerName}
                          onChange={(e) => setBuyerName(e.target.value)}
                          required
                          placeholder="Jane Doe"
                          className="border-[#2a2a2a] bg-[#111] h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs text-[#888]">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={buyerEmail}
                          onChange={(e) => setBuyerEmail(e.target.value)}
                          required
                          placeholder="jane@dispensary.co.za"
                          className="border-[#2a2a2a] bg-[#111] h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs text-[#888]">Phone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={buyerPhone}
                          onChange={(e) => setBuyerPhone(e.target.value)}
                          required
                          placeholder="+27 61 234 5678"
                          className="border-[#2a2a2a] bg-[#111] h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="company" className="text-xs text-[#888]">Company (optional)</Label>
                        <Input
                          id="company"
                          value={buyerCompany}
                          onChange={(e) => setBuyerCompany(e.target.value)}
                          placeholder="Green Leaf Dispensary"
                          className="border-[#2a2a2a] bg-[#111] h-10"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery address */}
                <Card className="card-surface">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Delivery Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-xs text-[#888]">Full Delivery Address *</Label>
                      <GooglePlacesInput
                        value={deliveryAddress}
                        onChange={(val) => setDeliveryAddress(val)}
                        placeholder="Start typing your address..."
                        className="border border-[#2a2a2a] bg-[#111] rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="notes" className="text-xs text-[#888]">Order Notes (optional)</Label>
                      <Input
                        id="notes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Delivery instructions, special requests..."
                        className="border-[#2a2a2a] bg-[#111] h-10"
                      />
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-bold text-base"
                  disabled={placing}
                >
                  {placing ? "Placing Order..." : `Place Order — ${formatPrice(cartTotal)}`}
                </Button>

                <p className="text-center text-xs text-[#555]">
                  By placing an order you agree to our{" "}
                  <Link href="/terms" className="text-[#888] hover:text-white underline">terms</Link> and{" "}
                  <Link href="/privacy" className="text-[#888] hover:text-white underline">privacy policy</Link>.
                </p>
              </form>
            </div>

            {/* RIGHT: Order summary */}
            <div className="lg:col-span-1">
              <Card className="card-surface sticky top-24">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      {item.image_url ? (
                        <div
                          className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden"
                          style={{ background: "linear-gradient(145deg, #e4e1db, #f2efe9)", padding: "4px" }}
                        >
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-xl">
                          {item.category === "Flower" ? "🌿" : item.category === "Vapes" ? "💨" : item.category === "Concentrates" ? "💎" : "📦"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-[#737373]">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-[#FAD03F] tabular-nums flex-shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}

                  <div className="h-px bg-[#1e1e1e]" />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-[#737373]">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-[#737373]">
                      <span>Shipping</span>
                      <span className="text-[#FAD03F]">TBD</span>
                    </div>
                  </div>

                  <div className="h-px bg-[#1e1e1e]" />

                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="text-xl font-bold text-[#FAD03F] tabular-nums">{formatPrice(cartTotal)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
