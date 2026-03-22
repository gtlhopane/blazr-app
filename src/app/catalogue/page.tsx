"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  icon: string
}

interface Product {
  id: string
  name: string
  description: string | null
  wholesale_price: number
  moq: number
  unit: string
  is_featured: boolean
  image_url: string | null
  categories: { name: string; icon: string } | null
}

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(
    // Initialize from URL param (e.g. ?category=Flower from homepage tiles)
    () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search)
        const cat = params.get("category")
        return cat || null
      }
      return null
    }
  )
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null)
  // selectedTier: productId -> 50 | 100 | null
  const [selectedTier, setSelectedTier] = useState<Record<string, number | null>>({})

  // Load tier selections from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("blazr_tier_selections")
      if (saved) setSelectedTier(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: prods, error: prodError }, { data: cats }] = await Promise.all([
        supabase
          .from("products")
          .select("*, categories(name, icon)")
          .eq("is_active", true)
          .order("is_featured", { ascending: false }),
        supabase
          .from("categories")
          .select("id, name, icon")
          .eq("is_active", true)
          .order("sort_order"),
      ])

      setProducts((prods as Product[]) || [])
      setCategories((cats as Category[]) || [])
      setLoading(false)
    }

    load()
  }, [])

  const filteredProducts = products.filter((p) => {
    const catMatch = !activeCategory || p.categories?.name === activeCategory
    if (!catMatch) return false
    if (activeCategory === 'Flower' && activeSubcategory) {
      const desc = (p.description || '').toLowerCase()
      return desc.startsWith(activeSubcategory.toLowerCase() + ',')
    }
    return true
  })

  function handleTierSelect(e: React.MouseEvent, productId: string, qty: number) {
    e.stopPropagation()
    setSelectedTier((prev) => {
      const next = { ...prev, [productId]: qty }
      try { localStorage.setItem("blazr_tier_selections", JSON.stringify(next)) } catch {}
      return next
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[#2a2a2a] bg-gradient-to-b from-[#111]/80 to-transparent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <Badge className="mb-4 bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">Catalogue</Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Product Range
            </h1>
            <p className="text-[#888]">
              Browse our full product catalogue. Pricing is available to approved accounts only.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Categories nav */}
        <div className="mb-10 flex flex-wrap gap-2">
          <Badge
            variant="outline"
            onClick={() => { setActiveCategory(null); setActiveSubcategory(null); window.history.replaceState(null, '', '/catalogue'); }}
            className={`cursor-pointer transition-colors ${
              activeCategory === null
                ? "bg-[#FAD03F]/10 border-[#FAD03F] text-[#FAD03F]"
                : "border-[#2a2a2a] text-[#888] hover:border-[#444]"
            }`}
          >
            All Products
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant="outline"
              onClick={() => { setActiveCategory(cat.name); setActiveSubcategory(null); window.history.replaceState(null, '', `/catalogue?category=${encodeURIComponent(cat.name)}`); }}
              className={`cursor-pointer transition-colors ${
                activeCategory === cat.name
                  ? "bg-[#FAD03F]/10 border-[#FAD03F] text-[#FAD03F]"
                  : "border-[#2a2a2a] text-[#888] hover:border-[#444]"
              }`}
            >
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>

        {/* Flower subcategory filter */}
        {activeCategory === 'Flower' && (
          <div className="mb-8 flex gap-2">
            {['All', 'Indoor', 'Greenhouse'].map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  const newSub = sub === 'All' ? null : sub
                  setActiveSubcategory(newSub)
                  const url = newSub
                    ? `/catalogue?category=Flower&subcategory=${encodeURIComponent(newSub)}`
                    : `/catalogue?category=Flower`
                  window.history.replaceState(null, '', url)
                }}
                className={`text-xs px-4 py-1.5 rounded-full border transition-colors ${
                  (sub === 'All' && !activeSubcategory) || activeSubcategory === sub
                    ? 'border-[#FAD03F] bg-[#FAD03F]/10 text-[#FAD03F]'
                    : 'border-[#2a2a2a] text-[#666] hover:border-[#444] hover:text-[#888]'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="card-surface animate-pulse">
                <CardContent className="p-6">
                  <div className="h-40 bg-[#1a1a1a] rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-16 text-[#666]">
            No products found in this category.
          </div>
        ) : (
          /* Products grid */
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="card-surface gold-glow-hover transition-all duration-300 hover:border-[#FAD03F]/20"
                style={{
                  background: 'linear-gradient(145deg, #0d0d0d, #141414)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                }}
              >
                <CardContent className="p-5">
                  {product.image_url ? (
                    /* Outer dark stage */
                    <div
                      className="mb-5 flex items-center justify-center overflow-hidden"
                      style={{
                        borderRadius: '20px',
                        padding: '20px',
                        background: 'radial-gradient(circle at center, rgba(255,200,0,0.06), transparent 70%), linear-gradient(145deg, #0f0f0f, #1a1a1a)',
                        aspectRatio: '4/3',
                      }}
                    >
                      {/* Inner cream photo panel — subtle studio surface, not dominant */}
                      <div
                        style={{
                          background: 'linear-gradient(145deg, #e4e1db, #f2efe9)',
                          borderRadius: '12px',
                          padding: '12px',
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 12px 30px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.35)',
                        }}
                      >
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          style={{
                            borderRadius: '8px',
                            filter: 'drop-shadow(0 30px 35px rgba(0,0,0,0.6))',
                            transform: 'scale(1.06)',
                            display: 'block',
                          }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement
                            img.style.display = 'none'
                          }}
                        />
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]/80 text-2xl">
                      {product.categories?.icon || "📦"}
                    </div>
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      {product.categories?.name !== 'Nano Gummies' && (
                        <p className="text-xs text-[#666]">{product.categories?.name}</p>
                      )}
                    </div>
                    {product.is_featured && (
                      <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs ml-auto">
                        Featured
                      </Badge>
                    )}
                  </div>

                  {/* Short description — trim long DB descriptions */}
                  {product.description && (
                    <p className="mb-4 text-sm text-[#888] leading-relaxed line-clamp-2">
                      {product.description.split('\n')[0]}
                    </p>
                  )}

                  {/* === NANO GUMMIES 10-PACK BLOCK === */}
                  {product.unit === 'pack' && (
                    <div className="mb-5 rounded-xl border border-[#FAD03F]/20 bg-[#FAD03F]/5 p-4 space-y-3">
                      {/* Edition + MG info row */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#FAD03F]">
                          ⚡ {product.name.split('—')[1]?.trim() || '10-Pack'}
                        </span>
                        <span className="text-xs text-[#666]">Fast-Acting Nano</span>
                      </div>
                      {/* Dosage */}
                      <div className="flex gap-4 text-xs text-[#aaa]">
                        <span>🍬 <strong className="text-white">10</strong> gummies/pack</span>
                        <span>💊 <strong className="text-white">20MG</strong>/gummy</span>
                        <span>📦 <strong className="text-white">200MG</strong> total</span>
                      </div>
                      {/* Pricing */}
                      <div className="flex items-baseline gap-3 border-t border-[#FAD03F]/10 pt-3">
                        <div>
                          <span className="text-xs text-[#666]">Wholesale </span>
                          <span className="text-xl font-bold text-[#FAD03F]">R{product.wholesale_price}</span>
                          <span className="text-xs text-[#666]"> /pack</span>
                        </div>
                        <div>
                          <span className="text-xs text-[#666]">RRP </span>
                          <span className="text-lg font-bold text-green-400">R220</span>
                          <span className="text-xs text-[#666]"> /pack</span>
                        </div>
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {['Fast-Acting', 'Nano-Infused', 'Precision-Dosed', 'Ready-to-Retail'].map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border border-[#2a2a2a] bg-[#1a1a1a] text-[#888]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-5 space-y-2">
                    {/* Primary per-unit price — only for non-pack units */}
                    {product.unit !== 'pack' && (
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#FAD03F]">
                          R{product.wholesale_price}
                        </span>
                        <span className="text-sm text-[#666]">/ {product.unit === 'gummy' ? 'gummy' : product.unit}</span>
                      </div>
                    )}
                    {/* Bulk tiers — 50 units and 100 units */}
                    {product.unit === 'gummy' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleTierSelect(e, product.id, 50)}
                          className={`flex-1 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                            selectedTier[product.id] === 50
                              ? "border-[#FAD03F] bg-[#FAD03F] text-black font-semibold shadow-[0_0_8px_rgba(250,208,63,0.3)]"
                              : "border-[#2a2a2a] bg-[#1f1f1f] text-[#888] hover:border-[#444]"
                          }`}
                        >
                          <span className="block text-[10px] opacity-70">50 gummies</span>
                          <span className="font-bold">R{product.wholesale_price * 50}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleTierSelect(e, product.id, 100)}
                          className={`flex-1 rounded-lg border px-3 py-1.5 text-xs transition-all ${
                            selectedTier[product.id] === 100
                              ? "border-[#FAD03F] bg-[#FAD03F] text-black font-semibold shadow-[0_0_8px_rgba(250,208,63,0.3)]"
                              : "border-[#2a2a2a] bg-[#1f1f1f] text-[#888] hover:border-[#444]"
                          }`}
                        >
                          <span className="block text-[10px] opacity-70">100 gummies</span>
                          <span className="font-bold">R{product.wholesale_price * 100}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#666]">MOQ: {product.moq} {product.unit === 'gummy' ? 'gummies' : product.unit + 's'}</div>
                    {(() => {
                      const tier = selectedTier[product.id]
                      const isPack = product.unit === 'pack'
                      return (
                        <Link
                          href={
                            isPack
                              ? `/apply?product=${encodeURIComponent(product.name)}&qty=1&price=${product.wholesale_price}`
                              : tier
                                ? `/apply?product=${encodeURIComponent(product.name)}&qty=${tier}&price=${product.wholesale_price * tier}`
                                : "/apply"
                          }
                        >
                          <Button size="sm" className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black text-xs h-8 gap-1.5">
                            Order <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl border border-[#2a2a2a]/60 bg-[#111]/50 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold" style={{ fontFamily: "var(--font-boldena), sans-serif" }}>
            Ready to see pricing?
          </h3>
          <p className="mb-5 text-sm text-[#888] max-w-md mx-auto">
            Apply for a wholesale account to access your custom pricing, place orders, and track deliveries.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/apply">
              <Button className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold gap-2">
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
