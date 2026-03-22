"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { ArrowRight, Minus, Plus, Check, Search, X, Loader2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const STRAIN_IMAGES: Record<string, string> = {
  "forbidden-fruit":  "https://llsrgsbzhubwexbozerg.supabase.co/storage/v1/object/public/products/vape-forbidden-fruit.jpg",
  "durban-poison":    "https://llsrgsbzhubwexbozerg.supabase.co/storage/v1/object/public/products/vape-durban-poison.jpg",
  "sunset-sherbet":  "https://llsrgsbzhubwexbozerg.supabase.co/storage/v1/object/public/products/vape-sunset-sherbet.jpg",
}

const STRAIN_TYPES: Record<string, { type: string; color: string; icon: string }> = {
  "forbidden-fruit":  { type: "Indica",  color: "text-purple-400", icon: "🍇" },
  "durban-poison":   { type: "Sativa",  color: "text-green-400",  icon: "⚡" },
  "sunset-sherbet":  { type: "Hybrid",  color: "text-amber-400",  icon: "🌅" },
  "og-kush":          { type: "Hybrid",  color: "text-green-400",  icon: "🌲" },
  "ak-47":           { type: "Hybrid",  color: "text-orange-400", icon: "🚀" },
  "peanut-butter-breath": { type: "Indica", color: "text-purple-400", icon: "🥜" },
  "green-crack":     { type: "Sativa",  color: "text-green-400",  icon: "💚" },
  "cali-og":         { type: "Hybrid",  color: "text-lime-400",   icon: "🌴" },
  "northern-lights": { type: "Indica",  color: "text-blue-400",   icon: "❄️" },
  "headband":        { type: "Hybrid",  color: "text-indigo-400", icon: "🎩" },
  "tropicana-cookie":{ type: "Hybrid",  color: "text-orange-400", icon: "🍊" },
  "cherry-pie":      { type: "Hybrid",  color: "text-red-400",    icon: "🍒" },
  "train-wreck":     { type: "Hybrid",  color: "text-orange-400", icon: "🚂" },
  "king-louis-og":   { type: "Indica",  color: "text-purple-400", icon: "👑" },
  "pineapple-express":{ type: "Hybrid", color: "text-yellow-400", icon: "🍍" },
  "zkittlez":        { type: "Indica",  color: "text-pink-400",   icon: "🍬" },
  "jelly-rancher":   { type: "Hybrid",  color: "text-rose-400",   icon: "🫐" },
  "blackberry-kush": { type: "Indica",  color: "text-purple-400", icon: "🫐" },
  "white-widow":     { type: "Hybrid",  color: "text-slate-300", icon: "❄️" },
  "silver-haze":     { type: "Sativa",  color: "text-gray-300",  icon: "✨" },
  "purple-punch":    { type: "Indica",  color: "text-purple-400", icon: "🍇" },
  "wedding-cake":    { type: "Hybrid",  color: "text-pink-400",  icon: "💍" },
  "acdc":            { type: "Hybrid",  color: "text-green-400",  icon: "⚖️" },
  "blue-cheese":     { type: "Indica",  color: "text-blue-400",  icon: "🧀" },
  "girl-scout-cookies":{ type: "Hybrid", color: "text-amber-400", icon: "🍪" },
  "nyc-diesel":      { type: "Sativa",  color: "text-lime-400",   icon: "🍋" },
  "gorilla-glue-4":  { type: "Hybrid",  color: "text-green-400",  icon: "🪙" },
  "jack-herer":      { type: "Sativa",  color: "text-yellow-400", icon: "🌿" },
  "super-lemon-haze":{ type: "Sativa",  color: "text-yellow-400", icon: "🍋" },
  "gorrila-glue":    { type: "Hybrid",  color: "text-green-400",  icon: "🪙" },
  "tropic-thunder":  { type: "Hybrid",  color: "text-amber-400",  icon: "🌴" },
}

