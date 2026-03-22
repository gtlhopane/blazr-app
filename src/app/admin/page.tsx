"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Package, ShoppingCart, CheckCircle, Loader2, ChevronRight, LayoutGrid } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const ADMIN_PASSWORD = "blazr2024"

// ─── Category Config ───────────────────────────────────────────────────────────
// To add a new category: 1) Create its products table, 2) Add entry here, 3) Add admin section
export const CATEGORIES = {
  vapes: {
    key: "vapes",
    label: "Vapes",
    icon: "💨",
    emoji: "💨",
    description: "Disposable vape pens & cartridges",
    categoryId: "5c53f38c-4003-4971-93ae-797cf7cd0e57", // Supabase category_id
    primaryField: "strain",   // What to call individual items (strain, flavor, product...)
    unitLabel: "units",
  },
  concentrates: {
    key: "concentrates",
    label: "Concentrates",
    icon: "💎",
    emoji: "💎",
    description: "Premium cannabis concentrates & extracts",
    categoryId: "2e427b8c-f893-45fc-a449-cdf4f853f0be",
    primaryField: "product",
    unitLabel: "units",
  },
  // Future categories — uncomment and configure when ready:
  // edibles: {
  //   key: "edibles",
  //   label: "Edibles",
  //   icon: "🍬",
  //   emoji: "🍬",
  //   description: "Gummies, chocolates & infused products",
  //   categoryId: "8db29e34-d0aa-4442-98ab-3ca7c77bac1b",
  //   primaryField: "product",
  //   unitLabel: "units",
  // },
  // flower: {
  //   key: "flower",
  //   label: "Flower",
  //   icon: "🌿",
  //   emoji: "🌿",
  //   description: "Premium cannabis flower",
  //   categoryId: "e14d43b7-8fa3-4268-bebc-8abff9f6c0ac",
  //   primaryField: "strain",
  //   unitLabel: "grams",
  // },
  // oils: {
  //   key: "oils",
  //   label: "Oils",
  //   icon: "💧",
  //   emoji: "💧",
  //   description: "Tinctures & concentrated oils",
  //   categoryId: "2e427b8c-f893-45fc-a449-cdf4f853f0be",
  //   primaryField: "product",
  //   unitLabel: "ml",
  // },
} as const

export type CategoryKey = keyof typeof CATEGORIES

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface Order {
  id: string
  status: string
  total: number
  notes: string | null
  created_at: string
}

