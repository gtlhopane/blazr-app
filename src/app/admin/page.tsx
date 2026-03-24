"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LogOut, ShoppingCart, Loader2, ChevronRight, X, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import Link from "next/link"

const ADMIN_PASSWORD = "blazr2024"

// ─── Types ─────────────────────────────────────────────────────────────────────
interface WholesaleOrder {
  id: string
  order_number: string
  full_name: string
  business_name: string | null
  email: string
  phone: string
  delivery_address: string
  subtotal: number
  total: number
  order_status: string
  payment_status: string
  notes: string | null
  created_at: string
  updated_at: string
}

interface WholesaleOrderItem {
  id: string
  order_id: string
  product_name: string
  category: string | null
  quantity: number
  unit_price: number
  line_total: number
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "completed", label: "Completed" },
]

const PAYMENT_STATUS_OPTIONS = [
  { value: "awaiting_pop", label: "Awaiting PoP" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
]

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  packed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  dispatched: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  awaiting_pop: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
}

function formatPrice(amount: number): string {
  return `R${(amount || 0).toLocaleString("en-ZA")}`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [orders, setOrders] = useState<WholesaleOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<WholesaleOrder | null>(null)
  const [orderItems, setOrderItems] = useState<WholesaleOrderItem[]>([])
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")

  // ── Auth ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("blazr_admin_token")
      if (stored === ADMIN_PASSWORD) setAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (authenticated) loadOrders()
  }, [authenticated])

  async function loadOrders() {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("wholesale_orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (!error && data) {
      setOrders(data as WholesaleOrder[])
    }
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
  }

  async function openOrderDetail(order: WholesaleOrder) {
    setSelectedOrder(order)
    setLoadingDetails(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("wholesale_order_items")
      .select("*")
      .eq("order_id", order.id)
      .order("id")
    setOrderItems((data as WholesaleOrderItem[]) || [])
    setLoadingDetails(false)
  }

  async function updateOrderStatus(orderId: string, field: "order_status" | "payment_status", value: string) {
    setUpdatingId(orderId)
    const supabase = createClient()
    const update: Record<string, string> = { [field]: value }
    if (field === "order_status") update.updated_at = new Date().toISOString()

    const { error } = await supabase
      .from("wholesale_orders")
      .update(update)
      .eq("id", orderId)

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o))
      )
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => prev ? { ...prev, [field]: value } : null)
      }
      toast.success(`Updated ${field} to "${value}"`)
    } else {
      toast.error("Failed to update")
    }
    setUpdatingId(null)
  }

  // ── Login Screen ─────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">🌿</div>
            <h1 className="text-2xl font-bold">Blazr Admin</h1>
            <p className="text-sm text-[#666] mt-1">Wholesale order management</p>
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

  // ── Filtered orders ──────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      !search.trim() ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.business_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === "all" || o.order_status === statusFilter
    const matchPayment = paymentFilter === "all" || o.payment_status === paymentFilter
    return matchSearch && matchStatus && matchPayment
  })

  const pendingCount = orders.filter((o) => o.order_status === "pending").length
  const paidCount = orders.filter((o) => o.payment_status === "paid").length
  const awaitingPopCount = orders.filter((o) => o.payment_status === "awaiting_pop").length

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-[#2a2a2a] bg-[#0d0d0d] flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌿</span>
            <div>
              <p className="font-bold text-sm text-white">Blazr</p>
              <p className="text-[10px] text-[#666]">Wholesale Portal</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-3 mb-2">
            <p className="text-[10px] text-[#555] uppercase tracking-wider font-medium px-2">Management</p>
          </div>
          <div className="px-5 py-3 text-sm bg-[#FAD03F]/10 text-[#FAD03F] border-r-2 border-[#FAD03F] flex items-center gap-3">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-medium">Wholesale Orders</span>
          </div>
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-5 py-3 text-sm transition-colors text-[#888] hover:text-white hover:bg-[#1a1a1a]"
          >
            <span className="text-lg">🏠</span>
            <span>Storefront</span>
          </Link>
        </div>

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
        <header className="border-b border-[#2a2a2a] bg-[#111]/80 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#FAD03F]" />
              Wholesale Orders
            </h1>
            <p className="text-xs text-[#666] mt-0.5">
              {orders.length} total orders
            </p>
          </div>
          <Badge className="bg-[#FAD03F]/10 text-[#FAD03F] border-[#FAD03F]/20 text-xs">
            Wholesale
          </Badge>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-[#FAD03F]" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { label: "Total Orders", value: orders.length, color: "text-white" },
                  { label: "Pending", value: pendingCount, color: "text-yellow-400" },
                  { label: "Awaiting Payment", value: awaitingPopCount, color: "text-orange-400" },
                  { label: "Paid", value: paidCount, color: "text-green-400" },
                ].map(({ label, value, color }) => (
                  <Card key={label} className="border-[#2a2a2a] bg-[#111]">
                    <CardContent className="p-5">
                      <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      <p className="text-xs text-[#666] mt-1">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders, names, emails..."
                  className="max-w-xs bg-[#111] border-[#2a2a2a] h-9 text-sm"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-9 rounded border border-[#2a2a2a] bg-[#111] px-3 text-sm text-[#888] hover:text-white cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  {ORDER_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="h-9 rounded border border-[#2a2a2a] bg-[#111] px-3 text-sm text-[#888] hover:text-white cursor-pointer"
                >
                  <option value="all">All Payments</option>
                  {PAYMENT_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <span className="text-xs text-[#666] self-center ml-auto">
                  {filteredOrders.length} orders
                </span>
              </div>

              {/* Orders Table */}
              <Card className="border-[#2a2a2a] bg-[#111]">
                <CardContent className="p-0">
                  {filteredOrders.length === 0 ? (
                    <div className="py-20 text-center text-sm text-[#666]">
                      No orders found.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#2a2a2a] hover:bg-transparent">
                          <TableHead className="text-xs text-[#666]">Order #</TableHead>
                          <TableHead className="text-xs text-[#666]">Customer</TableHead>
                          <TableHead className="text-xs text-[#666]">Email</TableHead>
                          <TableHead className="text-xs text-[#666]">Total</TableHead>
                          <TableHead className="text-xs text-[#666]">Order Status</TableHead>
                          <TableHead className="text-xs text-[#666]">Payment</TableHead>
                          <TableHead className="text-xs text-[#666]">Date</TableHead>
                          <TableHead className="text-xs text-[#666]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow
                            key={order.id}
                            className="border-[#2a2a2a] hover:bg-[#1a1a1a] cursor-pointer"
                            onClick={() => openOrderDetail(order)}
                          >
                            <TableCell>
                              <span className="font-mono text-sm text-[#FAD03F] font-semibold">
                                {order.order_number}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="text-sm font-medium text-white">{order.full_name}</p>
                                {order.business_name && (
                                  <p className="text-xs text-[#666]">{order.business_name}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#888]">{order.email}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm font-semibold text-white">
                                {formatPrice(order.total)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={ORDER_STATUS_COLORS[order.order_status] || "bg-slate-700"}>
                                {order.order_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={PAYMENT_STATUS_COLORS[order.payment_status] || "bg-slate-700"}>
                                {order.payment_status === "awaiting_pop" ? "Awaiting PoP" : order.payment_status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs text-[#666]">
                                {formatDate(order.created_at)}
                              </span>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-2">
                                {/* Inline status editors */}
                                <select
                                  className="h-7 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-1.5 text-xs text-[#888] hover:text-white cursor-pointer"
                                  value={order.order_status}
                                  onChange={(e) => {
                                    if (e.target.value !== order.order_status) {
                                      updateOrderStatus(order.id, "order_status", e.target.value)
                                    }
                                  }}
                                  disabled={updatingId === order.id}
                                >
                                  {ORDER_STATUS_OPTIONS.map((o) => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                  ))}
                                </select>
                                <ChevronRight className="h-4 w-4 text-[#555]" />
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
          )}
        </div>
      </div>

      {/* ── Order Detail Sheet ─────────────────────────────────────────────── */}
      <Sheet open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="w-full max-w-lg bg-[#111] border-[#2a2a2a] overflow-y-auto">
          {selectedOrder && (
            <>
              <SheetHeader className="border-b border-[#2a2a2a] pb-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-[#FAD03F] font-mono text-lg">
                      {selectedOrder.order_number}
                    </SheetTitle>
                    <p className="text-xs text-[#666] mt-1">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrder(null)}
                    className="text-[#666] hover:text-white h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              {loadingDetails ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-[#FAD03F]" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Status editors */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-[#666] mb-1.5 block">Order Status</Label>
                      <select
                        className="w-full h-9 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white cursor-pointer"
                        value={selectedOrder.order_status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, "order_status", e.target.value)}
                        disabled={updatingId === selectedOrder.id}
                      >
                        {ORDER_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-[#666] mb-1.5 block">Payment Status</Label>
                      <select
                        className="w-full h-9 rounded border border-[#2a2a2a] bg-[#0d0d0d] px-3 text-sm text-white cursor-pointer"
                        value={selectedOrder.payment_status}
                        onChange={(e) => updateOrderStatus(selectedOrder.id, "payment_status", e.target.value)}
                        disabled={updatingId === selectedOrder.id}
                      >
                        {PAYMENT_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2">
                    <Badge className={ORDER_STATUS_COLORS[selectedOrder.order_status] || "bg-slate-700"}>
                      {selectedOrder.order_status}
                    </Badge>
                    <Badge className={PAYMENT_STATUS_COLORS[selectedOrder.payment_status] || "bg-slate-700"}>
                      {selectedOrder.payment_status === "awaiting_pop" ? "Awaiting PoP" : selectedOrder.payment_status}
                    </Badge>
                  </div>

                  {/* Totals */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-3">
                      <p className="text-xs text-[#666]">Subtotal</p>
                      <p className="text-lg font-bold text-white mt-0.5">{formatPrice(selectedOrder.subtotal)}</p>
                    </div>
                    <div className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-3">
                      <p className="text-xs text-[#666]">Total</p>
                      <p className="text-lg font-bold text-[#FAD03F] mt-0.5">{formatPrice(selectedOrder.total)}</p>
                    </div>
                  </div>

                  {/* Buyer info */}
                  <div>
                    <h3 className="text-xs text-[#666] uppercase tracking-wider mb-3">Buyer Information</h3>
                    <div className="space-y-2 text-sm rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4">
                      <div className="flex justify-between">
                        <span className="text-[#666]">Name</span>
                        <span className="text-white font-medium">{selectedOrder.full_name}</span>
                      </div>
                      {selectedOrder.business_name && (
                        <div className="flex justify-between">
                          <span className="text-[#666]">Business</span>
                          <span className="text-white">{selectedOrder.business_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#666]">Email</span>
                        <a href={`mailto:${selectedOrder.email}`} className="text-[#FAD03F] hover:underline">
                          {selectedOrder.email}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#666]">Phone</span>
                        <span className="text-white">{selectedOrder.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery address */}
                  <div>
                    <h3 className="text-xs text-[#666] uppercase tracking-wider mb-3">Delivery Address</h3>
                    <div className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4 text-sm text-[#ccc]">
                      {selectedOrder.delivery_address}
                    </div>
                  </div>

                  {/* Order items */}
                  {orderItems.length > 0 && (
                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider mb-3">Order Items</h3>
                      <div className="space-y-2">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-3 text-sm"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white truncate">{item.product_name}</p>
                              {item.category && (
                                <p className="text-xs text-[#666]">{item.category}</p>
                              )}
                              <p className="text-xs text-[#888] mt-0.5">
                                {item.quantity} × {formatPrice(item.unit_price)}
                              </p>
                            </div>
                            <p className="font-semibold text-[#FAD03F] ml-4 flex-shrink-0">
                              {formatPrice(item.line_total)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="text-xs text-[#666] uppercase tracking-wider mb-3">Notes</h3>
                      <div className="rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] p-4 text-sm text-[#ccc]">
                        {selectedOrder.notes}
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-[#555] border-t border-[#2a2a2a] pt-4 space-y-1">
                    <p>Created: {formatDate(selectedOrder.created_at)}</p>
                    <p>Updated: {formatDate(selectedOrder.updated_at)}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
