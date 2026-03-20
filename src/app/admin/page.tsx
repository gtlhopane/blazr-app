"use client"
const WHATSAPP = "27663249083"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, CheckCircle, XCircle, Package, Users, FileText, ShoppingCart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"


interface Application {
  id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  intent_description: string
  expected_volume: string
  status: string
  created_at: string
  companies: { name: string; city: string }
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  created_at: string
  customer_accounts: { buyer_name: string; buyer_email: string; companies: { name: string } }
}

interface Product {
  id: string
  name: string
  category: string
  wholesale_price: number
  moq: number
  is_active: boolean
  categories: { name: string }
}

export default function AdminPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) { router.push("/login"); return }

      // Admin check
      const { data: prof } = await supabase.from("profiles").select("role").eq("id", user.id).single()
      if (prof?.role !== "admin") {
        toast.error("Admin access required")
        router.push("/buyer")
        return
      }

      // Load data in parallel
      const [{ data: apps }, { data: ords }, { data: prods }] = await Promise.all([
        supabase.from("buyer_applications").select("*, companies(name, city)").order("created_at", { ascending: false }),
        supabase.from("orders").select("*, customer_accounts(buyer_name, buyer_email, companies(name))").order("created_at", { ascending: false }).limit(50),
        supabase.from("products").select("*, categories(name)").eq("is_active", true),
      ])

      setApplications((apps as Application[]) || [])
      setOrders((ords as Order[]) || [])
      setProducts((prods as Product[]) || [])
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    const supabase = createClient()
    supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  async function approveApplication(id: string, email: string, name: string) {
    const supabase = createClient()

    // Update application status
    await supabase.from("buyer_applications").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id)

    toast.success(`Application approved for ${name}`)
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" } : a))
  }

  async function rejectApplication(id: string, name: string) {
    const supabase = createClient()
    await supabase.from("buyer_applications").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id)
    toast.success(`Application rejected for ${name}`)
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" } : a))
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient()
    await supabase.from("orders").update({ status }).eq("id", orderId)
    toast.success(`Order ${status}`)
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o))
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

  if (loading) {
    return <div className="flex items-center justify-center py-32 text-slate-400">Loading admin panel...</div>
  }

  const pendingApps = applications.filter((a) => a.status === "pending")
  const approvedApps = applications.filter((a) => a.status === "approved")

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-slate-800/40 bg-[#0b1628]/50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-sm text-slate-400 mt-1">Manage applications, orders, and products</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="border-slate-700 text-slate-400 gap-2">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Pending Applications", value: pendingApps.length, icon: Users, color: "text-yellow-400" },
            { label: "Approved Accounts", value: approvedApps.length, icon: CheckCircle, color: "text-green-400" },
            { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-blue-400" },
            { label: "Products", value: products.length, icon: Package, color: "text-purple-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="card-surface">
              <CardContent className="p-5 flex items-center gap-4">
                <Icon className={`h-5 w-5 ${color}`} />
                <div>
                  <div className={`text-2xl font-bold ${color}`}>{value}</div>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="bg-slate-900/80 border border-slate-800">
            <TabsTrigger value="applications" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Applications ({pendingApps.length})
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Products
            </TabsTrigger>
          </TabsList>

          {/* Applications */}
          <TabsContent value="applications">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle className="text-lg">Buyer Applications</CardTitle>
                <CardDescription className="text-xs">Review and approve wholesale account applications</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {pendingApps.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-500">No pending applications</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800/60 hover:bg-transparent">
                        <TableHead className="text-xs text-slate-500">Business</TableHead>
                        <TableHead className="text-xs text-slate-500">Contact</TableHead>
                        <TableHead className="text-xs text-slate-500">Intent</TableHead>
                        <TableHead className="text-xs text-slate-500">Date</TableHead>
                        <TableHead className="text-xs text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApps.map((app) => (
                        <TableRow key={app.id} className="border-slate-800/60">
                          <TableCell>
                            <div className="font-medium text-sm">{app.companies?.name}</div>
                            <div className="text-xs text-slate-500">{app.companies?.city}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{app.contact_name}</div>
                            <div className="text-xs text-slate-500">{app.contact_email}</div>
                            <div className="text-xs text-slate-600">{app.contact_phone}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs text-slate-400 max-w-[200px] line-clamp-2">{app.intent_description}</div>
                            <div className="text-xs text-slate-600 mt-1">Volume: {app.expected_volume}</div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(app.created_at).toLocaleDateString("ZA")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => approveApplication(app.id, app.contact_email, app.contact_name)} className="bg-green-600 hover:bg-green-500 text-white h-7 text-xs gap-1">
                                <CheckCircle className="h-3 w-3" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => rejectApplication(app.id, app.contact_name)} className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-7 text-xs gap-1">
                                <XCircle className="h-3 w-3" /> Reject
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
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle className="text-lg">All Orders</CardTitle>
                <CardDescription className="text-xs">Manage and track all wholesale orders</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {orders.length === 0 ? (
                  <div className="py-16 text-center text-sm text-slate-500">No orders yet</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800/60 hover:bg-transparent">
                        <TableHead className="text-xs text-slate-500">Order #</TableHead>
                        <TableHead className="text-xs text-slate-500">Customer</TableHead>
                        <TableHead className="text-xs text-slate-500">Total</TableHead>
                        <TableHead className="text-xs text-slate-500">Status</TableHead>
                        <TableHead className="text-xs text-slate-500">Date</TableHead>
                        <TableHead className="text-xs text-slate-500">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="border-slate-800/60">
                          <TableCell className="font-mono text-sm text-slate-300">
                            {order.order_number || order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{order.customer_accounts?.companies?.name}</div>
                            <div className="text-xs text-slate-500">{order.customer_accounts?.buyer_email}</div>
                          </TableCell>
                          <TableCell className="font-semibold text-green-400">
                            R{(order.total || 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status] || "bg-slate-700"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-slate-500">
                            {new Date(order.created_at).toLocaleDateString("ZA")}
                          </TableCell>
                          <TableCell>
                            <select
                              className={`h-7 rounded border px-2 text-xs font-medium ${statusColors[order.status]}`}
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
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

          {/* Products */}
          <TabsContent value="products">
            <Card className="card-surface">
              <CardHeader>
                <CardTitle className="text-lg">Products</CardTitle>
                <CardDescription className="text-xs">{products.length} active products in catalogue</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800/60 hover:bg-transparent">
                      <TableHead className="text-xs text-slate-500">Product</TableHead>
                      <TableHead className="text-xs text-slate-500">Category</TableHead>
                      <TableHead className="text-xs text-slate-500">Price</TableHead>
                      <TableHead className="text-xs text-slate-500">MOQ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((p) => (
                      <TableRow key={p.id} className="border-slate-800/60">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded border border-slate-800 bg-slate-900 flex items-center justify-center text-xs">📦</div>
                            <span className="font-medium text-sm">{p.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-400">{p.categories?.name}</TableCell>
                        <TableCell className="font-semibold text-green-400 text-sm">R{p.wholesale_price}</TableCell>
                        <TableCell className="text-sm text-slate-400">{p.moq}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