interface Product {
  id: string
  name: string
  slug: string
  stock_level: number
  wholesale_price: number
  image_url: string | null
  is_featured: boolean
  description: string | null
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getInvoiceNumber(notes: string | null): string {
  if (!notes) return "—"
  const match = notes.match(/Invoice:\s*([A-Z0-9-]+)/)
  return match ? match[1] : notes.slice(0, 24)
}

function getCategoryFromNotes(notes: string | null): string {
  if (!notes) return "vapes"
  if (notes.includes("Vape")) return "vapes"
  if (notes.includes("Concentrate")) return "concentrates"
  if (notes.includes("Edible")) return "edibles"
  if (notes.includes("Flower")) return "flower"
  if (notes.includes("Oil")) return "oils"
  return "vapes"
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  quoted: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shipped: "bg-green-600/10 text-green-300 border-green-600/20",
  delivered: "bg-green-700/20 text-green-200 border-green-700/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [activeSection, setActiveSection] = useState<CategoryKey>("vapes")
  const [activeTab, setActiveTab] = useState<"orders" | "inventory">("orders")
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("blazr_admin_token")
      if (stored === ADMIN_PASSWORD) setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated) loadData()
  }, [authenticated, activeSection])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()
    const cat = CATEGORIES[activeSection]

    const [{ data: ords }, { data: prods }] = await Promise.all([
      supabase
        .from("orders")
        .select("id, status, total, notes, created_at")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("products")
        .select("id, name, slug, stock_level, wholesale_price, image_url, is_featured, description")
        .eq("category_id", cat.categoryId)
        .order("name"),
    ])

    setOrders((ords as Order[]) || [])
    setProducts((prods as Product[]) || [])
    setLoading(false)
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      localStorage.setItem("blazr_admin_token", ADMIN_PASSWORD)
      setAuthenticated(true)
      setPasswordInput("")
    } else {
      toast.error("Incorrect password")
    }
  }

  function handleLogout() {
    localStorage.removeItem("blazr_admin_token")
    setAuthenticated(false)
    setOrders([])
    setProducts([])
  }

  async function updateOrderStatus(orderId: string, status: string) {
    setUpdatingId(orderId)
    const supabase = createClient()
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
    if (!error) {
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
      toast.success(`Order ${status}`)
    } else {
      toast.error("Failed to update")
    }
    setUpdatingId(null)
  }

  async function updateStock(productId: string, newStock: number) {
    const supabase = createClient()
    const { error } = await supabase.from("products").update({ stock_level: newStock }).eq("id", productId)
    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock_level: newStock } : p))
      toast.success("Stock updated")
    } else {
      toast.error("Failed to update stock")
    }
  }

  // ── Login Screen ──────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌿</div>
            <h1 className="text-2xl font-bold">Blazr Admin</h1>
            <p className="text-sm text-[#666] mt-1">Enter password to access the wholesale portal</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-xs text-[#888]">Password</Label>
              <Input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="bg-[#111] border-[#2a2a2a] h-10 mt-1"
                placeholder="Enter admin password"
              />
            </div>
            <Button type="submit" className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-semibold">
              Login
            </Button>
          </form>
        </div>
      </div>
    )
  }

  const cat = CATEGORIES[activeSection]
  const categoryOrders = orders // All orders shown — filtered client-side by category in notes

  const pendingCount = categoryOrders.filter((o) => o.status === "pending").length
  const confirmedCount = categoryOrders.filter((o) => ["confirmed", "processing", "shipped", "delivered"].includes(o.status)).length

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-[#2a2a2a] bg-[#0d0d0d] flex-shrink-0 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <p className="font-bold text-sm text-white">Blazr</p>
              <p className="text-[10px] text-[#666]">Wholesale Portal</p>
            </div>
          </div>
        </div>

        {/* Category Nav */}
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider font-medium px-2">Categories</p>
          </div>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const c = CATEGORIES[key]
            const isActive = activeSection === key
            return (
              <button
                key={key}
                onClick={() => { setActiveSection(key); setActiveTab("inventory") }}
                className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-[#FAD03F]/10 text-[#FAD03F] border-r-2 border-[#FAD03F]"
                    : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
                }`}
              >
                <span className="text-lg">{c.emoji}</span>
                <span className="font-medium">{c.label}</span>
              </button>
            )
          })}

          <div className="px-3 mt-6 mb-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider font-medium px-2">Management</p>
          </div>
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
              activeTab === "orders"
                ? "bg-[#FAD03F]/10 text-[#FAD03F] border-r-2 border-[#FAD03F]"
                : "text-[#888] hover:text-white hover:bg-[#1a1a1a]"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">All Orders</span>
          </button>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#2a2a2a]">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-[#2a2a2a] text-[#666] hover:bg-[#1a1a1a] hover:text-white gap-2 justify-start"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="border-b border-[#2a2a2a] bg-[#111]/80 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {activeTab === "orders" ? (
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-[#FAD03F]" />
                  All Orders
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">{cat.emoji}</span>
                  {cat.label}
                </span>
              )}
            </h1>
            <p className="text-xs text-[#666] mt-0.5">
              {activeTab === "orders"
                ? "View and manage all wholesale orders across categories"
                : `${cat.description} — ${products.length} products`}
            </p>
          </div>
          <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">
            {cat.label} Admin
          </Badge>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#FAD03F]" />
            </div>
          ) : activeTab === "orders" ? (
            <OrdersTab
              orders={orders}
              updatingId={updatingId}
              onStatusChange={updateOrderStatus}
              statusColors={statusColors}
            />
          ) : (
            <InventoryTab
              products={products}
              cat={cat}
              onStockUpdate={updateStock}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({
  orders,
  updatingId,
  onStatusChange,
  statusColors,
}: {
  orders: Order[]
  updatingId: string | null
  onStatusChange: (id: string, status: string) => void
  statusColors: Record<string, string>
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Total Orders", value: orders.length, color: "text-white" },
          { label: "Pending", value: orders.filter((o) => o.status === "pending").length, color: "text-yellow-400" },
          { label: "Confirmed", value: orders.filter((o) => ["confirmed", "processing", "shipped", "delivered"].includes(o.status)).length, color: "text-green-400" },
          { label: "This Month", value: orders.filter((o) => new Date(o.created_at).getMonth() === new Date().getMonth()).length, color: "text-blue-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-[#2a2a2a] bg-[#111]">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-[#666] mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Orders Table */}
      <Card className="border-[#2a2a2a] bg-[#111]">
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#666]">
              No orders yet. Orders from any product category will appear here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-xs text-[#666]">Invoice</TableHead>
                  <TableHead className="text-xs text-[#666]">Category</TableHead>
                  <TableHead className="text-xs text-[#666]">Total</TableHead>
                  <TableHead className="text-xs text-[#666]">Status</TableHead>
                  <TableHead className="text-xs text-[#666]">Date</TableHead>
                  <TableHead className="text-xs text-[#666]">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const catKey = getCategoryFromNotes(order.notes) as CategoryKey
                  const catLabel = CATEGORIES[catKey]?.label || catKey
                  const catEmoji = CATEGORIES[catKey]?.emoji || "📦"
                  return (
                    <TableRow key={order.id} className="border-[#2a2a2a]">
                      <TableCell>
                        <span className="font-mono text-sm text-[#FAD03F]">
                          {getInvoiceNumber(order.notes)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {catEmoji} {catLabel}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-white">
                        R{(order.total || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status] || "bg-slate-700"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-[#666]">
                        {new Date(order.created_at).toLocaleDateString("ZA")}
                      </TableCell>
                      <TableCell>
                        <select
                          className={`h-7 rounded border px-2 text-xs font-medium bg-[#0d0d0d] ${statusColors[order.status]}`}
                          value={order.status}
                          onChange={(e) => onStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                        >
                          {["draft", "pending", "quoted", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────
function InventoryTab({
  products,
  cat,
  onStockUpdate,
}: {
  products: Product[]
  cat: (typeof CATEGORIES)[CategoryKey]
  onStockUpdate: (id: string, stock: number) => void
}) {
  const [search, setSearch] = useState("")

  const filtered = products.filter((p) =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  )

  const outOfStock = products.filter((p) => p.stock_level === 0).length
  const totalStock = products.reduce((sum, p) => sum + (p.stock_level || 0), 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: `Total ${cat.label} Products`, value: products.length, color: "text-white" },
          { label: "Total Stock", value: totalStock, color: "text-blue-400" },
          { label: "In Stock", value: products.length - outOfStock, color: "text-green-400" },
          { label: "Out of Stock", value: outOfStock, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="border-[#2a2a2a] bg-[#111]">
            <CardContent className="p-5">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <p className="text-xs text-[#666] mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${cat.label.toLowerCase()}...`}
          className="max-w-xs bg-[#111] border-[#2a2a2a] h-9 text-sm"
        />
        <span className="text-xs text-[#666]">{filtered.length} products</span>
      </div>

      {/* Products Table */}
      <Card className="border-[#2a2a2a] bg-[#111]">
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="py-20 text-center text-sm text-[#666]">
              No {cat.label.toLowerCase()} products found. Add products to the &quot;{cat.label}&quot; category in Supabase to see them here.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                  <TableHead className="text-xs text-[#666]">Product</TableHead>
                  <TableHead className="text-xs text-[#666]">Featured</TableHead>
                  <TableHead className="text-xs text-[#666]">Price</TableHead>
                  <TableHead className="text-xs text-[#666]">Stock</TableHead>
                  <TableHead className="text-xs text-[#666]">Update Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id} className="border-[#2a2a2a]">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-8 w-8 rounded object-cover border border-[#2a2a2a]"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-xs">
                            {cat.emoji}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-[10px] text-[#555] truncate max-w-[200px]">
                            {p.description || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {p.is_featured ? (
                        <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-[10px]">
                          ★ Featured
                        </Badge>
                      ) : (
                        <span className="text-[#555] text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-400">
                      R{p.wholesale_price}
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${p.stock_level > 0 ? "text-green-400" : "text-red-400"}`}>
                        {p.stock_level}
                      </span>
                      <span className="text-[#555] text-xs ml-1">{cat.unitLabel}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          defaultValue={p.stock_level}
                          className="w-24 h-7 bg-[#0d0d0d] border-[#2a2a2a] text-sm"
                          id={`stock-${p.id}`}
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(`stock-${p.id}`) as HTMLInputElement
                            const val = parseInt(input?.value || "0", 10)
                            onStockUpdate(p.id, val)
                          }}
                          className="h-7 bg-[#FAD03F] hover:bg-[#f5e07a] text-black text-xs px-3"
                        >
                          Save
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

