"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, Package, ShoppingCart, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const ADMIN_PASSWORD = "blazr2024"
const VAPE_CATEGORY_ID = "5c53f38c-4003-4971-93ae-797cf7cd0e57"

interface VapeOrder {
  id: string
  status: string
  total: number
  notes: string | null
  created_at: string
}

interface VapeProduct {
  id: string
  name: string
  slug: string
  stock_level: number
  wholesale_price: number
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [orders, setOrders] = useState<VapeOrder[]>([])
  const [products, setProducts] = useState<VapeProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    // Check if already authenticated
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("blazr_admin_token")
      if (stored === ADMIN_PASSWORD) {
        setAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadData()
    }
  }, [authenticated])

  async function loadData() {
    setLoading(true)
    const supabase = createClient()

    // Load orders (all of them, filter by notes containing "Vape")
    const { data: ords } = await supabase
      .from("orders")
      .select("id, status, total, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(100)

    // Load vape products
    const { data: prods } = await supabase
      .from("products")
      .select("id, name, slug, stock_level, wholesale_price")
      .eq("category_id", VAPE_CATEGORY_ID)
      .order("name")

    setOrders((ords as VapeOrder[]) || [])
    setProducts((prods as VapeProduct[]) || [])
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
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

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
    const { error } = await supabase
      .from("products")
      .update({ stock_level: newStock })
      .eq("id", productId)

    if (!error) {
      setProducts((prev) => prev.map((p) => p.id === productId ? { ...p, stock_level: newStock } : p))
      toast.success("Stock updated")
    } else {
      toast.error("Failed to update stock")
    }
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

  // Parse invoice number from notes
  function getInvoiceNumber(notes: string | null): string {
    if (!notes) return "—"
    const match = notes.match(/Invoice:\s*([A-Z0-9-]+)/)
    return match ? match[1] : notes.slice(0, 20)
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌿</div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
            <p className="text-sm text-[#666] mt-1">Enter password to access the admin panel</p>
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

  const vapeOrders = orders // All orders are shown (most recent first)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-[#2a2a2a] bg-[#111]/80 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-[#666] mt-1">Manage vape orders and inventory</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">Vape Wholesale</Badge>
            <Button variant="outline" onClick={handleLogout} className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-400" },
            { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Loader2, color: "text-yellow-400" },
            { label: "Confirmed", value: orders.filter((o) => ["confirmed", "shipped", "delivered"].includes(o.status)).length, icon: CheckCircle, color: "text-green-400" },
            { label: "Vape Products", value: products.length, icon: Package, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="border-[#2a2a2a] bg-[#111]">
              <CardContent className="p-5 flex items-center gap-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <div className={`text-2xl font-bold ${color}`}>{loading ? "—" : value}</div>
                  <p className="text-xs text-[#666]">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#FAD03F]" />
          </div>
        ) : (
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="bg-[#111] border border-[#2a2a2a]">
              <TabsTrigger value="orders" className="data-[state=active]:bg-[#FAD03F] data-[state=active]:text-black">
                <ShoppingCart className="h-4 w-4 mr-2" /> Orders
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-[#FAD03F] data-[state=active]:text-black">
                <Package className="h-4 w-4 mr-2" /> Inventory
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card className="border-[#2a2a2a] bg-[#111]">
                <CardContent className="p-0">
                  {vapeOrders.length === 0 ? (
                    <div className="py-16 text-center text-sm text-[#666]">
                      No orders yet. Orders will appear here when customers submit from the vapes page.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                          <TableHead className="text-xs text-[#666]">Invoice</TableHead>
                          <TableHead className="text-xs text-[#666]">Total</TableHead>
                          <TableHead className="text-xs text-[#666]">Status</TableHead>
                          <TableHead className="text-xs text-[#666]">Date</TableHead>
                          <TableHead className="text-xs text-[#666]">Update Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vapeOrders.map((order) => (
                          <TableRow key={order.id} className="border-[#2a2a2a]">
                            <TableCell className="font-mono text-sm text-[#FAD03F]">
                              {getInvoiceNumber(order.notes)}
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
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                disabled={updatingId === order.id}
                              >
                                {["draft", "pending", "quoted", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inventory Tab */}
            <TabsContent value="inventory">
              <Card className="border-[#2a2a2a] bg-[#111]">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                        <TableHead className="text-xs text-[#666]">Product</TableHead>
                        <TableHead className="text-xs text-[#666]">Price</TableHead>
                        <TableHead className="text-xs text-[#666]">Current Stock</TableHead>
                        <TableHead className="text-xs text-[#666]">Update Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((p) => (
                        <TableRow key={p.id} className="border-[#2a2a2a]">
                          <TableCell>
                            <div className="font-medium text-sm">{p.name}</div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-400">
                            R{p.wholesale_price}
                          </TableCell>
                          <TableCell>
                            <span className={`font-semibold ${p.stock_level > 0 ? "text-green-400" : "text-[#666]"}`}>
                              {p.stock_level}
                            </span>
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
                                  updateStock(p.id, val)
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
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
