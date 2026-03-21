"use client"

import { useState, useEffect } from "react"
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
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

  const filteredProducts = activeCategory
    ? products.filter((p) => p.categories?.name === activeCategory)
    : products

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
            onClick={() => setActiveCategory(null)}
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
              onClick={() => setActiveCategory(cat.name)}
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
              <Card key={product.id} className="card-surface gold-glow-hover transition-all duration-300 hover:border-[#FAD03F]/20">
                <CardContent className="p-6">
                  {/* Product image */}
                  {product.image_url ? (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-40 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden flex h-40 items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]/80 text-2xl">
                          {product.categories?.icon || "📦"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-xs text-[#666]">{product.categories?.name}</p>
                        </div>
                        {product.is_featured && (
                          <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex h-40 flex-col items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#2a2a2a] bg-[#1a1a1a]/80 text-2xl">
                          {product.categories?.icon || "📦"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-xs text-[#666]">{product.categories?.name}</p>
                        </div>
                        {product.is_featured && (
                          <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <p className="mb-5 text-sm text-[#888] leading-relaxed line-clamp-3">
                    {product.description}
                  </p>

                  <div className="mb-5 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#FAD03F]">
                      R{product.wholesale_price}
                    </span>
                    <span className="text-sm text-[#666]">/ {product.unit}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-[#666]">MOQ: {product.moq} {product.unit}s</div>
                    <Link href="/apply">
                      <Button size="sm" className="bg-[#FAD03F] hover:bg-[#f5e07a] text-black text-xs h-8 gap-1.5">
                        Order <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
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
