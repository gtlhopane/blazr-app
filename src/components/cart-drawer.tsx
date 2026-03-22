"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { useCart } from "@/contexts/CartContext"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

function getMOQStep(unit: string): number {
  const u = (unit || "").toLowerCase()
  if (u === "g") return 100
  if (u === "ml") return 10
  if (u === "gummy") return 10
  if (u === "pack") return 1
  return 10
}

function formatPrice(cents: number): string {
  return `R${(cents / 100).toLocaleString("en-ZA", { minimumFractionDigits: 0 })}`
}

export function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    removeFromCart,
    updateQuantity,
    isDrawerOpen,
    closeDrawer,
  } = useCart()

  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    )
    return () => subscription.unsubscribe()
  }, [])

  function handleCheckout() {
    closeDrawer()
    if (!user) {
      window.location.href = "/login?returnTo=/checkout"
    } else {
      window.location.href = "/checkout"
    }
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] border-l border-[#2a2a2a] bg-[#0A0A0A] flex flex-col"
      >
        <SheetHeader className="pb-4 border-b border-[#1e1e1e]">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-white text-lg font-semibold">
              <ShoppingBag className="h-5 w-5 text-[#FAD03F]" />
              Your Cart
              {cartCount > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FAD03F] text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </SheetTitle>
          </div>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#111]">
              <ShoppingBag className="h-8 w-8 text-[#444]" />
            </div>
            <p className="mb-1 text-[#e5e5e5] font-medium">Your cart is empty</p>
            <p className="mb-6 text-sm text-[#737373]">
              Browse the catalogue and add products to get started.
            </p>
            <Link href="/catalogue" onClick={closeDrawer}>
              <Button className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cartItems.map((item) => {
                const moqStep = getMOQStep(item.unit)
                const subtotal = item.price * item.quantity
                return (
                  <div
                    key={item.productId}
                    className="flex gap-3 px-1"
                  >
                    {/* Image */}
                    {item.image_url ? (
                      <div
                        className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
                        style={{
                          background: "linear-gradient(145deg, #e4e1db, #f2efe9)",
                          padding: "6px",
                        }}
                      >
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="h-full w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-2xl">
                        {item.category === "Flower" ? "🌿" : item.category === "Vapes" ? "💨" : item.category === "Concentrates" ? "💎" : "📦"}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex flex-1 flex-col justify-between overflow-hidden">
                      <div>
                        <p className="text-sm font-medium text-white leading-tight truncate pr-2">
                          {item.name}
                        </p>
                        <p className="text-xs text-[#737373] mt-0.5">
                          {formatPrice(item.price)} / {item.unit}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity stepper */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const newQty = Math.max(moqStep, item.quantity - moqStep)
                              updateQuantity(item.productId, newQty)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-[#888] hover:border-[#444] hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-14 text-center text-sm font-semibold text-white tabular-nums">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            onClick={() => {
                              updateQuantity(item.productId, item.quantity + moqStep)
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#2a2a2a] bg-[#111] text-[#888] hover:border-[#FAD03F]/40 hover:text-[#FAD03F] transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="text-sm font-semibold text-[#FAD03F] tabular-nums">
                          {formatPrice(subtotal)}
                        </p>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-[#555] hover:bg-red-500/10 hover:text-red-400 transition-colors self-start mt-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Footer: total + checkout */}
            <div className="border-t border-[#1e1e1e] pt-4 space-y-4">
              {/* Running total */}
              <div className="flex items-center justify-between px-1">
                <span className="text-sm text-[#737373]">Subtotal ({cartCount} item{cartCount !== 1 ? "s" : ""})</span>
                <span className="text-xl font-bold text-[#FAD03F] tabular-nums">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <p className="text-xs text-[#555] px-1">
                Shipping and payment instructions will be provided after order confirmation.
              </p>

              <Button
                onClick={handleCheckout}
                className="w-full h-12 bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-bold text-sm gap-2"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
