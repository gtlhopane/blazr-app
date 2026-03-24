"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, Search, RefreshCw, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react"
import Link from "next/link"

const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsc3Jnc2J6aHVid2V4Ym96ZXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzkyNDg3NywiZXhwIjoyMDg5NTAwODc3fQ.TVrIHztf8V_ZId0XPu2vw6C5RTTBgkcxSaZabKVNQnM"
const SUPABASE_URL = "https://llsrgsbzhubwexbozerg.supabase.co"

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
type PaymentStatus = "awaiting_pop" | "paid" | "failed" | "refunded"

interface OrderItem {
  id: string
  order_id: string
  product_name: string
  category: string
  quantity: number
  unit_price: number
  line_total: number
}

interface Order {
  id: string
  order_number: string
  full_name: string
  business_name: string | null
  email: string
  phone: string
  delivery_address: string | null
  subtotal: number
  total: number
  order_status: OrderStatus
  payment_status: PaymentStatus
  notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
const PAYMENT_STATUSES: PaymentStatus[] = ["awaiting_pop", "paid", "failed", "refunded"]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  shipped: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-400 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  awaiting_pop: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-400 border-gray-500/20",
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  awaiting_pop: "Awaiting POP",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || "bg-gray-500/10 text-gray-400 border-gray-500/20"
  const label = STATUS_LABELS[status] || status
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      {status === "pending" && <Clock className="h-3 w-3" />}
      {status === "delivered" && <CheckCircle className="h-3 w-3" />}
      {status === "shipped" && <Truck className="h-3 w-3" />}
      {status === "awaiting_pop" && <AlertCircle className="h-3 w-3" />}
      {label}
    </span>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString("en-ZA")}`
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<string | null>(null)
  // Local edit state for selected order
  const [editStatus, setEditStatus] = useState<OrderStatus>("pending")
  const [editPayment, setEditPayment] = useState<PaymentStatus>("awaiting_pop")

  async function fetchOrders() {
    setLoading(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/wholesale_orders?order=created_at.desc`, {
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
        },
      })
      const data = await res.json()
      setOrders(data || [])
    } catch (err) {
      console.error("Failed to fetch orders:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  async function selectOrder(order: Order) {
    if (selectedOrder?.id === order.id) return
    // Fetch order items
    const res = await fetch(`${SUPABASE_URL}/rest/v1/wholesale_order_items?order_id=eq.${order.id}`, {
      headers: {
        "apikey": SERVICE_KEY,
        "Authorization": `Bearer ${SERVICE_KEY}`,
      },
    })
    const items = await res.json()
    setSelectedOrder({ ...order, order_items: items || [] })
    setEditStatus(order.order_status)
    setEditPayment(order.payment_status)
    setUpdateMsg(null)
  }

  async function handleUpdate() {
    if (!selectedOrder) return
    setUpdating(true)
    setUpdateMsg(null)
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/wholesale_orders?id=eq.${selectedOrder.id}`, {
        method: "PATCH",
        headers: {
          "apikey": SERVICE_KEY,
          "Authorization": `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify({
          order_status: editStatus,
          payment_status: editPayment,
          updated_at: new Date().toISOString(),
        }),
      })
      if (res.ok) {
        const [updated] = await res.json()
        setSelectedOrder({ ...selectedOrder, order_status: editStatus, payment_status: editPayment, updated_at: updated.updated_at })
        setOrders((prev) => prev.map((o) => o.id === selectedOrder.id ? { ...o, order_status: editStatus, payment_status: editPayment } : o))
        setUpdateMsg("✓ Order updated successfully")
      } else {
        setUpdateMsg("✗ Update failed")
      }
    } catch (err) {
      setUpdateMsg("✗ Update failed")
    } finally {
      setUpdating(false)
    }
  }

  const filtered = orders.filter((o) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      o.order_number?.toLowerCase().includes(q) ||
      o.full_name?.toLowerCase().includes(q) ||
      o.email?.toLowerCase().includes(q) ||
      o.phone?.includes(q)
    )
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-[#1e1e1e] bg-[#111] px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/admin" className="text-sm text-[#737373] hover:text-white transition-colors">Admin</Link>
              <span className="text-[#333]">/</span>
              <span className="text-sm text-white">Orders</span>
            </div>
            <h1 className="text-xl font-bold text-[#FAD03F]" style={{ fontFamily: "var(--font-boldena), sans-serif" }}>
              Wholesale Orders
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchOrders}
              variant="outline"
              size="sm"
              className="border-[#2a2a2a] text-[#888] hover:bg-[#1a1a1a] hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555]" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order number, name, email or phone..."
            className="pl-9 border-[#2a2a2a] bg-[#111] text-white placeholder:text-[#555] h-10"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Orders table */}
          <div className={`${selectedOrder ? "lg:col-span-2" : "lg:col-span-5"}`}>
            {loading ? (
              <div className="text-center py-16 text-[#555]">Loading orders...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-[#555]">
                {search ? "No orders match your search." : "No orders yet."}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((order) => (
                  <button
                    key={order.id}
                    onClick={() => selectOrder(order)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      selectedOrder?.id === order.id
                        ? "border-[#FAD03F]/50 bg-[#FAD03F]/5"
                        : "border-[#1e1e1e] bg-[#111] hover:border-[#2a2a2a] hover:bg-[#141414]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-sm font-semibold text-[#FAD03F]">{order.order_number}</span>
                        <p className="text-sm font-medium text-white mt-0.5">{order.full_name}</p>
                        {order.business_name && (
                          <p className="text-xs text-[#737373]">{order.business_name}</p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-white">{formatPrice(order.total)}</p>
                        <p className="text-xs text-[#555] mt-0.5">{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={order.order_status} />
                      <StatusBadge status={order.payment_status} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Order detail panel */}
          {selectedOrder && (
            <div className="lg:col-span-3">
              <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden sticky top-6">
                {/* Panel header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                  <div>
                    <p className="font-mono text-base font-bold text-[#FAD03F]">{selectedOrder.order_number}</p>
                    <p className="text-xs text-[#555] mt-0.5">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-[#555] hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-5 space-y-5">
                  {/* Status controls */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#737373]">Order Status</Label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                        className="w-full h-10 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] text-white text-sm px-3 appearance-none"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-[#737373]">Payment Status</Label>
                      <select
                        value={editPayment}
                        onChange={(e) => setEditPayment(e.target.value as PaymentStatus)}
                        className="w-full h-10 rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] text-white text-sm px-3 appearance-none"
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="w-full bg-[#FAD03F] hover:bg-[#f5e07a] text-black font-bold"
                  >
                    {updating ? "Updating..." : "Update Order"}
                  </Button>

                  {updateMsg && (
                    <p className={`text-sm text-center ${updateMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
                      {updateMsg}
                    </p>
                  )}

                  <div className="h-px bg-[#1e1e1e]" />

                  {/* Buyer details */}
                  <div>
                    <h3 className="text-xs text-[#737373] uppercase tracking-wider mb-3">Buyer</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#555]">Name</span>
                        <span className="text-white font-medium">{selectedOrder.full_name}</span>
                      </div>
                      {selectedOrder.business_name && (
                        <div className="flex justify-between">
                          <span className="text-[#555]">Company</span>
                          <span className="text-white">{selectedOrder.business_name}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-[#555]">Email</span>
                        <a href={`mailto:${selectedOrder.email}`} className="text-[#FAD03F] hover:underline">
                          {selectedOrder.email}
                        </a>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#555]">Phone</span>
                        <span className="text-white">{selectedOrder.phone}</span>
                      </div>
                      {selectedOrder.delivery_address && (
                        <div className="flex justify-between">
                          <span className="text-[#555]">Delivery</span>
                          <span className="text-white text-right max-w-[60%]">{selectedOrder.delivery_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-[#1e1e1e]" />

                  {/* Financials */}
                  <div>
                    <h3 className="text-xs text-[#737373] uppercase tracking-wider mb-3">Financials</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#555]">Subtotal</span>
                        <span className="text-white">{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-[#1e1e1e] pt-2 mt-2">
                        <span className="text-white">Total</span>
                        <span className="text-[#FAD03F] text-lg">{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <>
                      <div className="h-px bg-[#1e1e1e]" />
                      <div>
                        <h3 className="text-xs text-[#737373] uppercase tracking-wider mb-2">Notes</h3>
                        <p className="text-sm text-[#aaa]">{selectedOrder.notes}</p>
                      </div>
                    </>
                  )}

                  <div className="h-px bg-[#1e1e1e]" />

                  {/* Order items */}
                  <div>
                    <h3 className="text-xs text-[#737373] uppercase tracking-wider mb-3">
                      Items ({selectedOrder.order_items?.length || 0})
                    </h3>
                    {selectedOrder.order_items && selectedOrder.order_items.length > 0 ? (
                      <div className="space-y-2">
                        {selectedOrder.order_items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between rounded-lg border border-[#1e1e1e] bg-[#0a0a0a] px-3 py-2.5">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-white truncate">{item.product_name}</p>
                              <p className="text-xs text-[#555]">{item.category} · Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right ml-3">
                              <p className="text-sm font-semibold text-[#FAD03F]">{formatPrice(item.line_total)}</p>
                              <p className="text-xs text-[#555]">R{(item.unit_price / 100).toFixed(0)}/unit</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-[#555]">No items loaded.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