const VAPE_CATEGORY_ID = "5c53f38c-4003-4971-93ae-797cf7cd0e57"
const MOQ = 10
const UNIT_PRICE = 350
const DEVICE_NAME = "Blazr Disposable Vape — 1ML"

interface VapeProduct {
  id: string
  name: string
  slug: string
  description: string | null
  wholesale_price: number
  image_url: string | null
  is_featured: boolean
  is_active: boolean
}

interface CartItem {
  product: VapeProduct
  quantity: number
}

export default function VapesPage() {
  const [vapes, setVapes] = useState<VapeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [showAll, setShowAll] = useState(false)
  const [search, setSearch] = useState("")
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ invoice_number: string } | null>(null)

  const [buyerForm, setBuyerForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
  })

  useEffect(() => {
    async function fetchVapes() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("products")
        .select("id, name, slug, description, wholesale_price, image_url, is_featured, is_active")
        .eq("category_id", VAPE_CATEGORY_ID)
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("name")

      if (!error && data) {
        setVapes(data)
        const initial: Record<string, number> = {}
        data.forEach((v: VapeProduct) => { initial[v.slug] = 0 })
        setQuantities(initial)
      } else {
        toast.error("Failed to load strains")
      }
      setLoading(false)
    }
    fetchVapes()
  }, [])

  const featuredVapes = useMemo(() => vapes.filter((v) => v.is_featured), [vapes])
  const allVapes = useMemo(() => vapes, [vapes])

  const visibleVapes = useMemo(() => {
    const base = showAll ? allVapes : featuredVapes
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return allVapes.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.description?.toLowerCase().includes(q)
    )
  }, [showAll, featuredVapes, allVapes, search])

  const selectedItems = useMemo((): CartItem[] => {
    return vapes
      .filter((v) => quantities[v.slug] > 0)
      .map((v) => ({ product: v, quantity: quantities[v.slug] }))
  }, [vapes, quantities])

  const totalUnits = Object.values(quantities).reduce((a, b) => a + b, 0)
  const totalPrice = totalUnits * UNIT_PRICE
  const moqMet = totalUnits >= MOQ

  function updateQty(slug: string, delta: number) {
    setQuantities((prev) => ({
      ...prev,
      [slug]: Math.max(0, (prev[slug] || 0) + delta),
    }))
  }

  function autoFillMix() {
    setQuantities((prev) => ({
      ...prev,
      "forbidden-fruit": 4,
      "durban-poison": 3,
      "sunset-sherbet": 3,
    }))
  }

  function buildApplyUrl() {
    const params = new URLSearchParams({
      product: DEVICE_NAME,
      qty: String(totalUnits),
      price: String(totalPrice),
    })
    selectedItems.forEach((item) => {
      params.append("strains", `${item.product.name}:${item.quantity}`)
    })
    return `/apply?${params.toString()}`
  }

  async function handleOrderSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!moqMet || selectedItems.length === 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "vapes",
          buyer_name: buyerForm.name,
          buyer_email: buyerForm.email,
          buyer_phone: buyerForm.phone,
          buyer_company: buyerForm.company,
          items: selectedItems.map((item) => ({
            strain_id: item.product.slug,
            strain_name: item.product.name,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: UNIT_PRICE * 100,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Order failed")

      setOrderSuccess({ invoice_number: data.invoice_number })
      toast.success("Order submitted! We'll contact you shortly.")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="h-8 w-8 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Order Received!</h1>
            <p className="text-[#888] text-sm">
              Thank you for your order. We&apos;ll review and contact you within 24 hours.
            </p>
          </div>
          <div className="rounded-xl border border-[#2a2a2a] bg-[#111] p-5 text-left space-y-3">
            <div>
              <p className="text-xs text-[#666] mb-1">Invoice Number</p>
              <p className="font-mono font-semibold text-[#FAD03F]">{orderSuccess.invoice_number}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] mb-1">Order Total</p>
              <p className="font-bold text-lg">R{totalPrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] mb-1">Units</p>
              <p className="font-medium">{totalUnits} units</p>
            </div>
          </div>
          <div className="space-y-3">
            <a
              href={`https://wa.me/27663249083?text=Hi, I just placed order ${orderSuccess.invoice_number} on the Blazr wholesale portal.`}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Button className="w-full bg-green-600 hover:bg-green-500 gap-2">
                <ShoppingCart className="h-4 w-4" /> Message on WhatsApp
              </Button>
            </a>
            <Button
              variant="outline"
              className="w-full border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a]"
              onClick={() => {
                setOrderSuccess(null)
                setShowOrderForm(false)
                setQuantities((prev) => {
                  const n: Record<string, number> = {}
                  Object.keys(prev).forEach((k) => { n[k] = 0 })
                  return n
                })
              }}
            >
              Place Another Order
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#FAD03F]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-[#2a2a2a] bg-gradient-to-b from-[#111]/80 to-transparent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">Vapes</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Blazr Disposable Vape — 1ML
            </h1>
            <p className="text-[#888] text-sm leading-relaxed max-w-lg">
              High-performance disposable vape device delivering smooth, fast-acting effects with premium strain profiles.
              90.5% THC · 1ML · Mix &amp; match strains · MOQ 10 units
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-3">

          {/* LEFT — Strain Selector */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Select Strains</h2>
                <p className="text-xs text-[#666] mt-0.5">Mix and match — minimum 10 units total</p>
              </div>
              <div className="flex items-center gap-2">
                {!showAll && (
                  <button
                    onClick={autoFillMix}
                    className="text-xs text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Suggested Mix
                  </button>
                )}
                <button
                  onClick={() => { setShowAll(!showAll); setSearch("") }}
                  className="text-xs text-[#FAD03F] hover:text-[#f5e07a] border border-[#FAD03F]/30 hover:border-[#FAD03F]/60 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {showAll ? "Show Less" : `View All Strains (${vapes.length})`}
                </button>
              </div>
            </div>

            {/* Search */}
            {showAll && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search strains..."
                  className="pl-9 bg-[#111] border-[#2a2a2a] h-10 text-sm"
                />
              </div>
            )}

            {/* Strain cards */}
            <div className="grid gap-4 sm:grid-cols-1">
              {visibleVapes.map((strain) => {
                const qty = quantities[strain.slug] || 0
                const isSelected = qty > 0
                const strainInfo = STRAIN_TYPES[strain.slug] || { type: "Hybrid", color: "text-green-400", icon: "🌿" }
                const imageUrl = STRAIN_IMAGES[strain.slug] || strain.image_url

                return (
                  <Card
                    key={strain.slug}
                    className="transition-all duration-200"
                    style={{
                      background: isSelected
                        ? "linear-gradient(145deg, #0d0d0d, #141414)"
                        : "linear-gradient(145deg, #111, #161616)",
                      border: isSelected
                        ? "1px solid rgba(250,208,63,0.3)"
                        : "1px solid rgba(255,255,255,0.05)",
                      borderRadius: "16px",
                    }}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Strain image or icon */}
                        <div
                          className="flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden w-14 h-14"
                          style={{
                            background: isSelected
                              ? "rgba(250,208,63,0.1)"
                              : "rgba(255,255,255,0.04)",
                            border: isSelected
                              ? "1px solid rgba(250,208,63,0.2)"
                              : "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={strain.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement
                                img.style.display = "none"
                              }}
                            />
                          ) : (
                            <span className="text-3xl">{strainInfo.icon}</span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-semibold text-sm">{strain.name}</h3>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${strainInfo.color} border-current bg-transparent`}>
                              {strainInfo.type}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-[#FAD03F] flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-[#666]">{strain.description || strainInfo.type}</p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <button
                            onClick={() => updateQty(strain.slug, -1)}
                            disabled={qty === 0}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#2a2a2a] text-[#888] hover:border-[#444] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span
                            className="w-8 text-center font-semibold text-sm"
                            style={{ color: qty > 0 ? "#FAD03F" : "#666" }}
                          >
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(strain.slug, 1)}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#2a2a2a] text-[#888] hover:border-[#FAD03F]/50 hover:text-[#FAD03F] transition-all"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex justify-end">
                          <span className="text-xs text-[#888]">
                            <span className="text-[#FAD03F] font-semibold">{qty}</span> units × R{UNIT_PRICE} ={" "}
                            <span className="text-white font-semibold">R{(qty * UNIT_PRICE).toLocaleString()}</span>
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* RIGHT — Order Summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-8 rounded-2xl border p-6 space-y-5"
              style={{
                background: "linear-gradient(145deg, #0d0d0d, #141414)",
                border: moqMet ? "1px solid rgba(250,208,63,0.3)" : "1px solid rgba(255,255,255,0.06)",
                boxShadow: moqMet ? "0 0 40px rgba(250,208,63,0.08)" : "none",
              }}
            >
              <div>
                <h3 className="font-semibold text-sm mb-1">Order Summary</h3>
                <p className="text-xs text-[#666]">Blazr Disposable Vape — 1ML</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Total Units</span>
                  <span
                    className="font-bold"
                    style={{ color: moqMet ? "#FAD03F" : "#666" }}
                  >
                    {totalUnits} <span className="text-[#666] font-normal">/ {MOQ} min</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (totalUnits / MOQ) * 100)}%`,
                      background: moqMet
                        ? "linear-gradient(90deg, #FAD03F, #f5e07a)"
                        : "#333",
                    }}
                  />
                </div>
                {totalUnits < MOQ && (
                  <p className="text-[10px] text-[#666] text-right">
                    {MOQ - totalUnits} more units needed
                  </p>
                )}
                {moqMet && (
                  <p className="text-[10px] text-[#FAD03F] font-medium text-right">
                    ✓ MOQ reached — ready to order
                  </p>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-[#666]">Strain Mix</p>
                  {selectedItems.map((item) => {
                    const si = STRAIN_TYPES[item.product.slug] || { icon: "🌿" }
                    return (
                      <div key={item.product.slug} className="flex justify-between text-xs">
                        <span className="text-[#888]">{si.icon} {item.product.name}</span>
                        <span className="text-white font-medium">{item.quantity} units</span>
                      </div>
                    )
                  })}
                </div>
              )}

              <div className="border-t border-[#2a2a2a] pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#888]">Wholesale</span>
                  <span className="font-bold text-white">R{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Per unit</span>
                  <span className="text-[#888]">R{UNIT_PRICE}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">RRP Guide</span>
                  <span className="text-[#888]">R{(totalUnits * 220).toLocaleString()}</span>
                </div>
              </div>

              {!showOrderForm ? (
                <Button
                  disabled={!moqMet}
                  onClick={() => setShowOrderForm(true)}
                  className={`w-full gap-2 font-semibold h-11 text-sm transition-all ${
                    moqMet
                      ? "bg-[#FAD03F] hover:bg-[#f5e07a] text-black shadow-[0_0_20px_rgba(250,208,63,0.25)]"
                      : "bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#2a2a2a]"
                  }`}
                >
                  {moqMet ? (
                    <>Order {totalUnits} Units <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>Select {MOQ} units to continue</>
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowOrderForm(false)}
                  className="w-full gap-2 text-xs border-[#2a2a2a] text-[#666] hover:bg-[#1a1a1a]"
                >
                  <X className="h-3 w-3" /> Cancel
                </Button>
              )}

              <Link href={buildApplyUrl()} className="block">
                <Button
                  variant="outline"
                  className="w-full gap-2 text-xs border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
                >
                  Apply for Account Instead
                </Button>
              </Link>

              <p className="text-[10px] text-[#555] text-center">
                Wholesale pricing. MOQ: 10 units. RRP is a guide only.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Order Form */}
        {showOrderForm && moqMet && (
          <div className="lg:hidden mt-4">
            <form onSubmit={handleOrderSubmit} className="rounded-2xl border border-[#FAD03F]/30 bg-[#111] p-5 space-y-4">
              <h3 className="font-semibold text-sm">Complete Your Order</h3>
              <div className="space-y-3">
                {[
                  { key: "name", label: "Full Name", placeholder: "Jane Smith", type: "text" },
                  { key: "email", label: "Email", placeholder: "jane@business.co.za", type: "email" },
                  { key: "phone", label: "Phone / WhatsApp", placeholder: "+27 61 234 5678", type: "tel" },
                  { key: "company", label: "Company / Business Name", placeholder: "Green Leaf Dispensary", type: "text" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <Label className="text-xs text-[#888]">{label}</Label>
                    <Input
                      required={key !== "company"}
                      type={type}
                      value={buyerForm[key as keyof typeof buyerForm]}
                      onChange={(e) => setBuyerForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-[#0d0d0d] border-[#2a2a2a] h-9 text-sm mt-1"
                    />
                  </div>
                ))}
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold gap-2"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><ShoppingCart className="h-4 w-4" /> Submit Order — R{totalPrice.toLocaleString()}</>}
              </Button>
            </form>
          </div>
        )}

        {/* Desktop Order Form Modal */}
        {showOrderForm && moqMet && (
          <div className="hidden lg:flex fixed inset-0 z-50 bg-black/60 backdrop-blur-sm items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-[#FAD03F]/30 bg-[#111] p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-base">Complete Your Order</h3>
                <button onClick={() => setShowOrderForm(false)} className="text-[#666] hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="rounded-lg bg-[#0d0d0d] border border-[#2a2a2a] p-3 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Total</span>
                  <span className="font-bold text-[#FAD03F]">R{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Units</span>
                  <span className="text-white">{totalUnits}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#666]">Strains</span>
                  <span className="text-white">{selectedItems.length}</span>
                </div>
              </div>
              <form onSubmit={handleOrderSubmit} className="space-y-4">
                {[
                  { key: "name", label: "Full Name *", placeholder: "Jane Smith", type: "text" },
                  { key: "email", label: "Email *", placeholder: "jane@business.co.za", type: "email" },
                  { key: "phone", label: "Phone / WhatsApp *", placeholder: "+27 61 234 5678", type: "tel" },
                  { key: "company", label: "Company / Business Name", placeholder: "Green Leaf Dispensary", type: "text" },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <Label className="text-xs text-[#888]">{label}</Label>
                    <Input
                      required={key !== "company"}
                      type={type}
                      value={buyerForm[key as keyof typeof buyerForm]}
                      onChange={(e) => setBuyerForm((f) => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="bg-[#0d0d0d] border-[#2a2a2a] h-9 text-sm mt-1"
                    />
                  </div>
                ))}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold gap-2"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><ShoppingCart className="h-4 w-4" /> Submit Order — R{totalPrice.toLocaleString()}</>}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Product detail cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "90.5% THC", desc: "High-potency extract for fast-acting, consistent effects" },
            { icon: "🧪", title: "1ML Capacity", desc: "Pre-filled disposable device — no refills, no setup" },
            { icon: "📦", title: "Mix & Match", desc: "Combine strains in one order. MOQ: 10 units across any mix." },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-[#2a2a2a] p-5"
              style={{ background: "linear-gradient(145deg, #0d0d0d, #111)" }}
            >
              <div className="text-2xl mb-2">{icon}</div>
              <h4 className="font-semibold text-sm mb-1">{title}</h4>
              <p className="text-xs text-[#666] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 rounded-2xl border border-[#2a2a2a]/60 bg-[#111]/50 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold">Ready to apply for a wholesale account?</h3>
          <p className="mb-5 text-sm text-[#888] max-w-md mx-auto">
            Create your account to access vape pricing, place orders, and manage your wholesale orders.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href={buildApplyUrl()}>
              <Button
                disabled={!moqMet}
                className={`gap-2 font-semibold ${moqMet ? "bg-[#FAD03F] hover:bg-[#f5e07a] text-black" : "bg-[#1a1a1a] text-[#555] cursor-not-allowed border border-[#2a2a2a]"}`}
              >
                Apply for Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="https://wa.me/27663249083" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white">
                Chat on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
